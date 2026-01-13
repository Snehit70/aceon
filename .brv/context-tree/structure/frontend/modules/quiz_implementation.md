## Raw Concept
**Task:**
Document Quiz module implementation.

**Changes:**
- Implemented full Quiz system with secure server-side scoring.

**Files:**
- convex/quizzes.ts
- app/quiz/page.tsx
- app/quiz/[id]/page.tsx

**Flow:**
Fetch Quiz/Questions -> Interactive Solve -> Submit to Server -> View Result

**Timestamp:** 2026-01-13

## Narrative
### Structure
# Implementation Details
- **List Page**: `app/quiz/page.tsx` (Fetches all quizzes).
- **Player Page**: `app/quiz/[id]/page.tsx` (Dynamic route for specific quiz).
- **Backend**: `convex/quizzes.ts` (Handles secure scoring and data retrieval).
- **UI Components**: `Progress`, `RadioGroup`, `Badge`, `Skeleton`, `Card`.

### Features
# Quiz Module
- **Quiz Discovery**: List quizzes with difficulty badges and metadata (duration, questions).
- **Interactive Player**: 
  - Real-time progress tracking.
  - Radio group selection for options.
  - Secure submission flow.
- **Server-side Scoring**: 
  - Correct answers are never sent to the client.
  - Scoring logic runs on Convex for integrity.
- **Attempt Tracking**: Persists user results (score, correct count, timestamp) to the database.
- **User Stats**: Aggregate query to show average score and recent performance.
