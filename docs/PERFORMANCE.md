# Aceon Performance Guide

Updated: 2026-05-18

## Current Performance Posture

- Build passes on Next.js 16 + React 19.
- Dynamic import already used for `ProfileSheet` to reduce initial dashboard cost.
- Convex indexes are in place for major read paths.
- Progress writes are throttled in client hook.

## Hot Paths

## 1) `/lectures` dashboard

Potentially expensive areas:
- client-side filtering/grouping over all courses
- animation-heavy rendering
- localStorage hydration logic for skeleton counts

Mitigations in place:
- memoized filtering/grouping
- split tabs and grouped rendering

## 2) `/lectures/[subjectId]` player route

Potentially expensive areas:
- large client component composition
- player state updates and callbacks
- sidebar + player simultaneous updates

Mitigations in place:
- dedicated hooks for progress/navigation/autoplay/shortcuts
- update throttling

## 3) Convex aggregation queries

`courses.listWithStats` currently collects all videos and aggregates in-memory.

When to refactor:
- noticeable query latency growth with catalog expansion
- increased cold-start or memory cost

Potential refactor options:
- precomputed stats table
- periodic stat compaction mutation
- course-scoped incremental counters

## Client Performance Practices

- Keep player callbacks stable with refs/callbacks.
- Avoid unnecessary reinitialization of YouTube player.
- Prefer dynamic imports for non-critical UI panels.
- Avoid introducing expensive render-time transforms in top-level routes.

## API/Backend Performance Practices

- Keep read queries index-backed.
- Avoid N+1 collection patterns in Convex handlers.
- Keep progress writes idempotent and small.

## Measurement Baseline

Use this baseline in optimization passes:

- Lighthouse (mobile + desktop) on `/` and `/lectures`
- route TTI/INP for player page on mid-tier mobile device
- Convex query timings for:
  - `courses.listWithStats`
  - `courses.getCourseContent`
  - `progress.getCourseProgress`

## Practical Next Steps

1. Add Web Vitals instrumentation and telemetry sink.
2. Add a lightweight performance budget for bundle growth.
3. Profile re-renders in player route after each major feature addition.
4. Move course stats to precomputed shape if catalog grows materially.
