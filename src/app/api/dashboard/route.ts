import { NextResponse } from 'next/server';
import http from 'node:http';

const JAEGER = 'http://jaeger:16686';
const PROMETHEUS = 'http://prometheus:9090';
const DOCKER_SOCK = '/var/run/docker.sock';

interface Container {
  Names: string[];
  State: string;
  Labels: Record<string, string>;
  NetworkSettings?: { Networks?: Record<string, unknown> };
}

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

function dockerFetch(path: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    http.get({ socketPath: DOCKER_SOCK, path }, (res) => {
      let data = '';
      res.on('data', (c: string) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    }).on('error', reject);
  });
}

async function fetchJSON(url: string): Promise<unknown> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return res.json();
  } catch {
    return null;
  }
}

function parseServices(containers: Container[]): Service[] {
  const project = containers.find((c) => c.Labels['com.docker.compose.project'])
    ?.Labels['com.docker.compose.project'];

  return containers
    .filter((c) => {
      if (!c.NetworkSettings?.Networks?.['app-shared-net']) return false;
      if (project && c.Labels['com.docker.compose.project'] !== project) return false;
      return true;
    })
    .map((c) => ({
      name: c.Names[0].replace(/^\//, ''),
      state: c.State,
      hasWeb: Object.keys(c.Labels).some(
        (k) => k.startsWith('traefik.http.routers.') && k.endsWith('.rule'),
      ),
    }));
}

async function fetchTraces(): Promise<Trace[]> {
  const svcRes = await fetchJSON(`${JAEGER}/api/services`);
  if (!svcRes || !Array.isArray((svcRes as { data?: string[] }).data)) return [];

  const now = Date.now() * 1000;
  const start = now - 5 * 60 * 1_000_000;
  const all: Trace[] = [];

  for (const service of (svcRes as { data: string[] }).data) {
    const d = await fetchJSON(
      `${JAEGER}/api/traces?service=${encodeURIComponent(service)}&start=${start}&end=${now}&limit=5&lookback=5m`,
    );
    if (!d || !Array.isArray((d as { data?: unknown[] }).data)) continue;

    for (const t of (d as { data: { duration: number; spans: { operationName: string; processID: string; tags: { key: string; value: unknown }[] }[]; processes: Record<string, { serviceName: string }> }[] }).data) {
      if (!t.spans?.length) continue;
      const span = t.spans[0];
      const svc = t.processes[span.processID]?.serviceName || 'unknown';
      const hasError = t.spans.some((s) =>
        s.tags?.some((tag) => tag.key === 'error' && tag.value === true),
      );
      all.push({
        service: svc,
        operation: span.operationName,
        duration: t.duration,
        spans: t.spans.length,
        hasError,
      });
    }
  }

  return all.sort((a, b) => b.duration - a.duration).slice(0, 20);
}

async function promRange(query: string, steps = 20): Promise<number[]> {
  const now = Math.floor(Date.now() / 1000);
  const u = `${PROMETHEUS}/api/v1/query_range?query=${encodeURIComponent(query)}&start=${now - 300}&end=${now}&step=${(300 / steps).toFixed(0)}`;
  const d = await fetchJSON(u);
  const result = (d as { data?: { result?: { values?: unknown[][] }[] } })?.data?.result;
  if (!result?.[0]?.values) return [];
  return result[0].values.map((v) => { const f = parseFloat(v[1] as string); return isNaN(f) ? 0 : f; });
}

async function promQuery(query: string): Promise<number | null> {
  const d = await fetchJSON(
    `${PROMETHEUS}/api/v1/query?query=${encodeURIComponent(query)}`,
  );
  const result = (d as { data?: { result?: { value?: unknown[] }[] } })?.data?.result;
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
}

export async function GET() {
  const [containersRaw] = await Promise.all([
    dockerFetch('/containers/json?all=true') as Promise<Container[]>,
  ]);

  const containers = Array.isArray(containersRaw) ? containersRaw : [];
  const services = parseServices(containers);

  const [traces, cpu, ram, disk, load1, load5, load15, netIn, netOut, rps, latency, errors] =
    await Promise.all([
      fetchTraces(),
      promQuery(`100 - (avg by(instance)(rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`),
      promQuery(`(1 - node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100`),
      promQuery(`(1 - node_filesystem_avail_bytes{mountpoint="/",fstype!="tmpfs"} / node_filesystem_size_bytes{mountpoint="/",fstype!="tmpfs"}) * 100`),
      promQuery('node_load1'),
      promQuery('node_load5'),
      promQuery('node_load15'),
      promQuery(`rate(node_network_receive_bytes_total{device!="lo"}[1m])`),
      promQuery(`rate(node_network_transmit_bytes_total{device!="lo"}[1m])`),
      promRange('sum(rate(traefik_service_requests_total[1m]))'),
      promRange('avg(traefik_service_request_duration_ms_sum / traefik_service_request_duration_ms_count)'),
      promRange('sum(rate(traefik_service_requests_total{code=~"5.."}[1m]))'),
    ]);

  const links: { url: string; label: string }[] = [
    { url: '/jaeger', label: 'Jaeger UI' },
  ];
  if (containers.some((c) => c.Names?.some((n) => n.includes('prometheus')))) {
    links.push({ url: '/api/prometheus/targets', label: 'Prometheus' });
  }
  links.push({ url: 'https://github.com/asepharyana/asepharyana-hub', label: 'GitHub' });

  const domains = ['asepharyana.my.id', 'asepharyana.web.id'];
  for (const s of services) {
    if (s.hasWeb && s.state === 'running') {
      links.push({ url: `https://${s.name}.${domains[0]}`, label: s.name });
    }
  }

  const traceVolume = [traces.length];

  const data: DashboardData = {
    services,
    traces,
    node: { cpu, ram, disk, load1, load5, load15, netIn, netOut },
    rps, latency, errors, traceVolume,
    links,
  };

  return NextResponse.json(data);
}
