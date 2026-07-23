import {
  ArrowRight,
  Container,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  GitFork,
  HardDrive,
  Layers,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ponytail: static data, fine for a personal portfolio. Move to CMS/content layer if > 50 items.
const skills = [
  { icon: HardDrive, label: "Backend (Bun, Elysia, Axum)" },
  { icon: Container, label: "Docker & Traefik" },
  { icon: Database, label: "PostgreSQL, Redis, NATS" },
  { icon: Cpu, label: "Rust, TypeScript, Python" },
  { icon: GitBranch, label: "CI/CD, GitHub Actions" },
  { icon: Layers, label: "Dapr, Prometheus, Jaeger" },
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
      {/* Hero — terminal-inspired */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-28 text-center sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.45_0.13_265_/_0.06)_0%,transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,oklch(0.7_0.15_75_/_0.06)_0%,transparent_70%)]" />
        <div className="relative">
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary dark:text-primary">~</span> whoami
          </p>
          <h1 className="font-mono text-3xl font-bold tracking-tight sm:text-5xl">
            <span className="text-muted-foreground">$ </span>
            Asep Haryana Saputra
            <span className="inline-block size-2.5 animate-pulse bg-foreground ml-1 rounded-none" />
          </h1>
          <p className="mx-auto mt-3 max-w-lg font-mono text-xs text-muted-foreground sm:text-sm">
            <span className="text-muted-foreground/50"># </span>
            Teknik Informatika student exploring backend systems, distributed
            infrastructure, and DevOps — still learning, still building.
          </p>
        </div>
        <div className="relative mt-10 flex flex-wrap items-center justify-center gap-3">
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

      {/* Content — staggered sections with alternating visual weight */}
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-6 pb-28">
        {/* About — minimal, just text */}
        <div>
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary dark:text-primary">~</span> about
          </p>
          <div className="space-y-3 leading-relaxed text-muted-foreground">
            <p>
              I&rsquo;m a Teknik Informatika student passionate about backend
              engineering, distributed systems, and infrastructure. I spend my
              time building RESTful APIs, learning container orchestration with
              Docker &amp; Traefik, and exploring observability with
              OpenTelemetry &amp; Jaeger.
            </p>
            <p>
              I was the Back-End lead on the ZeaVis Edu capstone team (&ldquo;AI
              for Smart Education&rdquo; by Pijak &times; IBM SkillsBuild), a
              5-person team with task division across Back-End, Front-End, and
              Machine Learning. I handled the system architecture, API design,
              RESTful API development, and Docker deployment on VPS.
            </p>
          </div>
        </div>

        {/* Skills & Tools — grid */}
        <div>
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary dark:text-primary">~</span> skills
          </p>
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {skills.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm"
                >
                  <Icon className="size-4 shrink-0 text-primary dark:text-primary" />
                  <span>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="text-[11px] font-normal"
              >
                {t}
              </Badge>
            ))}
          </div>
        </div>

        {/* Featured Project — elevated */}
        <div id="projects" className="scroll-mt-24">
          <p className="mb-2 font-mono text-xs text-muted-foreground">
            <span className="text-primary dark:text-primary">~</span> featured
            project
          </p>
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">ZeaVis Edu</CardTitle>
                  <p className="mt-0.5 text-sm text-muted-foreground">
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
              <p className="mb-4">
                A Computer Vision-powered educational platform that helps
                farmers, agricultural students, and field extension officers
                identify corn leaf diseases by uploading a photo. Built as a
                capstone project for the Pijak &times; IBM SkillsBuild program.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                    What it does
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>Upload a photo of a corn leaf</li>
                    <li>
                      AI classifies the disease &mdash; Blight, Rust, Leaf Spot,
                      or Healthy
                    </li>
                    <li>Get treatment &amp; prevention recommendations</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">
                    My role
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-xs">
                    <li>System architecture &amp; API design</li>
                    <li>RESTful API (Bun + Elysia + Drizzle + PostgreSQL)</li>
                    <li>Secure upload handling</li>
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
                    variant="secondary"
                    className="text-[10px] font-normal"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Infrastructure CTA — clean card */}
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <p className="text-base font-medium">
              This site doubles as a live infrastructure monitor.
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              The dashboard tracks Docker services, Traefik request metrics,
              Prometheus system resources, and Jaeger traces — all running on my
              VPS deployment.
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
