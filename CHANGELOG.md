# Changelog

All notable changes to Aceon. This file is generated automatically from GitHub Releases — do not edit it by hand.

## v0.15.1 (2026-06-04)

## What's Changed
* fix: restore mobile lecture fullscreen by @Snehit70 in https://github.com/Snehit70/aceon/pull/41

**Full Changelog**: https://github.com/Snehit70/aceon/compare/v0.15.0...v0.15.1

## Aceon v0.15.0 (2026-06-03)

## Aceon v0.15.0

This release surfaces the new About and Changelog pages, wires up an automated changelog generated from GitHub Releases, and adds navbar shortcuts to reach them — plus a fix so the legal pages stay reachable for signed-out visitors.

## What Changed Since v0.14.0

### About & Changelog pages (new)
- Added an **About** page covering what Aceon is, its features, and contact links.
- Added a **Changelog** page that renders release notes directly in the app.
- Built About / Privacy / Terms on a shared shell so layout and chrome stay consistent.

### Automated changelog
- Added a GitHub Actions workflow that regenerates `CHANGELOG.md` from published GitHub Releases on every release.
- The Changelog page reads that file and renders it as GitHub-flavored markdown, with a graceful placeholder before the first release.

### Navigation
- Surfaced About / Changelog / GitHub links in the navbar for signed-in users (folded into the avatar menu on mobile).
- Privacy and Terms remain reachable from the page footers.

### Fixes
- Legal-page **Back** link now points to a public route, so signed-out visitors who open About / Privacy / Terms from the landing footer are no longer sent to the login wall.

## Scope Summary
- PRs: #38 (`feat: add About/Changelog pages, shared legal shell, and changelog CI`), #39 (`fix(ci): make CI workflow valid`)
- Diff from `v0.14.0`: 17 files changed, 1043 insertions, 301 deletions

## Upgrade Notes
- No migration required.
- The changelog workflow needs repo Actions "Read and write permissions" to commit `CHANGELOG.md`.

**Full Changelog**: https://github.com/Snehit70/aceon/compare/v0.14.0...v0.15.0

## Aceon v0.14.0 (2026-05-29)

## Aceon v0.14.0

This release ships reversible completion controls across desktop/mobile, stronger mobile progress feedback in the course/week headers, and a larger long-form notes workflow.

## What Changed Since v0.13.0

### Reversible completion flows (new)
- Added reversible week-level completion actions (mark complete and mark incomplete).
- Added reversible course-level completion actions (mark complete and mark incomplete).
- Added themed confirmation dialogs for bulk completion actions before mutation execution.
- Added result-aware success toasts so UI confirms whether state changed to complete vs incomplete.

### Cross-surface parity (desktop + mobile)
- Desktop sidebar now supports week/course toggle actions with confirmation.
- Mobile course page now supports course and per-week toggle actions with confirmation.
- Mobile week page now supports week toggle action with confirmation.
- All completion controls use shared Convex mutations for consistent behavior across views.

### Notes workflow upgrade
- Increased note content limit from 1000 to 4000 characters in both frontend and Convex backend validation.
- Improved note composer for longer writing: compact quick-capture + expanded long-form mode.
- Added safer expanded submit behavior (`Ctrl/Cmd+Enter`) to avoid accidental submissions while writing multiline notes.

### Mobile visual progression polish
- Added progress-driven grayscale reveal in mobile course/week headers.
- Tuned grayscale intensity at low progress to preserve the prior high-contrast monochrome feel while still revealing color with completion.

### Post-review hardening
- Enforced mobile 44px minimum touch targets for new completion controls.
- Gated mobile bulk completion controls until progress data is loaded to avoid misleading mark/unmark semantics during loading windows.
- Added focused docs and manual verification checklist for completion/notes behavior.

## Scope Summary
- PR: #37 (`feat: add reversible completion flows + progress-driven mobile header reveal`)
- Diff from `v0.13.0`: completion UX + notes limit/composer improvements + mobile visual progression + review hardening

## Upgrade Notes
- No migration required.
- Completion toggles are intentionally reversible at video/week/course levels.
- Notes API/UI now enforce `4000`-character maximum.

**Full Changelog**: https://github.com/Snehit70/aceon/compare/v0.13.0...v0.14.0

## Aceon v0.13.0 (2026-05-28)

## Aceon v0.13.0

This release ships lecture notes, subtitle overlay + fallback pipeline, playback shortcut improvements, and hardening/fixes from PR review iteration after `v0.12.0`.

## What Changed Since v0.12.0

### Notes system (new)
- Added timestamp-linked lecture notes with create/edit/delete flows.
- Notes are integrated into lecture experience for both desktop and mobile routes.
- Notes are ordered by timestamp for predictable review flow.
- Improved quick-capture UX with undo support for delete operations.

### Subtitle experience (new)
- Added in-player subtitle overlay rendering (captions off by default).
- Added `C` keyboard shortcut to toggle captions.
- Added subtitle API fallback pipeline using `yt-dlp` when transcript URL is missing/invalid.
- Added fallback retry path when stored transcript URLs expire.

### Player shortcuts and interaction
- Added hold-`Space` temporary 2x playback behavior.
- Improved shortcut safety around typing contexts so text inputs/notes fields are not hijacked by global shortcuts.
- Refined subtitle/shortcut state sync behavior for async subtitle loading.

### YouTube embed reliability and recovery
- Added playback-block detection and user recovery overlay for YouTube verification/cookie issues.
- Improved browser guidance steps in recovery UI.
- Fixed stale playback-block overlay so it resets correctly when switching lectures.

### API hardening and backend safety
- Protected `/api/subtitles` with auth and bounded request checks.
- Added caching for subtitle misses to avoid repeated expensive fallback work.
- Improved fallback error classification for missing runtime `yt_dlp` module/tooling.
- Added fail-safe handling so known-video guard lookup failures do not crash subtitle requests.
- Tightened seed/import auth and dedupe safety to preserve existing user-linked progress/notes/video identity during course rewrites.

### Tooling and import pipeline
- Added parallel subtitle enrichment script.
- Added/imported portable course import flow with configurable output paths.
- Aligned local Convex script env behavior with project guidance.

## Scope Summary
- PR: #36 (`feat: add lecture notes, subtitle overlay fallback, and player shortcuts`)
- Follow-up: post-merge stability fix on `main` (`c638b6d`)
- Diff from `v0.12.0`: 19 files changed, 2003 insertions, 138 deletions

## Upgrade Notes
- No database migration required for rollout.
- Runtime subtitle fallback still requires `yt-dlp` availability (binary or `python3 -m yt_dlp`) where fallback extraction is expected.
- Desktop and mobile lecture flows remain compatible with existing course/progress data.

## Aceon v0.12.0 (2026-05-21)

## Aceon v0.12.0

This release ships the full mobile route-shell architecture and UX polish pass delivered after `v0.11.0`.

## What Changed Since v0.11.0

### Mobile architecture (new)
- Introduced a dedicated mobile app surface under `app/m/*`:
  - `/m/lectures`
  - `/m/profile`
  - `/m/course/[subjectId]`
  - `/m/course/[subjectId]/week/[weekId]`
  - `/m/course/[subjectId]/lecture/[videoId]`
- Added `app/m/layout.tsx` shell with sticky bottom-tab navigation.
- Added route-level loading skeletons for all major mobile pages.

### Routing and navigation
- Added UA-based server redirect in `proxy.ts` to route mobile users from legacy lecture paths into the new `/m/*` flow.
- Added compatibility routing for old mobile lecture URLs.
- Added persistent bottom-tab active-state behavior across nested mobile routes.

### Mobile UX and visual polish
- Reworked mobile lectures, course, week, profile, and lecture pages with:
  - Banner + circular progress sections
  - Per-item progress indicators
  - Improved touch targets and navigation affordances
  - Merged primary lecture CTA flow (mark complete + next behavior)
  - Compact mobile player pause overlay sizing
- Updated landing hero to a non-scrolling 3-zone mobile layout.
- Toast positioning refined so notifications do not overlap mobile tab navigation.

### Docs and project guidance alignment
- Updated `README.md`, `docs/ARCHITECTURE.md`, `docs/SYSTEM_DESIGN.md`, `docs/README.md`, `AGENTS.md`, `PRODUCT.md`, and `DESIGN.md` to match shipped mobile architecture.
- Added `docs/MOBILE_WEB_POLISH_PLAN.md` status context.

### Quality fixes
- Fixed JSX lint issue for `// Next` label rendering.

## Scope Summary
- PR: #35 (`feat(mobile): /m route shell, polish pass, and aligned docs`)
- Diff from `v0.11.0`: 30 files changed, 2180 insertions, 62 deletions

## Upgrade Notes
- No migration steps required.
- Desktop flows remain intact; mobile routing now prefers the `/m/*` route shell.

## Aceon v0.11.0 (2026-05-20)

## Highlights
- Refined in-course learning UX with right-side lecture navigation.
- Improved frontend performance (lighter assets and deferred non-critical visuals).
- Added safer and faster Convex course-stats handling.
- Upgraded CI to clearer, separated checks.

## Features
- Moved lecture sidebar to the right in the in-course player.
- Rebalanced player/sidebar layout and spacing across desktop/mobile.
- Added denormalized course stats (`lectureCount`, `totalDurationSeconds`) with recompute utilities.
- Added auto-refresh of course stats during course sync operations.
- Separated CI jobs into `Lint`, `Typecheck`, `Unit Tests`, and `Production Build`.

## Fixes
- Fixed long course-title overlap in cards.
- Fixed in-course loading skeleton to match new right-sidebar layout.
- Fixed mobile content shift when sidebar state is open.
- Fixed noise texture path regression.
- Restricted stats recompute operations to internal-only Convex mutations.
- Fixed CI instability around Clerk/Convex build-time env behavior.

## Performance
- Switched heavy logo usage to optimized WebP assets.
- Reduced landing particle load for mobile and reduced-motion users.
- Deferred lectures background visuals to improve first meaningful render.
- Updated course stats query path to prefer precomputed values with safe fallback.

## Docs and Quality
- Expanded tests and baseline test infrastructure.
- Rewrote architecture/system/product/performance docs for current implementation.

## Notes
- Convex schema updates are backward-compatible (new fields are optional).
- Build check is conditionally skipped when Clerk publishable-key secrets are not configured in CI.

## Aceon 0.10.0 (2026-05-06)

## Aceon 0.10.0

This release is a mobile responsiveness and brand polish pass across the main Aceon experience. The goal was to keep the desktop/laptop layout familiar while making the phone experience feel intentional, compact, and easier to use.

### Highlights

- Refreshed Aceon branding with the new logo in the navbar/footer, a tighter app icon, and a clean browser title.
- Reworked mobile landing hero spacing so the strapline, main title, and CTAs breathe better on phone screens.
- Compressed the lectures dashboard for mobile, including enrolled missions, mission archives, filters, search, and course cards.
- Improved the profile sheet on phones with denser controls, better-fitting course rows, and theme-consistent red/green states.
- Tightened the mobile lecture sidebar so week and video navigation works better as a compact course sheet.
- Upgraded player controls with pointer/touch support for seeking and volume changes.
- Added best-effort landscape orientation lock when entering fullscreen on supported mobile browsers.
- Fixed the mobile lecture navigation sheet accessibility title required by Radix Dialog.

### Documentation

- README now includes mobile testing guidance and the ADB reverse command for phone testing.
- Architecture docs now describe the responsive behavior by surface.
- Design docs now list the brand assets, mobile hero rules, player mobile behavior, and touch-control expectations.

### Validation

- `bun x tsc --noEmit`
- `git diff --check`

### Notes

Desktop visuals are intentionally preserved except for the new Aceon branding. The main layout changes target mobile widths from 320px through 767px, with tablet edge cases improved where needed.

## 0.9.0 (2026-03-07)

## What's Changed
* feat: add view on youtube button to video player by @Snehit70 in https://github.com/Snehit70/aceon/pull/30

**Full Changelog**: https://github.com/Snehit70/aceon/compare/v0.8.1...0.9.0

## v0.8.1 (2026-03-03)

## Bug Fixes

- **Sidebar scroll**: Fixed issue where lecture sidebar content was clipped and unscrollable when weeks were expanded (regression from #26)
- **Fullscreen button**: Replaced non-functional theater mode toggle with actual browser Fullscreen API - now works consistently with the "F" keyboard shortcut

## Full Changelog
https://github.com/Snehit70/aceon/compare/v0.8.0...v0.8.1

## v0.8.0 (2026-02-27)

## What's Changed
* chore: remove tests and testing dependencies by @Snehit70 in https://github.com/Snehit70/aceon/pull/21
* refactor: extract video hooks from lecture player page by @Snehit70 in https://github.com/Snehit70/aceon/pull/22
* feat: implement error boundaries with chainsaw man aesthetic by @Snehit70 in https://github.com/Snehit70/aceon/pull/23
* feat: enhance 404 pages and error handling with chainsaw man theme by @Snehit70 in https://github.com/Snehit70/aceon/pull/24
* feat: optimize performance for LCP and backend queries by @Snehit70 in https://github.com/Snehit70/aceon/pull/25
* fix: improve UI consistency and animations by @Snehit70 in https://github.com/Snehit70/aceon/pull/26
* feat: video player keyboard shortcuts and custom controls by @Snehit70 in https://github.com/Snehit70/aceon/pull/28

**Full Changelog**: https://github.com/Snehit70/aceon/compare/v0.4.1...v0.8.0
