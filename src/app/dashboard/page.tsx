"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Donut } from "@/components/dashboard/donut";
import { Gauge } from "@/components/dashboard/gauge";
import { Sparkline } from "@/components/dashboard/sparkline";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/motion-primitives";
import {
  type DashboardData,
  gaugeColor,
  safeDur,
  serviceIndicator,
} from "@/lib/dashboard/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] as const },
  },
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          setData(await res.json());
        }
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
      <motion.div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Services */}
        <motion.div variants={cardVariants}>
          <Card className="h-full transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Badge variant="secondary" className="text-[10px] font-normal">
                {data?.services.length ?? 0}
              </Badge>
            </CardHeader>
            <CardContent>
              {data?.services.length ? (
                <div className="flex flex-wrap gap-1">
                  {data.services.map((s, i) => (
                    <motion.div
                      key={s.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25, delay: 0.1 + i * 0.03 }}
                    >
                      <Badge
                        variant="outline"
                        className="h-auto gap-1.5 px-2 py-1.5 text-xs font-normal"
                      >
                        <motion.span
                          animate={
                            s.state === "running"
                              ? {
                                  opacity: [0.5, 1, 0.5],
                                }
                              : {}
                          }
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 2.5,
                            ease: "easeInOut",
                          }}
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${serviceIndicator(s.state)}`}
                        />
                        <span className="font-mono text-[10px]">{s.name}</span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No services detected
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Overview */}
        <motion.div variants={cardVariants}>
          <Card className="h-full transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
                <StatBox
                  value={running}
                  label="Healthy"
                  color="text-green-400"
                />
                <StatBox
                  value={data?.traces.length ?? 0}
                  label="Traces"
                  color="text-blue-400"
                />
                <StatBox value={0} label="Errors" color="text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Health */}
        <motion.div variants={cardVariants}>
          <Card className="h-full transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
            <CardHeader>
              <CardTitle>Health</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Donut running={running} degraded={degraded} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Links */}
        <motion.div variants={cardVariants}>
          <Card className="h-full transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {data?.links.map((l) => (
                  <motion.a
                    key={l.url}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md border border-border px-2 py-1 text-[10px] text-blue-400 no-underline transition-colors hover:border-blue-400 hover:bg-muted"
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {l.label}
                  </motion.a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Resources */}
        {hasNode && (
          <motion.div variants={cardVariants}>
            <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
          </motion.div>
        )}

        {/* Request Rate */}
        {hasTraffik && (
          <motion.div variants={cardVariants}>
            <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
          </motion.div>
        )}

        {/* Latency */}
        {hasTraffik && (
          <motion.div variants={cardVariants}>
            <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
          </motion.div>
        )}

        {/* Error Rate */}
        {hasTraffik && (
          <motion.div variants={cardVariants}>
            <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
          </motion.div>
        )}

        {/* Trace Volume */}
        <motion.div variants={cardVariants}>
          <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
        </motion.div>

        {/* Recent Traces */}
        <motion.div variants={cardVariants} className="2xl:col-span-2">
          <Card className="transition-shadow duration-300 hover:shadow-md hover:shadow-border/20">
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
                    <motion.li
                      // biome-ignore lint/suspicious/noArrayIndexKey: trace data has no unique id
                      key={`${t.service}-${t.operation}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
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
                          <motion.span
                            className="rounded-sm bg-red-500/10 px-1.5 py-0.5 text-[9px] text-red-500"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 2,
                            }}
                          >
                            err
                          </motion.span>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-center text-[11px] text-muted-foreground">
                  No traces &mdash; data appears once services send OTel
                  telemetry
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
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
    <motion.div
      className="rounded-lg bg-muted/50 p-2.5 text-center transition-colors duration-300 hover:bg-muted/80"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={`font-mono text-lg font-bold leading-tight ${color}`}>
        {typeof value === "number" ? (
          <AnimatedNumber value={value} />
        ) : (
          (value ?? "-")
        )}
      </div>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </motion.div>
  );
}
