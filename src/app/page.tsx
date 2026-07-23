import {
  ArrowRight,
  BookOpen,
  Container,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  GitFork,
  HardDrive,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const skills = [
  { icon: HardDrive, label: "Backend (Bun, Elysia, Axum)" },
  { icon: Container, label: "Docker & Traefik" },
  { icon: Database, label: "PostgreSQL, Redis, NATS" },
  { icon: Cpu, label: "Rust, TypeScript, Python" },
  { icon: GitBranch, label: "CI/CD, GitHub Actions" },
  { icon: BookOpen, label: "Dapr, Prometheus, Jaeger" },
];

const techTags = [
  "TypeScript",
  "Rust",
  "Python",
  "Next.js",
  "React",
  "Bun",
  "Elysia",
  "Drizzle",
  "Axum",
  "TensorFlow",
  "ONNX",
  "Docker",
  "Traefik",
  "Tailscale",
  "Dapr",
  "NATS",
  "PostgreSQL",
  "Redis",
  "Prometheus",
  "Tauri",
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center sm:py-32">
        <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-foreground text-xl font-bold text-background">
          AH
        </div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Asep Haryana Saputra
        </h1>
        <p className="mt-3 max-w-lg text-lg text-muted-foreground">
          Backend &amp; infrastructure engineer who builds distributed systems,
          RESTful APIs, and production-grade observability stacks.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#projects" className={cn(buttonVariants({ size: "lg" }))}>
            View Projects
            <ArrowRight className="size-4" />
          </a>
          <a
            href="https://github.com/asepharyana"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
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
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              I build backend systems and infrastructure for personal projects,
              research collaborations, and production deployments. My work spans
              RESTful API design, container orchestration with Docker &amp;
              Traefik, distributed tracing with OpenTelemetry &amp; Jaeger, and
              event-driven architectures on Dapr &amp; NATS.
            </p>
            <p className="mt-3">
              I was the Back-End lead on the ZeaVis Edu capstone team (&quot;AI
              for Smart Education&quot; by Pijak &times; IBM SkillsBuild), where
              I designed the system architecture, API contracts, and deployment
              pipeline for a computer vision-based corn leaf disease detection
              platform.
            </p>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills &amp; Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {skills.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {techTags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="text-[11px] font-normal"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <div id="projects" className="scroll-mt-20">
          <h2 className="mb-4 text-xl font-semibold tracking-tight">
            Featured Project
          </h2>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>ZeaVis Edu</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Asisten Edukasi Interaktif untuk Deteksi Penyakit Daun
                    Jagung
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href="https://zeavisedu.asepharyana.my.id/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    <ExternalLink className="size-3.5" />
                    Live
                  </a>
                  <a
                    href="https://github.com/ATLAS-PJK-GM007/ZeaVis-Edu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                    )}
                  >
                    <GitFork className="size-3.5" />
                    Source
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                A Computer Vision-powered educational platform that helps
                farmers, agricultural students, and field extension officers
                identify corn leaf diseases by uploading a photo. Built as a
                capstone project for the Pijak &times; IBM SkillsBuild program.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider">
                    What it does
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Upload a photo of a corn leaf</li>
                    <li>
                      AI classifies the disease &mdash; Blight, Rust, Leaf Spot,
                      or Healthy
                    </li>
                    <li>Get treatment &amp; prevention recommendations</li>
                  </ul>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider">
                    My role
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>System architecture &amp; API design</li>
                    <li>RESTful API (Bun + Elysia + Drizzle + PostgreSQL)</li>
                    <li>Rust inference engine (Axum + ONNX Runtime)</li>
                    <li>
                      Docker deployment on VPS with Traefik &amp; Tailscale
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {[
                  "React",
                  "TypeScript",
                  "Bun",
                  "Elysia",
                  "Drizzle",
                  "PostgreSQL",
                  "Rust",
                  "Axum",
                  "ONNX",
                  "TensorFlow",
                  "EfficientNetV2B0",
                  "Tauri 2",
                  "Docker",
                  "Traefik",
                ].map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    className="text-[10px] font-normal"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Infrastructure CTA */}
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
            <p className="text-base font-medium">
              This site doubles as a live infrastructure monitor.
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              The dashboard tracks Docker services, Traefik request metrics,
              Prometheus system resources, and Jaeger traces across the
              deployment.
            </p>
            <a href="/dashboard" className={cn(buttonVariants())}>
              Live Dashboard
              <ArrowRight className="size-4" />
            </a>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 text-center text-xs text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} Asep Haryana Saputra &mdash;{" "}
          <a
            href="https://github.com/asepharyana"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
