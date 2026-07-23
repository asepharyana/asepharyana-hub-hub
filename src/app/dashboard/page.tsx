"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Service {
  name: string;
  state: string;
  hasWeb: boolean;
}

interface Trace {
  service: string;
  operation: string;
  duration: number;
  spans: number;
  hasError: boolean;
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

function safeDur(us: number): string {
  if (us < 1000) return `${us}µs`;
  if (us < 1_000_000) return `${(us / 1000).toFixed(1)}ms`;
  return `${(us / 1_000_000).toFixed(2)}s`;
}

function Donut({ running, degraded }: { running: number; degraded: number }) {
  const total = running + degraded;
  if (!total) return <NoData />;

  const cx = 100,
    cy = 90,
    R = 60,
    circ = 2 * Math.PI * R;
  const segs = [
    { n: running, c: "#3fb950", l: "Running" },
    { n: degraded, c: "#d29922", l: "Degraded" },
  ];

  let off = 0;
  return (
    <svg width={200} height={210} viewBox="0 0 200 210">
      {segs.map((s) => {
        if (!s.n) return null;
        const frac = s.n / total;
        const ln = frac * circ;
        const el = (
          <circle
            key={s.l}
            cx={cx}
            cy={cy}
            r={R}
            fill="none"
            stroke={s.c}
            strokeWidth={14}
            strokeDasharray={`${ln} ${circ - ln}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        );
        off += ln;
        return el;
      })}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fill="#e6edf3"
        fontSize={26}
        fontWeight={700}
        fontFamily="system-ui,sans-serif"
      >
        {total}
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#8b949e"
        fontSize={10}
        fontFamily="system-ui,sans-serif"
      >
        total
      </text>
      {segs
        .filter((s) => s.n)
        .map((s, i) => (
          <g key={s.l}>
            <circle cx={16} cy={165 + i * 16} r={4} fill={s.c} />
            <text
              x={26}
              y={168 + i * 16}
              fill="#8b949e"
              fontSize={10}
              fontFamily="system-ui,sans-serif"
            >
              {s.l}: {s.n}
            </text>
          </g>
        ))}
    </svg>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 300,
    h = 160,
    pl = 45,
    pt = 20,
    pr = 10,
    pb = 25;
  const vw = w - pl - pr,
    vh = h - pt - pb;
  if (!data.length) return <NoData />;

  const maxV = Math.max(...data.map(Math.abs), 1);

  const pts = data
    .map(
      (v, i) =>
        `${(pl + (vw * i) / (data.length - 1)).toFixed(1)},${(pt + vh * (1 - v / maxV)).toFixed(1)}`,
    )
    .join(" ");

  const area = `M${pl},${pt + vh} L${pts} L${pl + vw},${pt + vh} Z`;
  const lv = data[data.length - 1];
  const ly = pt + vh * (1 - lv / maxV);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = pt + (vh * i) / 4;
        return (
          <g key={i}>
            <line
              x1={pl}
              y1={y}
              x2={pl + vw}
              y2={y}
              stroke="#21262d"
              strokeWidth={1}
            />
            <text
              x={pl - 6}
              y={y + 3}
              textAnchor="end"
              fill="#6e7681"
              fontSize={9}
              fontFamily="system-ui,sans-serif"
            >
              {(maxV * (1 - i / 4)).toFixed(0)}
            </text>
          </g>
        );
      })}
      <path d={area} fill={color} opacity={0.15} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <text
        x={pl + vw}
        y={ly - 10}
        textAnchor="end"
        fill={color}
        fontSize={11}
        fontWeight={600}
        fontFamily="system-ui,sans-serif"
      >
        {lv.toFixed(1)}
      </text>
      {data.length > 5 &&
        [...Array(5)].map((_, i) => {
          const idx = Math.floor(((i + 1) * (data.length - 1)) / 5);
          const x = pl + (vw * idx) / (data.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={pt + vh + 16}
              textAnchor="middle"
              fill="#6e7681"
              fontSize={9}
              fontFamily="system-ui,sans-serif"
            >
              {idx + 1}
            </text>
          );
        })}
    </svg>
  );
}

function Gauge({
  pct,
  color,
  label,
  unit,
}: {
  pct: number | null;
  color: string;
  label: string;
  unit: string;
}) {
  if (pct === null || pct <= 0) return <NoData />;
  const w = 220,
    h = 100,
    bw = 200,
    bh = 14;
  const bx = (w - bw) / 2,
    by = 30;
  const fw = bw * Math.min(pct / 100, 1);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={bx} y={by} width={bw} height={bh} rx={7} ry={7} fill="#1c2333" />
      {fw > 0 && (
        <rect
          x={bx}
          y={by}
          width={fw}
          height={bh}
          rx={7}
          ry={7}
          fill={color}
          opacity={0.85}
        />
      )}
      <text
        x={w / 2}
        y={14}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={11}
        fontWeight={600}
        fill={color}
      >
        {label}
      </text>
      <text
        x={w / 2}
        y={by + bh + 24}
        textAnchor="middle"
        fontFamily="system-ui,sans-serif"
        fontSize={14}
        fontWeight={700}
        fill="#e6edf3"
      >
        {pct.toFixed(1)}
        {unit}
      </text>
    </svg>
  );
}

function NoData() {
  return (
    <svg width={200} height={100} viewBox="0 0 200 100">
      <text
        x={100}
        y={50}
        textAnchor="middle"
        fill="#6e7681"
        fontSize={12}
        fontFamily="system-ui,sans-serif"
      >
        No data
      </text>
    </svg>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) setData(await res.json());
      } catch {
        /* ignore */
      }
    };
    fetchData();
    const id = setInterval(fetchData, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);

  const running =
    data?.services.filter((s) => s.state === "running").length ?? 0;
  const degraded = (data?.services.length ?? 0) - running;
  const hasNode = data?.node.cpu !== null || data?.node.ram !== null;
  const hasTraffik =
    (data?.rps?.length ?? 0) > 0 || (data?.latency?.length ?? 0) > 0;
  const node = data?.node;
  const gaugeColor = (v: number | null) => {
    if (v === null) return "#3fb950";
    if (v > 80) return "#f85149";
    if (v > 60) return "#d29922";
    return "#3fb950";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 flex items-center justify-between gap-2 border-b bg-background/90 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-purple-400 text-xs font-bold text-white">
            H
          </span>
          <h1 className="text-base font-semibold">Hub Dashboard</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge
            variant="outline"
            className={`h-auto gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
              degraded
                ? "border-amber-500/30 bg-amber-900/20 text-amber-500"
                : "border-emerald-500/30 bg-emerald-900/20 text-emerald-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${degraded ? "bg-amber-500" : "bg-emerald-400"}`}
            />
            {degraded ? `${degraded} degraded` : "All Systems Operational"}
          </Badge>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 py-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {/* Services */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {data?.services.length ?? 0}
              </Badge>
            </CardHeader>
            <CardContent>
              {data?.services.length ? (
                <div className="flex flex-wrap gap-1">
                  {data.services.map((s) => (
                    <Badge
                      key={s.name}
                      variant="outline"
                      className="h-auto gap-1.5 px-2 py-1.5 text-xs font-normal"
                    >
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          s.state === "running"
                            ? "bg-green-400"
                            : s.state === "jaeger"
                              ? "bg-blue-400"
                              : "bg-red-400"
                        }`}
                      />
                      <span className="font-mono text-[10px]">{s.name}</span>
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No services detected
                </p>
              )}
            </CardContent>
          </Card>

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <div className="font-mono text-lg font-bold leading-tight text-blue-400">
                    {data?.services.length ?? "-"}
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Total
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <div className="font-mono text-lg font-bold leading-tight text-blue-400">
                    {running}
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Healthy
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <div className="font-mono text-lg font-bold leading-tight text-green-400">
                    {data?.traces.length ?? 0}
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Traces
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <div className="font-mono text-lg font-bold leading-tight text-red-400">
                    0
                  </div>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    Errors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Health */}
          <Card>
            <CardHeader>
              <CardTitle>Health</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Donut running={running} degraded={degraded} />
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {data?.links.map((l) => (
                  <a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    className="rounded-md border border-border px-2 py-1 text-[10px] text-blue-400 no-underline transition-colors hover:border-blue-400 hover:bg-muted"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Resources */}
          {hasNode && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>System Resources</CardTitle>
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] font-normal"
                >
                  {node?.load1?.toFixed(2)} {node?.load5?.toFixed(2)}{" "}
                  {node?.load15?.toFixed(2)}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-1.5">
                  <Gauge
                    pct={node?.cpu ?? null}
                    color={gaugeColor(node?.cpu ?? null)}
                    label="CPU Usage"
                    unit="%"
                  />
                  <Gauge
                    pct={node?.ram ?? null}
                    color={gaugeColor(node?.ram ?? null)}
                    label="Memory Usage"
                    unit="%"
                  />
                  <Gauge
                    pct={node?.disk ?? null}
                    color={gaugeColor(node?.disk ?? null)}
                    label="Disk Usage"
                    unit="%"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Request Rate */}
          {hasTraffik && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Request Rate</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {data?.rps?.length
                    ? `${data.rps[data.rps.length - 1].toFixed(1)}/s`
                    : "-"}
                </Badge>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Sparkline data={data?.rps ?? []} color="#58a6ff" />
              </CardContent>
            </Card>
          )}

          {/* Latency */}
          {hasTraffik && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Latency</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {data?.latency?.length
                    ? `${data.latency[data.latency.length - 1].toFixed(0)}ms`
                    : "-"}
                </Badge>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Sparkline data={data?.latency ?? []} color="#bc8cff" />
              </CardContent>
            </Card>
          )}

          {/* Error Rate */}
          {hasTraffik && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Error Rate</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {data?.errors?.length
                    ? `${data.errors[data.errors.length - 1].toFixed(1)}/s`
                    : "-"}
                </Badge>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Sparkline data={data?.errors ?? []} color="#f85149" />
              </CardContent>
            </Card>
          )}

          {/* Trace Volume */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Trace Volume</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {data?.traces.length ?? 0} traces
              </Badge>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Sparkline data={data?.traceVolume ?? []} color="#3fb950" />
            </CardContent>
          </Card>

          {/* Recent Traces */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Traces</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {data?.traces.length ?? 0}
              </Badge>
            </CardHeader>
            <CardContent>
              {data?.traces.length ? (
                <ul className="list-none">
                  {data.traces.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center justify-between gap-1.5 border-b border-border py-1.5 text-[11px] last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{t.service}</div>
                        <div className="max-w-[200px] truncate font-mono text-[10px] text-muted-foreground">
                          {t.operation}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-mono font-medium text-blue-400">
                          {safeDur(t.duration)}
                        </span>
                        <span>{t.spans}</span>
                        {t.hasError && (
                          <span className="rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-500">
                            err
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No traces — data appears once services send OTel telemetry
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
