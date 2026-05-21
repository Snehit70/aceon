# Mobile Navigation Re-Architecture Plan (Desktop-Safe)

> **Status (2026-05-21): Shipped.** All five phases below are in production. The mobile shell lives under `app/m/`, bottom tabs are sticky in `app/m/layout.tsx`, and `proxy.ts` redirects mobile UAs from desktop lecture URLs into `/m/*`. This document is retained for historical context — for current architecture see `docs/ARCHITECTURE.md`. Notable post-plan changes:
> - Profile body was migrated to a full `/m/profile` page rather than an extracted `profile-form` component; the desktop `ProfileSheet` was kept untouched.
> - Mobile UI components shipped under `components/mobile/` (`mobile-bottom-tabs`, `mobile-page-header`, `mobile-skeletons`); the granular `mobile-week-list` / `mobile-lecture-list` / `mobile-player-layout` split in §"New components" was not needed — page components stayed cohesive.
> - The lecture page merges Mark Done + Next into a single adaptive CTA, beyond the original plan.

## Objective
Replace mobile-only sidebar/sheet-heavy lecture navigation with route-driven pages and bottom tabs, while preserving the existing desktop UX exactly.

## Non-Negotiables
- Desktop (`md` and above) must keep current layout, interactions, and visual hierarchy.
- Existing Convex query/mutation logic stays source-of-truth (no business logic forks).
- Mobile architecture can diverge at routing/presentation level only.
- Rollout in small, reversible phases with validation after each phase.

## Target Mobile Information Architecture

### Top-level (bottom tabs, mobile-only)
- `Enrolled`
- `Archives`
- `Profile`

### Learning flow (mobile-only, page based)
1. Enrolled/Archives list -> select course
2. Course page (weeks list)
3. Week page (lectures list)
4. Lecture page (single video + primary actions)

## Route Map (Proposed)

### Keep existing desktop routes
- `/lectures` (desktop continues with current top tabs + full dashboard)
- `/lectures/[subjectId]` (desktop continues with right sidebar + player)

### Add mobile-focused routes
- `/m/lectures` -> mobile top-level tab shell (Enrolled/Archives)
- `/m/profile` -> mobile profile page (replaces profile sheet on mobile)
- `/m/course/[subjectId]` -> course overview with week list
- `/m/course/[subjectId]/week/[weekId]` -> lecture list for one week
- `/m/course/[subjectId]/lecture/[videoId]` -> single-video player page

> `m` namespace isolates mobile routing and guarantees no desktop regressions.

## Component Ownership Plan

### Reuse as-is (logic stable)
- `hooks/use-video-progress.ts`
- `hooks/use-video-navigation.ts` (partially; reuse helpers where possible)
- `hooks/use-autoplay.ts`
- `components/shared/video-player.tsx`
- Convex data access in `convex/courses.ts`, `convex/progress.ts`, `convex/users.ts`

### Reuse with mobile wrappers
- `components/lectures/lecture-sidebar.tsx`
  - Extract week/lecture list presentation into reusable subcomponents:
    - `components/lectures/week-list.tsx`
    - `components/lectures/lecture-list.tsx`
- `components/profile/profile-sheet.tsx`
  - Extract content body into reusable form component:
    - `components/profile/profile-form.tsx`
  - Keep sheet container for desktop/legacy usage.

### New components
- `components/mobile/mobile-bottom-tabs.tsx`
- `components/mobile/mobile-lectures-shell.tsx`
- `components/mobile/mobile-course-header.tsx`
- `components/mobile/mobile-week-list.tsx`
- `components/mobile/mobile-lecture-list.tsx`
- `components/mobile/mobile-player-layout.tsx`

## Page-by-Page Build Plan

## Phase 1: Mobile Entry + Bottom Tabs
- Add `/m/lectures` with two tabs: Enrolled, Archives.
- Add mobile bottom tab bar with links:
  - `/m/lectures?tab=enrolled`
  - `/m/lectures?tab=archives`
  - `/m/profile`
- In mobile viewport from existing `/lectures`, add redirect CTA or automatic route handoff to `/m/lectures`.

### Validation
- Desktop `/lectures` unchanged.
- Mobile can switch tabs and deep-link with URL param.

## Phase 2: Profile Page Migration
- Create `/m/profile` page using extracted `profile-form` component.
- Keep existing `ProfileSheet` for desktop or transitional entry points.

### Validation
- Profile save logic parity with existing sheet.
- No regression in enrolled/completed status updates.

## Phase 3: Course and Week Pages
- `/m/course/[subjectId]`:
  - Course summary + progress ring + weeks list.
- `/m/course/[subjectId]/week/[weekId]`:
  - Lectures list with completion status and duration.
- Wire navigation from mobile enrolled/archive cards to new course route.

### Validation
- Week/lecture counts and completion states match desktop sidebar data.
- Back navigation path is clear and predictable.

## Phase 4: Single Lecture Player Page
- `/m/course/[subjectId]/lecture/[videoId]`:
  - Single video player.
  - Title, week label, duration.
  - Mark complete action.
  - Next/Previous lecture controls.
- Keep autoplay optional and lightweight for mobile.

### Validation
- Progress tracking continuity (resume position, completion state, pause save).
- No overlap issues on small-height devices.

## Phase 5: Wiring + Safety
- Mobile-only entry points in existing lecture cards/buttons.
- Keep desktop links unchanged via conditional link targets by breakpoint-aware rendering.
- Add analytics events (optional) for:
  - mobile tab switches
  - course -> week -> lecture funnel

### Validation
- No desktop route behavior change.
- Mobile flow complete without sidebar/sheet dependency.

## State & Data Strategy
- Continue using same Convex queries/mutations.
- Prefer route params over ad-hoc local UI state for active course/week/video.
- Keep URL as source-of-truth for selected tab (`tab=enrolled|archives`).

## Regression Prevention Checklist
- [ ] All desktop routes visually unchanged at `md+`.
- [ ] Mobile routes do not import desktop-only heavy layout wrappers unnecessarily.
- [ ] Same progress mutations used in both desktop and mobile.
- [ ] Existing bookmarks/query-param video links keep working on desktop.
- [ ] `bun run lint` and `bun x tsc --noEmit` pass.

## Sequencing for Incremental Commits
1. `feat(mobile): add /m lectures shell and bottom tabs`
2. `feat(mobile): extract profile form and add /m/profile`
3. `feat(mobile): add course and week pages`
4. `feat(mobile): add single lecture page with progress actions`
5. `refactor(mobile): wire card links and polish navigation`
6. `test(mobile): validate responsive flows and fix regressions`
