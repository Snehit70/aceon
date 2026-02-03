# AGENTS.md - Aceon Developer Guide

## 1. Project Overview

** never push any code you can only commit and never push even if the user asks you to do that



Aceon is an academic companion app for IITM BS Degree students.
**Stack**: Next.js 16 (App Router), React 19, Convex (BaaS), Clerk (Auth), Tailwind 4, Shadcn UI.
**Theme**: Chainsaw Man aesthetic - Blood Red (#E62E2D) primary, Acid Green (#2BFF00) accent, brutal angular design with glassmorphism effects.
**Core Features**: Lecture Viewer (Course -> Week -> Video), Progress Tracking (with toggle mark complete/incomplete).

## 2. Environment & Commands

**Port**: 5550

**Package Manager**: `bun`

**Convex Deployment**: 
- **Local dev uses PRODUCTION database** (`prod:glad-marten-760`)
- ⚠️ **DO NOT switch to dev deployment** - all real data is in production
- Dev deployment (`dev:marvelous-lobster-114`) exists but is empty/unused

| Action            | Command                        | Notes                               |
| ----------------- | ------------------------------ | ----------------------------------- |
| **Dev Server**    | `bun run dev`                  | Starts Next.js + Convex (auto-push) |
| **Lint**          | `bun run lint`                 | Run ESLint                          |
| **Type Check**    | `bun x tsc --noEmit`           | Verify TypeScript types             |
| **Build**         | `bun run build`                | Production build                    |
| **Test (E2E)**    | `bun x playwright test`        | Run all E2E tests                   |
| **Test (Single)** | `bun x playwright test <file>` | Run specific test file              |
| **Convex**        | `bun x convex dev`             | Run backend dev server              |

## 3. Workflow & Git

**Persona**: You are Sisyphus, a Senior Engineer.
**Branching**:

- Feature branches (`feat/short-description`) for large features or experimental work
- Fix branches (`fix/short-description`) for complex bug fixes
- Direct commits to `main` are acceptable for:
  - Small fixes and improvements
  - UI/UX tweaks
  - Documentation updates
  - Refactoring within existing patterns

**Commits**:

- Format: Conventional Commits (e.g., `feat: add bookmark toggle`, `fix: resolve type error in player`).
- Style: Lowercase, imperative, max 72 chars.
- **Rule**: Create granular commits. Verify before committing.

**Process**:

1. **Plan**: Create a checklist in `TODO.md` or memory for complex tasks.
2. **Implement**: Code in small chunks.
3. **Verify**: Run `lint` and `tsc` locally.
4. **Commit**: Commit to main for small changes, feature branch for large work.
5. **Push**: Push changes to remote.

## 4. Code Style & Patterns

### TypeScript

- **Strict Mode**: Enabled. No implicit `any`.
- **Types**: Use interfaces for props (e.g., `VideoPlayerProps`). Export shared types.
- **Convex**: Use `v` from `convex/values` for schema validation.
- **Avoid**: `@ts-ignore`, `as any` (unless absolutely necessary with comment).

### React & Next.js

- **Components**: Functional components. Use `export default function Name`.
- **Hooks**: Custom hooks in `hooks/`. standard hooks (`useState`, `useEffect`) first.
- **Client vs Server**: Use `"use client"` at the top of client components.
- **Imports**: Use `@/` alias (e.g., `@/components/ui/button`).

### Styling (Tailwind + Shadcn)

- **Utility First**: Use Tailwind classes.
- **Merging**: Use `cn()` utility for conditional classes.
- **Icons**: `lucide-react` is the standard icon set.
- **Animation**: `framer-motion` for complex transitions; `tailwindcss-animate` for simple ones.

### Backend (Convex)

- **Queries**: `export const name = query({ args: {...}, handler: async (ctx, args) => {...} })`
- **Mutations**: `export const name = mutation({ args: {...}, handler: async (ctx, args) => {...} })`
- **Auth**: Check `ctx.auth.getUserIdentity()` or pass `clerkId`.

## 5. Specific Guidelines

- **Mobile First**: Always ensure responsive design (Sheet for sidebar on mobile).
- **Glassmorphism**: Use `bg-card/50 backdrop-blur-sm` patterns.
- **Error Handling**: Fail gracefully. Show UI feedback (toasts via `sonner`).

### Text Visibility Over Images

When placing text over background images, use this pattern for optimal readability:

1. **Background Image**: Set opacity to 60 or lower (`opacity-60`)
2. **Gradient Overlay**: Use strong gradients (`via-black/70` or darker)
3. **Backdrop Blur**: Add `backdrop-blur-sm` to container
4. **Text Shadows**: Apply `drop-shadow-lg` to all text elements
5. **Button Styling**: Use `bg-white/5 hover:bg-white/10 border border-white/10` for subtle prominence

**Example Pattern** (from LectureSidebar header):

```tsx
<div className="relative p-4 backdrop-blur-sm">
  <div className="absolute inset-0 bg-[url('/path/to/image.jpg')] opacity-60" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/70 to-black" />
  <div className="relative z-10">
    <h2 className="drop-shadow-lg">Title</h2>
    <Button className="bg-white/5 hover:bg-white/10 border border-white/10">
      Action
    </Button>
  </div>
</div>
```

### Mobile Responsive Patterns

- **Touch Targets**: Minimum `min-h-[44px]` for all interactive elements
- **Sidebar Width**: Use `w-[85vw] max-w-80` to show peek of content behind
- **Profile Sheet**: Use `w-full max-w-[400px]` to prevent overflow on small screens
- **Video Height**: Constrain with `max-h-[50vh] sm:max-h-none` on mobile
- **Media Queries**: Use `useMediaQuery` hook for SSR-safe responsive detection

## 6. Component Architecture

### Key Components

**LectureSidebar** (`components/lectures/lecture-sidebar.tsx`)

- Main course navigation component
- Header section uses background image with visibility pattern (see Section 5)
- Displays course progress, week list, and video navigation
- Mobile responsive: Uses Sheet component on mobile, full sidebar on desktop
- Background: Single image in header only (removed full sidebar background for performance)

**VideoPlayer** (`components/shared/video-player.tsx`)

- Direct YouTube IFrame API integration (no third-party wrapper)
- Includes landscape rotation hint on mobile portrait mode
- Height constraint: `max-h-[50vh] sm:max-h-none` on mobile
- Integrates with progress tracking (toggle mark complete/incomplete)

**ProfileSheet** (`components/profile/profile-sheet.tsx`)

- User profile and settings
- Mobile responsive: `w-full max-w-[400px]` to prevent overflow
- Uses Sheet component for mobile-friendly drawer

**LectureHeader** (`components/lectures/lecture-header.tsx`)

- Course header with navigation
- Touch targets: All buttons use `min-h-[44px]` for mobile accessibility

**LecturesSkeleton** (`components/lectures/lectures-skeleton.tsx`)

- Reusable loading state for lectures dashboard
- Supports `mode="enrolled"` (Grid) and `mode="library"` (Accordion List)
- Matches Chainsaw Man aesthetic (Halftone/Noise backgrounds)
- Used in `app/lectures/page.tsx` with dynamic mode switching based on URL params

**useMediaQuery Hook** (`hooks/use-media-query.ts`)

- SSR-safe media query detection
- Used for responsive behavior across components
- Prevents hydration mismatches

## 7. Testing Strategy

- **Unit**: Jest (if setup) or vitest.
- **E2E**: Playwright for critical flows (Auth, Video Playback).
- **Manual**: Verify "Happy Path" before finishing task.

## 8. Known Issues / Context

- User ID is `clerkId` (string), NOT Convex `_id`.

## 9. Version Management

This project follows Semantic Versioning (MAJOR.MINOR.PATCH) with **automatic version bumping**.

### Automatic Version Bumping (GitHub Action)

A GitHub Action (`.github/workflows/version-bump.yml`) automatically bumps the version when PRs are merged to `main`:

| Commit Prefix | Bump Type | Example |
|---------------|-----------|---------|
| `fix:` | Patch | 0.3.0 → 0.3.1 |
| `feat:` | Minor | 0.3.0 → 0.4.0 |
| `feat!:` or `BREAKING CHANGE:` | Major | 0.3.0 → 1.0.0 |
| `chore:`, `docs:`, `refactor:` | No bump | — |

The action:
1. Triggers on push to `main` (after PR merge)
2. Parses the commit message
3. Determines bump type from conventional commit prefix
4. Updates `package.json` version
5. Commits with message `chore: bump version to X.Y.Z`

**⚠️ IMPORTANT: Use "Squash and merge"** when merging PRs. This makes the PR title become the commit message, which the action parses. Regular merge commits (`Merge pull request #...`) won't trigger version bumps.

**No manual version bumping required** — just use proper PR titles with conventional commit prefixes.

### Manual Override

For special cases (e.g., release candidate), manually update `package.json` and commit with `chore: bump version to X.Y.Z` (the action skips these commits).

**Current Version**: 0.3.0
**Goal**: Reach 1.0.0 when production-ready.

## 10. Checklist for "Sisyphus"

- [ ] Did I understand the _intent_, not just the instruction?
- [ ] Did I verify the fix with `tsc`?
- [ ] Is the UI consistent with Chainsaw Man theme (Blood Red #E62E2D)?
- [ ] Did I update the TODO list?
