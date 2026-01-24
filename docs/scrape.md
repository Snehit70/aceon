# AceGrade Scraping & Analysis Log

## 1. Overview
**Target Site**: `https://acegrade.in/`
**Goal**: Create a superior version ("Aceon") with better features.

## 2. Site Structure
- **Home**: `https://acegrade.in/`
- **Notes**: `https://acegrade.in/notes` (Features navigation for Quiz Prep, Resources, Community, and Tools)
- **Calculator**: `https://acegrade.in/calculator` (GPA/CGPA Calculator)
- **Quiz Prep**: `https://acegrade.in/quiz-prep` (Host for Simulator and Evaluator)
- **Resources**: `https://acegrade.in/resources` (Likely contains PYQs and study materials)
- **Community**: `DS Groups` and `IITM BS Community`.

## 3. Detailed Feature Analysis

### A. Notes Section (`/notes`)
*Status: Analyzed*
- **Navigation**: Includes links to "Quiz Prep," "Resources," "Community," and "Tools."
- **Focus**: Specifically tailored for IITM BS Degree students.
- **Content Delivery**: Likely uses a Next.js dynamic routing system; specific subject lists are not visible on the public index, suggesting they may be rendered client-side or require a session.

### B. Calculator (`/calculator`)
*Status: Analyzed*
- **Type**: GPA/CGPA Calculator for IITM BS Degree.
- **UI/UX**: Premium aesthetic with dark-themed interface (`bg-black-300`) and modern fonts (Plus Jakarta Sans).
- **Functionality**: Standard weighted average logic for the IITM BS grading system.
- **Aceon Improvement**: Auto-fetch grades/credits if possible, or provide pre-filled templates for each term.

### C. Quiz System / Dashboard
*Status: Analyzed*
- **Core Features**:
    - **Quiz Simulator**: Mock tests for exam preparation.
    - **Quiz Evaluator**: Performance analysis tool.
- **Accessibility**: **NOT PUBLICLY ACCESSIBLE.** These features appear to be behind an authentication wall, indicated by the "Log In" buttons and "Namaskar, [Student ID]" placeholders found in metadata.
- **Prep Features**: "Grade Predictor" for estimating final performance.
- **Aceon Enhancement**:
    - "Test Analytics": Weakness identification.
    - "Spaced Repetition": Remind users to retake quizzes.
    - **Theme**: Polished Shadcn dark theme with refined glassmorphism.

### D. Community & Tools
*Status: Identified*
- **DS Groups**: Likely WhatsApp or Telegram group links for various subjects.
- **IITM BS Community**: General forum or discussion area.
- **Additional Keywords**: "IITM BS PYQ" (Previous Year Questions) and "IITM Online Degree" support.

## 4. Backend API & Data Discovery
*Status: In Progress (Partial Success)*

### A. API Structure
- **Base URL**: `https://acegrade.in/backendapi`
- **Authentication**: Bearer Token (Firebase Auth). Token is persistent and can be reused.

### B. Discovery Strategy: Brute Force
The standard "list courses" endpoint (`/course/userCoursesData`) returned a **500 Internal Server Error**.
We pivoted to a "brute-force" strategy using the predictable IITM course code schema.

- **ID Pattern**: `ns_{term}_{code}`
    - `term`: Currently `24t3` (Year 24, Term 3).
    - `code`: Standard subject codes (e.g., `ma1001`, `cs2001`).
- **Successful Discovery**: 17 valid courses found.

### C. Captured Data (JSON)
We have successfully scraped and saved the following data locally:
1.  **Course Index** (`data_courses_index.json`): List of all 17 discovered courses.
2.  **Course Details** (`data_course:_{id}.json`): Full syllabus metadata for each course.
    - **Fields**: `course_id`, `title`, `forum_url`, `week_wise` (Array of weeks).
    - **Video Data**: `title`, `duration`, `yt_vid` (YouTube ID), `transcript_vtt_url`.

**Valid Course List (Term 24t3):**
- **Foundation**: `ma1001` (Math I), `ma1002` (Stats I), `cs1001` (CT), `cs1002` (Python).
- **Diploma**: `cs2001` (DBMS), `cs2002` (PDSA), `cs2003` (MAD I), `cs2004` (ML Foundations), `cs2005` (Java), `cs2006` (MAD II), `ms2001` (BDM), `cs2007` (MLT), `cs2008` (MLP).
- **Degree/Level 3**: `cs3002` (Software Testing), `cs3003` (AI Search), `cs3004` (Deep Learning), `cs3005` (C Programming).

### D. Known Issues / Missing Data
- **Assignments/Quizzes**: Attempts to access `/assignments` or `/quizzes` sub-paths returned **404 Not Found**. The location of assignment data is currently unknown.
- **Course List API**: The official endpoint to list courses is broken (500 error), forcing reliance on ID prediction.

## 5. "Better Features" Strategy (Aceon)
- **Tech Stack**: Vue 3 + FastAPI + Bun.
- **UI/UX**: Premium aesthetic (Glassmorphism, Dark Mode).
- **Performance**: Instant load times (AceGrade is Next.js, likely fast, but we can optimize).
- **Specific Enhancements**:
    - [ ] **Smart Dashboard**: Visual progress tracking across all subjects.
    - [ ] **Collaborative Notes**: Allow students to suggest edits or comment.
    - [ ] **Analytics**: detailed breakdown of quiz performance (weak areas).
    - [ ] **Schedule/Planner**: Integration with exam dates.

## 6. Technical Reference

### A. JSON Data Schema
The scraped course data (`data_course:_{id}.json`) follows this structure. This is the source of truth for the frontend `CourseView` component.

```typescript
interface CourseData {
  course_id: string;      // e.g., "ns_24t3_cs1002"
  title: string;          // e.g., "Python"
  forum_url: string;      // Link to Discourse forum
  week_wise: WeekModule[];
}

interface WeekModule {
  title: string;          // e.g., "Week 1"
  videos: VideoResource[];
}

interface VideoResource {
  title: string;          // Video title
  yt_vid: string;         // YouTube Video ID (Critical for embedding)
  duration: number;       // Duration in seconds
  availability: "public" | "unlisted";
  transcript_vtt_url: string; // URL to VTT file or empty string
}
```

### B. Scraping Script Usage
To refresh or expand the data:
1.  **Get Token**: Log in to `acegrade.in`, open DevTools > Application > Local Storage (or Network tab), and copy the Firebase Bearer token.
2.  **Save Token**: Paste the token into a file named `token.txt` in the project root.
    - Format: Raw string or JSON `{"stsTokenManager": {"accessToken": "..."}}`.
3.  **Run Script**:
    ```bash
    bun run scripts/scrape-backend.ts
    ```

### C. Failed "Deep Probe" Endpoints
The following endpoints were tested on valid course IDs (e.g., `ns_24t3_cs2001`) and returned **404 Not Found**. Do not retry these without new information.
- `/backendapi/course/{id}/assignments`
- `/backendapi/course/{id}/quizzes`
- `/backendapi/course/{id}/assessments`
- `/backendapi/course/{id}/grades`
- `/backendapi/course/{id}/scores`
- `/backendapi/course/{id}/activities`
- `/backendapi/quiz/course/{id}`
- `/backendapi/assignment/course/{id}`
