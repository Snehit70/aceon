# Test Plan: Completion And Notes

Updated: 2026-05-29

## Preconditions

- Authenticated user session
- At least one enrolled course with multiple weeks/videos
- Dev server running on port `5550`

## Validation Runbook

1. Run `bun x tsc --noEmit` and confirm pass.
2. Open desktop route: `/lectures/[subjectId]`.
3. Open mobile routes:
   - `/m/course/[subjectId]`
   - `/m/course/[subjectId]/week/[weekId]`
   - `/m/course/[subjectId]/lecture/[videoId]`

## Desktop Checks

1. Week action label and behavior:
   - For an incomplete week, action shows mark-done intent.
   - Confirm dialog appears before action.
   - On confirm, all videos in that week become complete.
2. Week unmark behavior:
   - For a complete week, action shows mark-incomplete intent.
   - Confirm dialog appears before action.
   - On confirm, all week videos become incomplete.
3. Course action label and behavior:
   - For incomplete course, action marks all done.
   - For complete course, action marks course incomplete.
   - Confirm dialog appears and action applies to all course videos.

## Mobile Checks

1. Course page (`/m/course/[subjectId]`):
   - Course-level mark/unmark button exists.
   - Each week has mark/unmark button.
   - Both actions require confirmation.
2. Week page (`/m/course/[subjectId]/week/[weekId]`):
   - Week mark/unmark button exists.
   - Confirmation dialog appears.
   - Action toggles all lectures in that week.
3. Cross-surface sync:
   - Perform action on mobile.
   - Open desktop sidebar for same course.
   - Completion state matches.
   - Repeat desktop -> mobile direction.

## Notes Limit Checks

1. Create note exactly `4000` characters: succeeds.
2. Create note at `4001` characters: blocked in UI.
3. Edit existing note to `4000` chars: succeeds.
4. Edit existing note above limit: blocked.
5. Quick composer:
   - Short note supports Enter submit.
6. Expanded composer:
   - Trigger by long input/newline.
   - `Ctrl/Cmd+Enter` submits.

## Mobile Header Visual Checks

1. On course page header:
   - At low completion, image is mostly grayscale.
   - As progress increases, color reveal grows left -> right.
2. On week page header:
   - Same grayscale reveal behavior as course page.
3. At 100%:
   - Header image appears fully colorized (no grayscale mask visible).

## Expected Outcome

- Toggle behavior is reversible and consistent across desktop/mobile.
- Confirmation dialogs gate bulk completion mutations.
- Notes limit is consistently enforced at `4000` chars.
- Progress-driven grayscale reveal behaves predictably on mobile headers.
