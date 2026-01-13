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

## 4. "Better Features" Strategy (Aceon)
- **Tech Stack**: Vue 3 + FastAPI + Bun.
- **UI/UX**: Premium aesthetic (Glassmorphism, Dark Mode).
- **Performance**: Instant load times (AceGrade is Next.js, likely fast, but we can optimize).
- **Specific Enhancements**:
    - [ ] **Smart Dashboard**: Visual progress tracking across all subjects.
    - [ ] **Collaborative Notes**: Allow students to suggest edits or comment.
    - [ ] **Analytics**: detailed breakdown of quiz performance (weak areas).
    - [ ] **Schedule/Planner**: Integration with exam dates.
