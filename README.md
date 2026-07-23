# asepharyana-hub-hub

Personal portfolio SPA — backend/infrastructure projects and live monitoring dashboard.

Built with **Next.js 16**, **shadcn/ui** (base-nova), **Tailwind CSS v4**, and `next-themes`.

## Stack

- **Framework:** Next.js 16 (Turbopack, React Compiler)
- **UI:** shadcn/ui v4 (base-nova style) + Tailwind CSS v4
- **Font:** Geist (sans) + Geist Mono via `next/font`
- **Theme:** `next-themes` — light/dark with amber "server LED" focus glow (dark mode)
- **Icons:** Lucide React
- **Linting:** Biome

## Pages

| Route | Description |
|-------|-------------|
| `/` | Portfolio landing page — hero, about, skills, featured project (ZeaVis Edu), infra CTA |
| `/dashboard` | Live infrastructure monitor — Docker services, Traefik metrics, Jaeger traces, Prometheus resources |

## Theme

Twilight Terminal — warm off-white (light) / deep indigo-slate (dark) with amber-gold primary in dark mode. All component styling is driven by CSS custom properties in `globals.css`.

## Dev

```bash
bun dev          # Start dev server
bun run lint     # Biome lint
bun run ci       # Biome CI mode
```

## Deploy

Deployed as a Docker container behind Traefik on VPS. See `infra/` in the monorepo root for compose files and Traefik config.
