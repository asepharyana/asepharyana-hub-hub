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
