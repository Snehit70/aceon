# Aceon Architecture

Updated: 2026-05-06

Aceon is an authenticated lecture companion for IITM BS Degree students. The production app is built around a small set of flows: discover courses, enroll or configure a profile, watch YouTube-hosted lectures, and persist progress to Convex in near real time.

## System Map

```text
Browser
  |
  | Next.js App Router pages and client components
  v
Clerk auth session
  |
  | ConvexProviderWithClerk
  v
Convex queries and mutations
  |
  +--> courses / weeks / videos
  +--> users
  +--> videoProgress
  +--> videoNotes

Browser also loads YouTube IFrame API directly for lecture playback.
```

## Runtime Stack

| Layer | Technology | Main Files |
| --- | --- | --- |
| App framework | Next.js 16 App Router, React 19 | `app/` |
| Backend/data | Convex | `convex/` |
| Auth | Clerk | `proxy.ts`, `components/providers.tsx` |
| Styling | Tailwind 4, shadcn UI, Radix | `app/globals.css`, `components/ui/` |
| Video | YouTube IFrame API | `components/shared/video-player.tsx` |
| Package/runtime | Bun | `package.json`, `bun.lock` |

## Route Surface

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page. Authenticated users can navigate to lectures. |
| `/lectures` | Protected | Course dashboard, enrolled courses, library search and filters. |
| `/lectures/[subjectId]` | Protected | Lecture player for one Convex course ID. |
| `/api/save-progress` | API | Beacon endpoint used on tab hide/page unload. |
| `/privacy`, `/terms` | Public | Legal pages. |
| `/makima-calibration` | Public/currently unprotected | Calibration/profile-style route. Review before production if it contains account-specific behavior. |

`proxy.ts` protects `/lectures(.*)` through Clerk middleware.

## Provider Flow

`app/layout.tsx` wires the application shell. The important runtime providers live in `components/providers.tsx`:

```text
ClerkProvider
  ConvexProviderWithClerk
    ThemeProvider
      TooltipProvider
        app UI
```

This means Convex functions can use Clerk auth identity, while client routes can subscribe to live query results with `useQuery`.

## Data Model

Defined in `convex/schema.ts`.

| Table | Responsibility | Important Indexes |
| --- | --- | --- |
| `users` | Clerk-linked profile, degree level, enrolled course IDs | `by_clerkId` |
| `courses` | Course code, title, level | `by_code` |
| `weeks` | Ordered course sections | `by_course` |
| `videos` | YouTube lecture metadata | `by_course`, `by_week`, `by_youtubeId`, `search_title` |
| `videoProgress` | Per-user watch progress and completion state | `by_user`, `by_user_video`, `by_user_course`, `by_user_recent` |
| `videoNotes` | Timestamped notes per user/video | `by_user`, `by_user_video` |

The user identity source of truth is Clerk's `subject`, passed through the app as `clerkId`.

## Main User Flows

### Course Dashboard

```text
User opens /lectures
  -> Clerk provides user
  -> Convex loads courses, profile, all course progress
  -> enrolledCourseIds split courses into enrolled and archive groups
  -> UI renders ChainsawCard grid or skeleton/empty states
```

Important files:

- `app/lectures/page.tsx`
- `components/shared/chainsaw-card.tsx`
- `components/profile/profile-sheet.tsx`
- `components/lectures/lectures-skeleton.tsx`

### Lecture Playback

```text
User opens /lectures/[subjectId]
  -> Convex loads course and course content tree
  -> Convex loads progress for the current user/course
  -> useVideoNavigation selects URL video or first incomplete video
  -> VideoPlayer creates a YouTube IFrame API player
  -> useVideoProgress saves progress during playback, pause, and tab close
```

Important files:

- `app/lectures/[subjectId]/page.tsx`
- `components/shared/video-player.tsx`
- `hooks/use-video-navigation.ts`
- `hooks/use-video-progress.ts`
- `hooks/use-autoplay.ts`
- `hooks/use-video-shortcuts.ts`
- `components/lectures/lecture-sidebar.tsx`
- `components/lectures/lecture-header.tsx`

### Progress Persistence

There are three progress save paths:

| Path | Trigger | Destination | Notes |
| --- | --- | --- | --- |
| Throttled | Playback progress | `api.progress.updateProgress` | Saves at most every 5 seconds. |
| Immediate | Pause/manual transition | `api.progress.updateProgress` | Captures seek/pause positions. |
| Beacon | `visibilitychange` and `pagehide` | `/api/save-progress` -> `api.progress.savePositionBeacon` | Best-effort last-position save when the page is closing. |

`updateProgress` verifies Clerk identity. `savePositionBeacon` currently updates an existing progress record but does not create one.

## Backend Functions

| Module | Role |
| --- | --- |
| `convex/courses.ts` | Lists courses, resolves course content, search, stats. |
| `convex/progress.ts` | Progress update, completion toggles, recent watch data. |
| `convex/users.ts` | Profile creation and enrollment state. |
| `convex/videoNotes.ts` | Timestamped note CRUD. |
| `convex/seed.ts`, `convex/migrations.ts` | Data loading and maintenance. |
| `convex/debug*.ts` | Operational/debug helpers. |

## Design System

The current visual source of truth is `docs/DESIGN.yaml`, backed by `app/globals.css` and `tailwind.config.ts`. The active direction is Chainsaw Man inspired: black surfaces, blood red primary, acid green accent, square corners, clipped cards, halftone/noise textures, and high-contrast image overlays.

## Environment

Local development uses port `5550`:

```bash
bun run dev
```

Important project rule: local Convex development points at the production deployment `prod:glad-marten-760`. Do not switch this repo to the empty dev deployment unless the data migration plan explicitly requires it.

Required environment variables:

```bash
CONVEX_DEPLOYMENT=prod:glad-marten-760
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Operational Notes

- Check whether the dev server is already running before starting another server.
- Use `bun run lint` and `bun x tsc --noEmit` for the narrow validation baseline.
- Use `bun run build` before release-oriented changes.
- Do not commit `.env.local`, token files, database backups, or scraped private material.
- This repo currently contains local untracked/private-looking files such as tokens and data probes on disk; keep them out of commits.

## Known Review Targets

These are good candidates for the next performance and UX phases:

- `app/lectures/page.tsx` is a large client component and imports `framer-motion`; consider component splitting and dynamic boundaries.
- `components/shared/video-player.tsx` owns many player states and imperative controls; profile render churn and callback stability before changing behavior.
- `convex/courses.listWithStats` collects all videos to aggregate counts; acceptable at small scale, but should be revisited if course/video volume grows.
- `/api/save-progress` relies on a public Convex URL and a beacon mutation without the normal Clerk auth context; verify security expectations before expanding it.
- Mobile lecture player ergonomics need a dedicated pass after documentation and performance review.

