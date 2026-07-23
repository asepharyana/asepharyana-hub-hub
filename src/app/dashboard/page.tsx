"use client";

import { useEffect, useState } from "react";
import { Donut } from "@/components/dashboard/donut";
import { Gauge } from "@/components/dashboard/gauge";
import { Sparkline } from "@/components/dashboard/sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type DashboardData,
  gaugeColor,
  safeDur,
  serviceIndicator,
} from "@/lib/dashboard/types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

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

  const running =
    data?.services.filter((s) => s.state === "running").length ?? 0;
  const degraded = (data?.services.length ?? 0) - running;
  const hasNode = data?.node.cpu !== null || data?.node.ram !== null;
  const hasTraffik =
    (data?.rps?.length ?? 0) > 0 || (data?.latency?.length ?? 0) > 0;
  const node = data?.node;

  return (
    <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-3">
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
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${serviceIndicator(s.state)}`}
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
              <StatBox
                value={data?.services.length}
                label="Total"
                color="text-blue-400"
              />
              <StatBox value={running} label="Healthy" color="text-blue-400" />
              <StatBox
                value={data?.traces.length ?? 0}
                label="Traces"
                color="text-green-400"
              />
              <StatBox value={0} label="Errors" color="text-red-400" />
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
                  rel="noopener noreferrer"
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
        <Card className="2xl:col-span-2">
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
                    key={`${t.service}-${t.operation}-${i}`}
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
                No traces &mdash; data appears once services send OTel telemetry
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({
  value,
  label,
  color,
}: {
  value: number | string | undefined;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <div className={`font-mono text-lg font-bold leading-tight ${color}`}>
        {value ?? "-"}
      </div>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
