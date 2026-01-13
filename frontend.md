# Frontend Implementation Plan

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Runtime**: Bun
- **UI Library**: shadcn/ui (Nova style)
- **Styling**: Tailwind CSS
- **Icons**: HugeIcons

## Project Structure
- `app/`: Next.js App Router structure
- `components/`: Reusable UI components
  - `ui/`: shadcn/ui primitives
  - `shared/`: App-specific shared components
- `lib/`: Utilities and helpers
- `hooks/`: Custom React hooks

## Core Pages
1.  **Landing Page** (`/`):
    - **Hero Section**:
      - Headline: "Ace Your IITM BS Degree"
      - Subhead: "The ultimate companion for notes, GPA calculation, and exam prep."
      - CTAs: "Get Started" (Primary), "Calculate GPA" (Secondary).
    - **Features Grid (Bento Style)**:
      - **Calculator**: "Predict your grades with precision."
      - **Notes**: "Organized study materials at your fingertips."
      - **Quiz Simulator** (Badge: Coming Soon): "Practice with real exam conditions."
      - **Community** (Badge: Coming Soon): "Connect with peers."
    - **Visuals**: Glassmorphism, dark mode default, subtle animated gradients.

2.  **Dashboard** (`/dashboard`): User overview, progress tracking.
3.  **Notes** (`/notes`): Subject organization, PDF viewer/renderer.
4.  **Calculator** (`/calculator`): GPA/CGPA calculator for IITM BS.
5.  **Quiz** (`/quiz`) [COMING SOON]: Quiz Simulator and Evaluator.
6.  **Community** (`/community`) [COMING SOON]: Discussion forums and groups.
7.  **Profile** (`/profile`): User settings and stats.

## Design Guidelines
- **Theme**: Nova (clean, modern).
- **Color Palette**: Neutral base with subtle accents.
- **Typography**: Inter.
- **Radius**: Default.
