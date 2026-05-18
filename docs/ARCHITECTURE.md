# Aceon Architecture

Updated: 2026-05-18

Aceon is an authenticated lecture companion for IITM BS students. The app centers on one critical flow: open a course, watch a lecture, and persist progress reliably.

## Runtime Overview

```text
Browser (Next.js App Router + React client components)
  -> Clerk session
  -> Convex client queries/mutations (real-time)
  -> YouTube IFrame API (video playback)

Beacon fallback:
Browser -> /api/save-progress -> Convex mutation
```

## Stack

- Framework: Next.js 16 App Router, React 19
- Data backend: Convex
- Auth: Clerk
- Styling/UI: Tailwind 4, Radix, shadcn, custom theme
- Runtime/package manager: Bun
- Video runtime: YouTube IFrame API

## App Surface

- `/`: landing
- `/lectures`: authenticated dashboard (enrolled + archives)
- `/lectures/[subjectId]`: player route
- `/api/save-progress`: beacon progress endpoint
- `/privacy`, `/terms`: legal
- `/makima-calibration`: calibration/utility route

`proxy.ts` protects lecture routes via Clerk middleware.

## Provider Topology

Defined in `app/layout.tsx` and `components/providers.tsx`:

```text
ClerkProvider
  -> ConvexProviderWithClerk
    -> ThemeProvider
      -> TooltipProvider
        -> Toaster
          -> App UI
```

## Data Model (Convex)

Defined in `convex/schema.ts`.

- `users`: profile (level, enrolled courses)
- `courses`: course metadata (`code`, `title`, `level`)
- `weeks`: ordered course sections
- `videos`: lecture metadata (`youtubeId`, `duration`, `order`, transcript URL)
- `videoProgress`: per-user watch state
- `videoNotes`: timestamped notes per user/video

Primary indexes include:

- `courses.by_code`
- `weeks.by_course`
- `videos.by_course`, `videos.by_week`, `videos.by_youtubeId`, `videos.search_title`
- `videoProgress.by_user_video`, `videoProgress.by_user_course`, `videoProgress.by_user_recent`

## Main Flows

## 1) Dashboard

`/lectures` loads:
- `api.courses.listWithStats`
- `api.users.getUser`
- `api.progress.getAllCoursesProgress`

It derives:
- enrolled courses from `profile.enrolledCourseIds`
- archive groups by level
- progress state (including prior-level handling in UI)

## 2) Lecture Player

`/lectures/[subjectId]` loads:
- `api.courses.get`
- `api.courses.getCourseContent`
- `api.progress.getCourseProgress`

Core client hooks:
- `useVideoNavigation`: select URL video or first incomplete
- `useVideoProgress`: throttled + pause + beacon saves
- `useAutoplay`: next-video countdown
- `useVideoShortcuts`: keyboard control layer

## 3) Progress Persistence

- Throttled save (every ~5s): `api.progress.updateProgress`
- Pause/manual save: `api.progress.updateProgress`
- Page-hide fallback: `navigator.sendBeacon` -> `/api/save-progress` -> `api.progress.savePositionBeacon`

## Boundaries and Responsibilities

- Next.js handles routing, rendering, and API route glue.
- Convex is the source of truth for course/user/progress data.
- Clerk is identity source (`subject` == `clerkId` in app logic).
- YouTube player handles media playback; app handles progress semantics.

## Current Architecture Strengths

- Clear separation between content model and progress model.
- Good index coverage for core read paths.
- Hook-based player orchestration keeps concerns split.
- Real-time query model simplifies dashboard/player freshness.

## Known Risks and Improvement Targets

- Beacon endpoint auth model should be hardened (do not trust body `clerkId` blindly).
- `courses.listWithStats` aggregates all videos in memory; scale-sensitive.
- Player component owns many concerns (state churn risk under future feature growth).
- No automated integration test coverage yet for end-to-end playback/progress path.

## Validation Baseline

- `bun run lint`
- `bun x tsc --noEmit`
- `bun run test`
- `bun run build`
