## Raw Concept
**Task:**
Define backend architecture and database schema.

**Changes:**
- Documented Convex backend modules and database schema.

**Files:**
- convex.md
- db.md

**Flow:**
Convex (Server Functions) <-> Database (Tables) <-> Client (React Hooks)

**Timestamp:** 2026-01-13

## Narrative
### Structure
# Schema Design
- **users**: `clerkId`, `email`, `name`, `role`, `enrolledCourses`.
- **subjects**: `code`, `name`, `semester`, `credits`.
- **notes**: `subjectId`, `title`, `fileUrl`, `type`, `tags`.
- **gpa_history**: `userId`, `term`, `courses`, `sgpa`.
- **Coming Soon**: `quizzes`, `questions`, `attempts`, `posts`, `comments`.

### Dependencies
# Modules
- **Authentication**: Clerk integration, user profile sync.
- **Notes**: Retrieval and search.
- **Calculator**: SGPA/CGPA storage and history.
- **Real-time**: Live study group chat and reactive updates (upvotes).
