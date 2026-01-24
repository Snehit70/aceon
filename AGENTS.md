# AGENTS.md - Aceon Developer Guide

## 1. Project Overview

Aceon is an academic companion app for IITM BS Degree students.
**Stack**: Next.js 16 (App Router), React 19, Convex (BaaS), Clerk (Auth), Tailwind 4, Shadcn UI.
**Theme**: "Royal Indigo" with glassmorphism effects.
**Core Features**: Lecture Viewer (Course -> Week -> Video), Progress Tracking, Bookmarks, Notes.

## 2. Environment & Commands

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

- Feature: `feat/short-description`
- Fix: `fix/short-description`
- **NEVER** commit directly to `main`.

**Commits**:

- Format: Conventional Commits (e.g., `feat: add bookmark toggle`, `fix: resolve type error in player`).
- Style: Lowercase, imperative, max 72 chars.
- **Rule**: Create granular commits. Verify before committing.

**Process**:

1. **Plan**: Create a checklist in `TODO.md` or memory for complex tasks.
2. **Implement**: Code in small chunks.
3. **Verify**: Run `lint` and `tsc` locally.
4. **Push**: Push to feature branch.

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

## 6. Testing Strategy

- **Unit**: Jest (if setup) or vitest.
- **E2E**: Playwright for critical flows (Auth, Video Playback).
- **Manual**: Verify "Happy Path" before finishing task.

## 7. Known Issues / Context

- `react-player` types can be tricky; strict typing preferred but `any` used historically in `video-player.tsx` (aim to refactor).
- User ID is `clerkId` (string), NOT Convex `_id`.

## 8. Checklist for "Sisyphus"

- [ ] Did I understand the _intent_, not just the instruction?
- [ ] Did I verify the fix with `tsc`?
- [ ] Is the UI consistent with "Royal Indigo"?
- [ ] Did I update the TODO list?
