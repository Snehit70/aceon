## Raw Concept
**Task:**
Implement GPA Calculator for IITM BS degree.

**Changes:**
- Implemented GPA Calculator with dynamic state and Convex persistence.

**Files:**
- app/calculator/page.tsx

**Flow:**
User Input -> React State -> SGPA Calculation -> Convex Mutation -> Database Storage

**Timestamp:** 2026-01-13

## Narrative
### Structure
# Implementation Details
- **File**: `app/calculator/page.tsx` (Client Component)
- **State**: `courses` (Array of objects), `termName` (String).
- **Hooks**: `useState`, `useMutation` (Convex), `useUser` (Clerk).
- **Logic**: Iterates through courses, multiplies credits by grade points, and divides by total credits.

### Features
# GPA Calculator Module
- Dynamic course management (Add/Remove courses).
- Grade point mapping (S:10, A:9, B:8, C:7, D:6, E:4, U:0).
- Automatic SGPA calculation logic.
- Persistence: Saves calculations to Convex database (`gpa_history` table).
- UI: Uses shadcn/ui Card, Input, Select, and Button components.
- Feedback: Sonner toasts for success/error states.
