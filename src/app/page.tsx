import {
  Activity,
  ArrowRight,
  BarChart3,
  Container,
  Cpu,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Container,
    title: "Service Health",
    description: "Real-time Docker container status across the cluster.",
  },
  {
    icon: BarChart3,
    title: "Request Metrics",
    description: "RPS, latency, and error rates scraped from Traefik.",
  },
  {
    icon: Cpu,
    title: "System Resources",
    description: "CPU, memory, disk, and network on each VPS node.",
  },
  {
    icon: Activity,
    title: "Distributed Tracing",
    description: "Jaeger trace visualization for service-to-service calls.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-blue-500/20">
          AH
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Asep Haryana Saputra
        </h1>
        <p className="mt-3 max-w-md text-lg text-muted-foreground">
          Software engineer building resilient, observable infrastructure for
          personal and production systems.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/80"
          >
            Dashboard
            <ArrowRight className="size-4" />
          </a>
          <a
            href="https://github.com/asepharyana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-muted hover:text-foreground"
          >
            GitHub
            <ExternalLink className="size-4" />
          </a>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle>About This Hub</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              This is the control center for Asep Haryana Saputra&apos;s
              infrastructure. It monitors Docker containers, Traefik request
              metrics, Prometheus system resources, and Jaeger distributed
              traces across a multi-VPS deployment orchestrated with Dapr and
              NATS.
            </p>
            <p className="mt-3">
              The stack runs on Tailscale-connected VPS nodes with automatic
              service discovery, TLS termination via Traefik, and real-time
              streaming telemetry through JetStream-backed Dapr pub/sub.
            </p>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} size="sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="size-4 text-blue-500" />
                    {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {f.description}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-base font-medium">
              Ready to see the live infrastructure?
            </p>
            <a
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground whitespace-nowrap transition-colors hover:bg-primary/80"
            >
              Open Dashboard
              <ArrowRight className="size-4" />
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} Asep Haryana Saputra. Built with
        Next.js, shadcn/ui, and a lot of Docker.
      </footer>
    </div>
  );
}
