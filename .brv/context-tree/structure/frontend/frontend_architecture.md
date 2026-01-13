## Raw Concept
**Task:**
Update frontend architecture with Quiz pages.

**Changes:**
- Added Quiz and Quiz Player pages to the architecture.

**Files:**
- app/quiz/page.tsx
- app/quiz/[id]/page.tsx

**Flow:**
Quiz List -> Quiz Player -> Result Screen

**Timestamp:** 2026-01-13

## Narrative
### Structure
# Project Structure
- `app/`: Next.js App Router.
- `components/`: UI (shadcn) and Shared components.
- `lib/`: Utilities.
- `hooks/`: Custom React hooks.

# Providers (`components/providers.tsx`)
- `ClerkProvider`: Handles authentication.
- `ConvexProviderWithClerk`: Integrates Convex with Clerk auth.
- `ThemeProvider`: Handles dark/light mode (`next-themes`).
- `TooltipProvider`: UI tooltips.
- `Toaster`: Notifications (`sonner`).

### Features
# Core Pages
- **Landing Page (/)**: Hero section, Bento-style features grid.
- **Dashboard (/dashboard)**: Progress tracking.
- **Notes (/notes)**: Subject-wise organization.
- **Calculator (/calculator)**: GPA tools.
- **Quiz (/quiz)**: List of available assessments.
- **Quiz Player (/quiz/[id])**: Interactive quiz interface with progress tracking.

# Design Guidelines
- **Theme**: Nova (clean, modern).
- **Color Palette**: Neutral base with subtle accents.
- **Typography**: Inter font.
- **Visuals**: Glassmorphism, dark mode default.
