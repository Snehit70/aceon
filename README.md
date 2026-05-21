# Aceon

Academic companion for IITM BS Degree students, built as a focused lecture dashboard with course navigation, YouTube playback, progress tracking, and profile-aware course organization.

Aceon uses a Chainsaw Man inspired visual system: black surfaces, blood red primary actions, acid green accents, hard edges, clipped corners, halftone texture, and dense mission-control style UI.

![Aceon app preview](public/images/readme_aceon.png)

## Features

- Protected lecture dashboard for enrolled courses and the full course library
- Course -> week -> video navigation
- Custom YouTube IFrame API player controls
- Smart video resume from saved position
- Progress persistence during playback, pause, and page close
- Completion toggles for videos, weeks, and courses
- Timestamped video notes backend support
- Clerk-authenticated Convex data access
- Dedicated mobile route shell at `/m/*` with bottom-tab navigation (Enrolled / Archives / Profile)
- Automatic UA-based redirect from desktop `/lectures` and `/lectures/[subjectId]` into the mobile flow
- Touch-friendly custom player controls with fullscreen landscape support where the browser allows it

## Stack

| Area | Tooling |
| --- | --- |
| App | Next.js 16 App Router, React 19 |
| Backend | Convex |
| Auth | Clerk |
| Styling | Tailwind 4, shadcn UI, Radix |
| Video | YouTube IFrame API |
| Runtime | Bun |

## Project Map

```text
app/                         Next.js routes (desktop) and API route
app/m/                       Mobile-only route shell (bottom tabs, course/week/lecture pages)
components/                  UI, lecture, shared, profile, landing, mobile components
convex/                      Schema, queries, mutations, migrations
hooks/                       Video progress, navigation, autoplay, shortcuts
proxy.ts                     Clerk middleware + UA-based redirect into /m/*
docs/ARCHITECTURE.md         Current architecture documentation
docs/DESIGN.yaml             Current design source of truth
scripts/                     Scraping, seeding, diagnostics, maintenance
public/images/               Brand, texture, and page imagery
```

## Mobile Testing

The mobile experience is designed around `320px` through `767px` wide screens, with tablet checks from `768px` through `1023px`. Mobile user-agents hitting `/lectures` or `/lectures/[subjectId]` are redirected by `proxy.ts` into the mobile shell. The key mobile surfaces are:

- `/` landing hero — 3-zone non-scrolling layout (tagline / title / CTAs)
- `/m/lectures` enrolled and archives tabs (`?tab=enrolled|archives`)
- `/m/profile` profile editor
- `/m/course/[subjectId]` course banner + circular progress + week tiles
- `/m/course/[subjectId]/week/[weekId]` lecture list with per-video progress bars
- `/m/course/[subjectId]/lecture/[videoId]` player + resume strip + merged primary CTA
- `/privacy` and `/terms` long-title wrapping and footer layout

When testing on an Android phone against the local dev server, either forward the app port with adb:

```bash
adb reverse tcp:5550 tcp:5550
```

Then open `http://localhost:5550` on the phone. Alternatively, run the dev server bound to the LAN (`bun run dev -- --hostname 0.0.0.0`) and open `http://<your-LAN-IP>:5550`.

## Getting Started

Install dependencies:

```bash
bun install
```

Create `.env.local`:

```bash
CONVEX_DEPLOYMENT=prod:glad-marten-760
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Start the dev server:

```bash
bun run dev
```

The app runs on `http://localhost:5550`.

Important: local development currently uses the production Convex deployment, `prod:glad-marten-760`. Do not switch to the empty dev deployment unless the data migration plan explicitly calls for it.

## Common Commands

| Task | Command |
| --- | --- |
| Dev server | `bun run dev` |
| Lint | `bun run lint` |
| Type check | `bun x tsc --noEmit` |
| Production build | `bun run build` |
| Convex dev | `bun x convex dev` |

Before starting a dev server, check whether one is already running on port `5550`.

## Architecture

Aceon is a client-heavy Next.js app backed by Convex real-time queries and Clerk auth. The main learning flow on desktop is:

```text
/lectures/[subjectId]
  -> load course and content from Convex
  -> select URL video or first incomplete video
  -> initialize YouTube IFrame player
  -> save progress through Convex mutations and beacon fallback
```

On mobile the same flow is split across route pages:

```text
/m/lectures -> /m/course/[subjectId] -> /m/course/[subjectId]/week/[weekId]
            -> /m/course/[subjectId]/lecture/[videoId]
```

Progress mutations and beacon fallback are shared with the desktop flow.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full system map, data model, route surface, provider flow, and review targets.

## Design

The maintained design spec is [docs/DESIGN.yaml](docs/DESIGN.yaml). It documents the current palette, typography, component roles, image overlay rules, responsive targets, and implementation constraints.

The short version:

- Primary: `#E62E2D`
- Accent: `#2BFF00`
- Background: `#000000`
- Shape: square or clipped corners
- Texture: halftone/noise overlays
- UI voice: academic mission control
- Brand assets: cropped Aceon logo in navigation, footer, favicon, and app icon

## Data And Scraping Notes

Scraping and data maintenance docs live in `docs/`:

- [docs/scrape.md](docs/scrape.md)
- [docs/SCRAPER_UPDATE.md](docs/SCRAPER_UPDATE.md)
- [docs/SCRAPING_LOG.md](docs/SCRAPING_LOG.md)
- [docs/DATA_INTEGRITY_REPORT.md](docs/DATA_INTEGRITY_REPORT.md)
- [docs/CONVEX_MIGRATIONS.md](docs/CONVEX_MIGRATIONS.md)

Treat scraped data, backups, token files, and `.env.local` as private local material. Do not commit secrets.

## Validation

Run the narrow baseline before committing code changes:

```bash
bun run lint
bun x tsc --noEmit
```

Use `bun run build` for release or performance-sensitive changes.

## Version

Current version: `0.11.0`.

Version bumps are automated by the GitHub workflow after conventional commits land on `main`.
