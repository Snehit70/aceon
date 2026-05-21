# Aceon Product

Updated: 2026-05-21

## Product Summary

Aceon is an academic companion for IITM BS students focused on fast lecture consumption and progress continuity.

Core job-to-be-done:
- help students find the right lecture quickly
- continue exactly where they left off
- finish course content with visible progress and low friction

## Primary Personas

- Active learner tracking current term lectures
- Returning learner resuming incomplete content
- Explorer browsing archive courses by level

## Current Feature Set

- Authenticated course dashboard
- Enrolled vs archive course views
- Level-aware browsing and filtering
- YouTube-based lecture player with custom controls
- Resume from saved position
- Per-video, per-week, per-course completion toggles
- Timestamped video notes
- Dedicated mobile route shell (`/m/*`) with bottom-tab navigation and UA-based redirect from desktop URLs

## UX Principles

- Minimize clicks to start/resume lecture
- Keep progress trustworthy and visible
- Preserve theme consistency (Chainsaw Man visual language)
- Prioritize mobile ergonomics for lecture consumption

## Product Quality Bar

- No broken route transitions between dashboard and player
- Progress always saves on normal playback and pause
- Page-close/tab-hide should preserve last position best-effort
- Course metadata and video ordering must remain stable
- Empty/error states must guide user recovery

## Product Risks

- Progress trust can degrade if beacon path auth/reliability is weak
- Data ingestion quality directly impacts course usability
- Large future catalogs can degrade dashboard responsiveness

## Product Roadmap Priorities

1. Harden progress reliability and integrity end-to-end.
2. Improve discovery quality (search relevance, better filters).
3. Add stronger learner productivity features (notes workflow, quick revisit).
4. Add measurable product analytics (completion funnel, dropout points).

## Success Metrics

- Resume success rate (user returns and resumes intended video/time)
- Course completion rate
- Weekly active learners on `/lectures/[subjectId]`
- Error rate in progress mutation/beacon path
- Median time-to-first-play on player route
