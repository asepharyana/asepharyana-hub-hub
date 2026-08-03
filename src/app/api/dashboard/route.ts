import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

const PROMETHEUS = "http://127.0.0.1:9090";

interface Trace {
  service: string;
  operation: string;
  duration: number;
  spans: number;
  hasError: boolean;
}

interface Service {
  name: string;
  state: string;
  hasWeb: boolean;
}

// Service-owning systemd units that should show up on the dashboard.
// GMW, Booster, etc. are listed even though they are headless (no web).
const MONITORED_UNITS = [
  "caddy",
  "9router",
  "booster-role",
  "gmw-backend",
  "gmw-discord-gateway",
  "hub",
  "lidm-backend",
  "lidm-frontend",
  "llm-api",
  "nats",
  "node-exporter",
  "otel",
  "pr-agent-server",
  "prometheus",
  "scraper",
  "teleuploader",
  "tools-frontend",
  "tools-gateway",
  "tools-workers",
  "zeavis-api",
  "zeavis-ml-service",
  "zeavis-web",
];

// Units with a public HTTPS site behind Caddy.
const WEB_UNITS = new Set([
  "caddy",
  "9router",
  "hub",
  "lidm-frontend",
  "pr-agent-server",
  "scraper",
  "teleuploader",
  "tools-frontend",
  "zeavis-web",
]);

async function systemdServices(): Promise<Service[]> {
  const services: Service[] = [];
  for (const unit of MONITORED_UNITS) {
    try {
      const { stdout } = await execFileAsync("systemctl", [
        "show",
        `${unit}.service`,
        "-p",
        "ActiveState",
        "-p",
        "LoadState",
        "--no-pager",
      ]);
      const state = stdout.match(/ActiveState=(\w+)/)?.[1] ?? "unknown";
      services.push({
        name: unit,
        state: state === "active" ? "running" : state,
        hasWeb: WEB_UNITS.has(unit),
      });
    } catch {
      // unit doesn't exist — skip silently
    }
  }
  return services;
}

async function fetchJSON(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.json();
  } catch {
    return null;
  }
}

async function promRange(query: string, steps = 20): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const u = `${PROMETHEUS}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${now - 300}&end=${now}&step=${(300 / steps).toFixed(0)}`;
  const d = await fetchJSON(u);
  const result = (d as { data?: { result?: { values?: unknown[][] }[] } })?.data
    ?.result;
  if (!result?.[0]?.values) return [];
  return result[0].values.map((v) => {
    const f = parseFloat(v[1] as string);
    return Number.isNaN(f) ? 0 : f;
  });
}

async function promQuery(query: string): Promise<number | null> {
  const d = await fetchJSON(
    `${PROMETHEUS}/api/v1/query?query=${encodeURIComponent(query)}`,
  );
  const result = (d as { data?: { result?: { value?: unknown[] }[] } })?.data
    ?.result;
  if (!result?.length) return null;
  const val = result[0].value?.[1];
  return val ? parseFloat(val as string) : null;
}

interface DashboardData {
  services: Service[];
  traces: Trace[];
  node: {
    cpu: number | null;
    ram: number | null;
    disk: number | null;
    load1: number | null;
    load5: number | null;
    load15: number | null;
    netIn: number | null;
    netOut: number | null;
  };
  rps: number[];
  latency: number[];
  errors: number[];
  traceVolume: number[];
  links: { url: string; label: string }[];
  llm: {
    reqRate: number | null;
    tokRate: number | null;
    tokSpeed: number | null;
    uptime: number | null;
    reqSpark: number[];
    tokSpark: number[];
  };
}

export async function GET() {
  const services = await systemdServices();

  const [
    cpu,
    ram,
    disk,
    load1,
    load5,
    load15,
    netIn,
    netOut,
    rps,
    latency,
    errors,
    traceVolume,
  ] = await Promise.all([
    promQuery(
      `100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`,
    ),
    promQuery(
      `(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100`,
    ),
    promQuery(
      `(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!="tmpfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="tmpfs"}) * 100`,
    ),
    promQuery("node_load1"),
    promQuery("node_load5"),
    promQuery("node_load15"),
    promQuery(`rate(node_network_receive_bytes_total{device!="lo"}[1m])`),
    promQuery(`rate(node_network_transmit_bytes_total{device!="lo"}[1m])`),
    promRange('sum(rate(node_network_receive_bytes_total{device!="lo"}[1m]))'),
    promRange("avg(node_load1)"),
    promRange('sum(rate(node_network_transmit_bytes_total{device!="lo"}[1m]))'),
    promQuery("count(up)"),
  ]);

  // ── LLM inference metrics (llm-api /metrics) ──
  const [
    llmReqRate,
    llmTokRate,
    llmTokSpeed,
    llmUptime,
    llmReqSpark,
    llmTokSpark,
  ] = await Promise.all([
    promQuery(
      `sum(rate(llm_api_requests_total{service="llm-api"}[5m]))`,
    ),
    promQuery(
      `sum(rate(llm_api_completion_tokens_total{service="llm-api"}[5m]))`,
    ),
    promQuery(
      `avg(llm_api_tokens_per_second{service="llm-api"})`,
    ),
    promQuery(`llm_api_uptime_seconds{service="llm-api"}`),
    promRange(
      `sum(rate(llm_api_requests_total{service="llm-api"}[1m]))`,
    ),
    promRange(
      `sum(rate(llm_api_completion_tokens_total{service="llm-api"}[1m]))`,
    ),
  ]);

  const links: { url: string; label: string }[] = [
    { url: "https://github.com/asepharyana/asepharyana-hub", label: "GitHub" },
  ];
  const domains = ["asepharyana.my.id"];
  for (const s of services) {
    if (s.hasWeb && s.state === "running") {
      links.push({ url: `https://${s.name}.${domains[0]}`, label: s.name });
    }
  }

  const data: DashboardData = {
    services,
    traces: [],
    node: { cpu, ram, disk, load1, load5, load15, netIn, netOut },
    rps,
    latency,
    errors,
    traceVolume: traceVolume ? [traceVolume] : [],
    links,
    llm: {
      reqRate: llmReqRate,
      tokRate: llmTokRate,
      tokSpeed: llmTokSpeed,
      uptime: llmUptime,
      reqSpark: llmReqSpark,
      tokSpark: llmTokSpark,
    },
  };

  return NextResponse.json(data);
}
