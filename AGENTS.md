# AGENTS.md - Aceon Developer Guide

## 1. Project Overview

** never push any code you can only commti and never push even if the users asks you too do that



Aceon is an academic companion app for IITM BS Degree students.
**Stack**: Next.js 16 (App Router), React 19, Convex (BaaS), Clerk (Auth), Tailwind 4, Shadcn UI.
**Theme**: "Royal Indigo" with glassmorphism effects / Chainsaw Man aesthetic.
**Core Features**: Lecture Viewer (Course -> Week -> Video), Progress Tracking (with toggle mark complete/incomplete).

## 2. Environment & Commands

the port is 5550 understood ?

**Package Manager**: `bun`

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

### Current Implementation State (Jan 29, 2026)

**Recent Updates:**
- **Schema Migration**: Removed dead fields (courseId, term, forumUrl, credits from courses; isPublic from videos)
- **Simplified UI**: Bookmark/notes panels removed for cleaner experience
- **Video Player**: Refactored to use direct YouTube IFrame API (no third-party dependencies)
- **Progress Tracking**: Mark complete is now a toggle (can mark/unmark videos)
- **Sidebar Toggle**: Brutalist hover effect styling

**Design System:**
- **Background Images**: `bg-denji-power.jpg` and `bg-denji-demon.jpg` are rotated to landscape orientation
- **Sidebar Design**: Uses single background image in header only (full sidebar background removed for performance)
- **Mobile Support**: Responsive improvements completed for 375px+ devices
- **Visibility Pattern**: Header uses opacity-60 background + via-black/70 gradient + backdrop-blur-sm + drop-shadow-lg text
- **Button Pattern**: Subtle backgrounds (bg-white/5) with borders for visibility over images

**Branch Status:**
- Working tree clean, up to date with origin/main
- Unmerged remote branch: `remotes/origin/coderabbitai/docstrings/5381e4e` (can be ignored/deleted)

## 9. Checklist for "Sisyphus"

- [ ] Did I understand the _intent_, not just the instruction?
- [ ] Did I verify the fix with `tsc`?
- [ ] Is the UI consistent with "Royal Indigo"?
- [ ] Did I update the TODO list?
