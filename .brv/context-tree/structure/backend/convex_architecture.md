## Raw Concept
**Task:**
Update backend architecture with Quiz module.

**Changes:**
- Documented Quiz backend logic and updated schema status.

**Files:**
- convex/quizzes.ts

**Flow:**
Client (Answers) -> Convex Mutation (Scoring) -> Database (Attempt) -> Client (Result)

**Timestamp:** 2026-01-13

## Narrative
### Structure
# Schema Design
- **users**: `clerkId`, `email`, `name`, `role`, `enrolledCourses`.
- **subjects**: `code`, `name`, `semester`, `credits`.
- **notes**: `subjectId`, `title`, `fileUrl`, `type`, `tags`.
- **gpa_history**: `userId`, `term`, `courses`, `sgpa`.
- **quizzes**: `title`, `subjectId`, `difficulty`, `durationMinutes`, `totalQuestions`.
- **questions**: `quizId`, `text`, `options`, `correctOption` (server-only).
- **attempts**: `userId`, `quizId`, `score`, `answers`, `completedAt`.
- **Coming Soon**: `posts`, `comments`.

### Dependencies
# Modules
- **Authentication**: Clerk integration, user profile sync.
- **Notes**: Retrieval and search.
- **Calculator**: SGPA/CGPA storage and history.
- **Quiz**: Server-side scoring, attempt tracking, and question management.
- **Real-time**: Live study group chat and reactive updates (upvotes).
