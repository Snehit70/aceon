# Aceon System Design

Updated: 2026-05-18

This document describes runtime behavior, data movement, scaling assumptions, and operational design.

## System Context

Aceon is a web application for IITM BS students to discover courses and track lecture consumption.

External systems:
- Clerk: identity/session
- Convex: primary datastore + app backend runtime
- YouTube: video delivery

## High-Level Topology

```text
Client (Next.js)
  -> Clerk session/auth context
  -> Convex functions (query/mutation)
  -> YouTube IFrame API

Fallback path:
Client sendBeacon -> Next API route -> Convex mutation
```

## Request and Data Paths

## Dashboard Read Path

1. Browser opens `/lectures`
2. Client fetches courses, profile, progress through Convex queries
3. UI computes enrolled vs archive and progress-based ordering

## Player Read/Write Path

1. Browser opens `/lectures/[subjectId]`
2. Client fetches course + weeks/videos + course progress
3. YouTube player emits time/progress signals
4. App writes progress mutations
5. On visibility/pagehide, best-effort beacon writes last position

## Data Ownership

- Course catalog: Convex `courses`, `weeks`, `videos`
- User state: Convex `users`
- Progress state: Convex `videoProgress`
- Notes state: Convex `videoNotes`

## Security Model (Current)

- Convex mutations for core progress/user updates validate Clerk identity.
- Protected lecture routes use Clerk middleware.
- Risk: beacon endpoint currently accepts body `clerkId` and should be hardened to server-derived identity.

## Reliability Model

- Primary write channel: regular progress mutation calls
- Secondary write channel: beacon fallback on tab hide/page close
- Read consistency: near real-time via Convex subscriptions

## Performance Characteristics

- Typical load is read-heavy on dashboard/player boot.
- Progress writes are bounded by throttling cadence.
- Search uses Convex `search_title` index.
- `listWithStats` currently scans full videos set; acceptable for current scale but should evolve for large catalogs.

## Failure Handling

- UI-level error boundaries exist (`app/error.tsx`, `app/global-error.tsx`).
- Toast-based user feedback for key failures.
- No centralized production error sink integrated yet.

## CI/CD Design

- New CI workflow enforces lint, typecheck, tests, and build on PRs.
- Version bump workflow remains on pushes to `main`.
- Recommended branch protection: require `CI / Lint, Typecheck, Tests` and `CI / Production Build` before merge.

## Operational Checklist

- Verify single local dev server on port `5550` before starting new one.
- Use `bun install --frozen-lockfile` in CI and local reproducible runs.
- Keep token/data/scraper artifacts out of commits.
- Run validation baseline before merge.
