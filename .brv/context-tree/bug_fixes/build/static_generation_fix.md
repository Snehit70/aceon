## Raw Concept
**Task:**
Fix static build generation issues.

**Changes:**
- Fixed static build generation issues by ensuring env vars presence during build.

**Flow:**
Build Phase -> Check Env Vars -> Generate Static Pages

**Timestamp:** 2026-01-13

## Narrative
### Features
# Issue
- Static build generation failing in production/CI.

# Solution
- Ensure all required environment variables (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CONVEX_URL`) are present during the build phase on Vercel.
