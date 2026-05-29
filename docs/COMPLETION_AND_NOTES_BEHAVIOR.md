# Completion And Notes Behavior

Updated: 2026-05-29

## Scope

This document describes current user-facing behavior for:

- video/week/course completion toggles
- confirmation flows for bulk completion actions
- notes character limits
- mobile header progress-driven grayscale reveal

## Completion Toggles

### Video level

- Video completion is toggled by `api.progress.markComplete`.
- Behavior is reversible:
  - incomplete -> complete
  - complete -> incomplete

### Week level

- Week completion is toggled by `api.progress.markWeekComplete`.
- Behavior is reversible:
  - if not all week videos are complete, action marks all complete
  - if all week videos are complete, action marks all incomplete
- Desktop and mobile both use the same mutation.

### Course level

- Course completion is toggled by `api.progress.markCourseComplete`.
- Behavior is reversible:
  - if not all course videos are complete, action marks all complete
  - if all course videos are complete, action marks all incomplete
- Desktop and mobile both use the same mutation.

## Confirmation UX

Confirmation dialog is required before bulk actions:

- Mark week complete
- Mark week incomplete
- Mark course complete
- Mark course incomplete

The dialog uses project theme styling (dark surface + blood-red primary action).

## Surface Parity

### Desktop

- `components/lectures/lecture-sidebar.tsx`
- Supports week toggle and course toggle with confirmation.

### Mobile

- `app/m/course/[subjectId]/page.tsx`
- `app/m/course/[subjectId]/week/[weekId]/page.tsx`
- Supports course toggle and week toggle with confirmation.

Both surfaces rely on shared Convex mutations so state stays synchronized after refetch.

## Notes Limit

- Notes now enforce `4000` character maximum in both layers:
  - frontend: `components/lectures/video-notes-panel.tsx`
  - backend: `convex/videoNotes.ts`
- Composer behavior:
  - starts in compact quick-capture mode
  - expands for longer writing
  - expanded mode uses `Ctrl/Cmd+Enter` to submit

## Mobile Header Visual Logic

The mobile course and week headers use a progress-driven grayscale reveal:

- At low completion, image appears mostly grayscale
- As completion increases, color is revealed from left to right
- At 100%, grayscale mask is fully removed

Implementation files:

- `app/m/course/[subjectId]/page.tsx`
- `app/m/course/[subjectId]/week/[weekId]/page.tsx`
