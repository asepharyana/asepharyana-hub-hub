export interface Service {
  name: string;
  state: string;
  hasWeb: boolean;
}

export interface Trace {
  service: string;
  operation: string;
  duration: number;
  spans: number;
  hasError: boolean;
}

export interface DashboardData {
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

export function safeDur(us: number): string {
  if (us < 1000) return `${us}\u00b5s`;
  if (us < 1_000_000) return `${(us / 1000).toFixed(1)}ms`;
  return `${(us / 1_000_000).toFixed(2)}s`;
}

export function gaugeColor(v: number | null): string {
  if (v === null) return "#3fb950";
  if (v > 80) return "#f85149";
  if (v > 60) return "#d29922";
  return "#3fb950";
}

export function serviceIndicator(state: string): string {
  switch (state) {
    case "running":
      return "bg-green-400";
    case "jaeger":
      return "bg-blue-400";
    default:
      return "bg-red-400";
  }
}

export function fmtUptime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}
