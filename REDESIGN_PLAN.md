# Aceon Redesign Plan - Lecture Viewer Transformation

## Research Summary

### Inspiration Sources
- **YouTube**: Ambient Mode glow, red progress bars on thumbnails, gesture controls
- **Coursera**: Academic credibility, week-by-week structure, in-video transcripts
- **Udemy**: Theater mode, timestamped notes panel, feature-rich player
- **Khan Academy**: Mastery indicators, distraction-free player, accessibility focus
- **Skillshare**: Creative poster-style cards, dark theme, community feel
- **Netflix**: Continue watching prominence, micro-progress bars, auto-play next

---

## Design System: "Obsidian Indigo"

### Color Palette (Dark-First)
```css
--background: #0F0D15        /* Deep obsidian */
--surface: #1A1625           /* Elevated surface */
--surface-hover: #251F35     /* Interactive hover */
--border: rgba(139, 92, 246, 0.15)  /* Subtle indigo border */
--border-hover: rgba(139, 92, 246, 0.4)

--primary: #8B5CF6           /* Royal Indigo */
--primary-glow: rgba(139, 92, 246, 0.3)
--accent: #22D3EE            /* Cyan for progress */
--success: #34D399           /* Emerald for completed */
--warning: #FBBF24           /* Amber for in-progress */

--text-primary: #F1F5F9      /* High contrast */
--text-secondary: #94A3B8    /* Muted */
--text-tertiary: #64748B     /* Subtle */
```

### Typography
- **Headings**: Inter (700, 600)
- **Body**: Inter (400, 500)
- **Code/Technical**: JetBrains Mono
- **Base size**: 16px, Line-height: 1.6

---

## Page-by-Page Redesign

### 1. Landing Page (`/`)
**Current**: Generic academic platform messaging
**New Vision**: "The Netflix for IITM Lectures"

#### Hero Section
- [ ] Large tagline: "Your Lecture **Companion**" (gradient text)
- [ ] Subtitle: "Watch, track, bookmark, and master your IITM courses"
- [ ] Single CTA: "Start Watching" → `/lectures`
- [ ] Background: Subtle animated gradient orbs (like Vercel's site)

#### Features Section (3 Bento Cards)
- [ ] **Progress Tracking** - Icon: Play circle with progress ring
- [ ] **Smart Bookmarks** - Icon: Bookmark with timestamp
- [ ] **Timestamped Notes** - Icon: Sticky note with clock

#### Social Proof
- [ ] "Built by IITM students, for IITM students"
- [ ] GitHub stars badge, Open Source badge

---

### 2. Lectures Library (`/lectures`)
**Current**: Basic grid of course cards
**New Vision**: "The Course Browser"

#### Header Section
- [ ] Title: "Your Courses" (not "Lectures Library")
- [ ] Subtitle: Dynamic - "Continue where you left off" or "Pick a course to start"

#### Continue Watching Section (Netflix-style)
- [ ] Horizontal scroll of in-progress videos
- [ ] Large thumbnails with:
  - Red/indigo progress bar at bottom
  - Play button overlay on hover
  - "Resume" text with timestamp (e.g., "12:34 remaining")
- [ ] "Continue Watching" header with count

#### Course Cards Redesign
- [ ] **Layout**: Bento grid (varying sizes for featured courses)
- [ ] **Card Content**:
  - Course code badge (MA1001)
  - Term badge (24T3)
  - Course title (large, bold)
  - Level pill (Foundation/Diploma/Degree)
  - Progress ring or bar (if started)
  - Video count (e.g., "24 lectures")
  - Total duration (e.g., "12h 30m")
- [ ] **Hover Effect**:
  - Subtle scale (1.02)
  - Border glow (primary color)
  - Shadow elevation
  - "View Course →" text appears

#### Filter Bar
- [ ] Sticky on scroll with glassmorphism
- [ ] Search with icon inside input
- [ ] Level filters as pills (All | Foundation | Diploma | Degree)
- [ ] Optional: Sort by (Recent, Name, Progress)

---

### 3. Lecture Viewer (`/lectures/[courseId]`)
**Current**: Functional but basic
**New Vision**: "The Immersive Learning Environment"

#### Video Player Enhancements
- [ ] **Ambient Mode**: Soft glow around player matching video colors (like YouTube)
- [ ] **Controls Redesign**:
  - Glassmorphism control bar
  - Larger, more touch-friendly buttons
  - Speed selector as dropdown (0.5x to 2.5x)
  - Keyboard shortcut hints on hover
- [ ] **Keyboard Shortcut Overlay**: Press `?` to show all shortcuts

#### Sidebar (Course Navigation)
- [ ] **Header**: Course title + overall progress ring
- [ ] **Week Accordions**:
  - Week number + title
  - Progress indicator (3/5 videos watched)
  - Expanded by default for current week only
- [ ] **Video List Items**:
  - Play icon (or checkmark if completed)
  - Video title (truncated)
  - Duration
  - Progress bar (if partially watched)
  - Active state: highlighted background

#### Bottom Panel (Bookmarks + Notes)
- [ ] **Tab Design**: Underline indicator, not boxed tabs
- [ ] **Bookmarks Tab**:
  - "Add Bookmark" button with current timestamp preview
  - List of bookmarks with timestamp, label, delete button
  - Click to seek
- [ ] **Notes Tab**:
  - Quick add input (auto-pauses video)
  - Note cards with timestamp badge
  - Markdown preview
  - Edit/Delete actions

#### Theater Mode
- [ ] Expands video to full width
- [ ] Hides sidebar (accessible via toggle)
- [ ] Notes panel moves below video

---

## Component Library Enhancements

### CourseCard (New)
```
┌─────────────────────────────┐
│ [MA1001] [24T3]             │
│                             │
│ Mathematics I               │
│ Foundation Level            │
│                             │
│ ████████░░░░ 65%            │
│ 18 lectures • 8h 45m        │
│                             │
│ [View Lectures →]           │
└─────────────────────────────┘
```

### VideoCard (Continue Watching)
```
┌─────────────────────────────┐
│                             │
│      [ ▶ PLAY ICON ]        │
│                             │
│ ██████████░░░ (progress)    │
├─────────────────────────────┤
│ L2.3: Database Indexing     │
│ CS2001 • 12:34 remaining    │
└─────────────────────────────┘
```

### ProgressRing
- Circular progress indicator
- Shows percentage in center
- Animated fill on load

### GlassPanel
- Reusable glassmorphism container
- `backdrop-blur-xl bg-white/5 border border-white/10`

---

## Micro-Interactions & Animations

### On Load
- [ ] Staggered card entrance (50ms delay each)
- [ ] Skeleton shimmer while loading

### Hover States
- [ ] Cards: Scale 1.02 + shadow elevation + border glow
- [ ] Buttons: Background shift + slight scale

### Actions
- [ ] Bookmark save: Heart/bookmark icon "pops" (scale 0.8 → 1.2 → 1)
- [ ] Progress update: Progress bar "pulses" briefly
- [ ] Video complete: Confetti burst + checkmark animation

### Transitions
- [ ] Page transitions: Fade + slight slide
- [ ] Tab switches: Underline slides smoothly
- [ ] Accordion: Smooth height animation

---

## Implementation Priority

### Phase 1: Foundation (High Impact)
1. [x] Update color palette in globals.css
2. [x] Redesign CourseCard component
3. [x] Add progress bars to thumbnails
4. [x] Improve Continue Watching section
5. [x] Add hover effects to all interactive elements

### Phase 2: Player Experience
6. [ ] Implement Ambient Mode glow
7. [ ] Redesign video controls
8. [ ] Add keyboard shortcut overlay (`?`)
9. [ ] Improve sidebar with progress indicators

### Phase 3: Polish
10. [x] Add Framer Motion animations
11. [x] Implement skeleton loading states
12. [x] Add micro-interactions (bookmark pop, progress pulse)
13. [ ] Mobile responsiveness improvements

### Phase 4: Advanced
14. [ ] Auto-play next video with countdown
15. [ ] Video transcript search (if available)
16. [ ] Heatmap on seek bar (most replayed sections)

---

## Technical Notes

### Dependencies to Add
- `framer-motion` (already installed)
- Consider: `@tanstack/react-query` for data fetching optimization

### Tailwind Config Updates
- Add custom colors matching the palette
- Add custom animations (shimmer, pulse-glow)
- Extend shadows for layered effect

### Performance Considerations
- Lazy load course cards below the fold
- Use `next/image` with blur placeholders
- Optimize video thumbnails (WebP)

---

## Success Metrics

After redesign, the platform should:
1. **Feel premium** - On par with commercial platforms like Coursera/Udemy
2. **Reduce friction** - One click from landing to video playback
3. **Increase engagement** - Progress visibility encourages completion
4. **Be accessible** - WCAG AA compliant, works with screen readers
5. **Be fast** - <2s initial load, instant navigation

---

*Research completed: $(date)*
*Ready for implementation*
