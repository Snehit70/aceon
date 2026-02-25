# Aceon System Design Document

> Comprehensive architectural analysis of the Aceon academic companion platform for IITM BS Degree students.

**Version**: 0.6.0  
**Last Updated**: February 2026  
**Status**: Production

---

## 1. Executive Summary

### What is Aceon?

Aceon is a modern learning management platform designed specifically for IIT Madras BS Degree students. It unifies scattered academic resources into a single, cohesive interface with:

- **Unified Lecture Viewing**: Course → Week → Video hierarchy with embedded YouTube player
- **Real-time Progress Tracking**: Automatic position saving with multiple persistence strategies
- **Course Enrollment Management**: Foundation/Diploma/Degree level organization
- **Video Notes**: Timestamp-linked note-taking during lectures

### Key Capabilities

| Feature | Description |
|---------|-------------|
| Smart Resume | Auto-selects first incomplete video, preserves position across sessions |
| Multi-strategy Progress Save | Throttled (5s) + immediate (pause) + beacon (page close) |
| URL-based State | Video selection persisted in URL for shareable links |
| Real-time Sync | Convex subscriptions for instant UI updates |
| Mobile-responsive | Sheet-based navigation, touch-optimized controls |

### Design Theme

"Chainsaw Man" aesthetic with brutalist angular design:
- **Primary**: Blood Red (#E62E2D)
- **Accent**: Acid Green (#2BFF00)
- **Background**: Black with glassmorphism effects

---

## 2. System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Desktop    │  │    Mobile    │  │    Tablet    │                   │
│  │   Browser    │  │   Browser    │  │   Browser    │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └────────────────┬┴─────────────────┘
                           │ HTTPS
          ┌────────────────▼────────────────┐
          │         VERCEL EDGE CDN         │
          │    (Next.js 16 App Router)      │
          │  ┌──────────────────────────┐   │
          │  │   Static Assets (ISR)    │   │
          │  │   API Routes (/api/*)    │   │
          │  └──────────────────────────┘   │
          └────────────────┬────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌───────────┐      ┌───────────────┐      ┌───────────────┐
│   CLERK   │      │    CONVEX     │      │   YOUTUBE     │
│   (Auth)  │◄────►│  (Backend)    │      │   (Content)   │
│           │      │               │      │               │
│ - OAuth   │      │ - Real-time   │      │ - IFrame API  │
│ - JWT     │      │ - Database    │      │ - Playback    │
│ - Session │      │ - Functions   │      │ - Events      │
└───────────┘      └───────────────┘      └───────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Runtime** | Bun | 1.0+ | Package manager, script execution |
| **Frontend** | Next.js | 16.1.1 | App Router, SSR, ISR |
| **UI** | React | 19.2.3 | Component rendering |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Components** | Shadcn UI + Radix | - | Accessible primitives |
| **Backend** | Convex | 1.31.6 | BaaS with real-time DB |
| **Auth** | Clerk | 6.36.7 | Authentication & session |
| **Video** | YouTube IFrame API | - | Embedded playback |
| **Animation** | Framer Motion | 12.27.5 | Complex transitions |

### Directory Structure

```
aceon/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page (public)
│   ├── lectures/
│   │   ├── page.tsx              # Course dashboard
│   │   └── [subjectId]/
│   │       └── page.tsx          # Lecture player
│   └── api/
│       └── save-progress/route.ts # Beacon endpoint
├── components/
│   ├── ui/                       # Shadcn primitives
│   ├── shared/                   # Reusable components
│   │   ├── video-player.tsx      # YouTube wrapper
│   │   └── navbar.tsx            # Global nav
│   ├── lectures/                 # Lecture-specific
│   │   ├── lecture-sidebar.tsx   # Navigation
│   │   └── lecture-header.tsx    # Video controls
│   └── landing/                  # Marketing
├── convex/                       # Backend functions
│   ├── schema.ts                 # Database schema
│   ├── courses.ts                # Course queries
│   ├── progress.ts               # Progress mutations
│   ├── users.ts                  # User management
│   ├── videoNotes.ts             # Notes CRUD
│   └── seed.ts                   # Data seeding
├── hooks/                        # Custom React hooks
│   ├── use-video-progress.ts     # Progress tracking
│   ├── use-video-navigation.ts   # Video selection
│   └── use-autoplay.ts           # Auto-advance
├── data/                         # JSON course data
├── scripts/                      # CLI utilities
└── lib/
    └── utils.ts                  # Utility functions
```

---

## 3. Core Components

### 3.1 Provider Hierarchy

```
ClerkProvider           # Authentication context
  └─ ConvexProviderWithClerk   # Real-time data with auth
      └─ ThemeProvider         # Dark/light mode
          └─ TooltipProvider   # UI tooltips
              └─ Toaster       # Notifications
```

**File**: `components/providers.tsx`

The provider stack ensures:
1. Clerk auth state is available everywhere
2. Convex mutations include auth context
3. Theme preferences persist
4. Toast notifications work globally

### 3.2 VideoPlayer Component

**File**: `components/shared/video-player.tsx`

Direct YouTube IFrame API integration (no third-party wrapper).

**Responsibilities**:
- Load YouTube API script (singleton pattern)
- Create/destroy player instances on video change
- Track playback state (playing, paused, ended)
- Fire progress updates every 1 second during playback
- Handle initial position seeking
- Expose imperative handle for parent control

**Key Implementation Details**:

```typescript
// Prevent initialPosition prop changes from restarting video
const [videoState, setVideoState] = useState({ videoId, initialPosition });
if (videoState.videoId !== videoId) {
  setVideoState({ videoId, initialPosition });
}
// Only initialPosition from when video changed is used
```

**Callbacks**:
| Callback | When | Purpose |
|----------|------|---------|
| `onProgressUpdate` | Every 1s while playing | Throttled server sync |
| `onPause` | Video pauses | Immediate position save |
| `onEnded` | Video completes | Trigger autoplay |

### 3.3 useVideoProgress Hook

**File**: `hooks/use-video-progress.ts`

Implements three-tier progress persistence:

```
┌─────────────────────────────────────────────────────────┐
│                   PROGRESS SAVE STRATEGIES              │
├─────────────────────────────────────────────────────────┤
│  1. THROTTLED (5s interval)                             │
│     └─ During playback via onProgressUpdate callback    │
│     └─ Reduces server load, acceptable delay            │
│                                                         │
│  2. IMMEDIATE (on pause/seek)                           │
│     └─ Via onPause callback when video pauses           │
│     └─ Catches seek positions missed by throttling      │
│                                                         │
│  3. BEACON (page unload)                                │
│     └─ visibilitychange → sendBeacon to /api/save-progress
│     └─ pagehide → sendBeacon to /api/save-progress      │
│     └─ Survives tab close, browser crash                │
└─────────────────────────────────────────────────────────┘
```

**Why sendBeacon?**
- `fetch()` can be cancelled during page unload
- `navigator.sendBeacon()` completes asynchronously even after page dies
- Requires dedicated API route (no auth headers possible)

### 3.4 useVideoNavigation Hook

**File**: `hooks/use-video-navigation.ts`

Manages video selection with smart defaults:

**Selection Priority**:
1. URL parameter (`?v=videoId`) if video exists in course
2. User selection (from sidebar click)
3. First incomplete video (progress < 100%)
4. First video in course

**URL Sync**:
- `router.replace()` updates URL without navigation
- Enables shareable links and refresh persistence
- Shows toast for invalid video IDs

### 3.5 LectureSidebar Component

**File**: `components/lectures/lecture-sidebar.tsx`

Course navigation with completion tracking:

**Features**:
- Progress circle (SVG with animated stroke-dashoffset)
- Accordion-based week/video hierarchy
- Auto-expands week containing current video
- Bulk completion (week and course level)
- Mobile-responsive (Sheet component)

### 3.6 useAutoplay Hook

**File**: `hooks/use-autoplay.ts`

10-second countdown before auto-advancing:

```
Video Ends → startCountdown(nextVideoId)
    ↓
Show Overlay (10s countdown)
    ↓
[Cancel] ← User clicks → [Play Now]
    ↓                        ↓
Hide overlay            Skip countdown
    ↓                        ↓
                    onAutoplay(nextVideoId)
```

---

## 4. Data Flow Analysis

### 4.1 Video Playback Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│                    VIDEO PLAYBACK REQUEST LIFECYCLE                   │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. User navigates to /lectures/[courseId]?v=[videoId]                │
│     ↓                                                                 │
│  2. LecturePlayerPage mounts                                          │
│     ├─ useQuery(courses.get) → Course metadata                        │
│     ├─ useQuery(courses.getCourseContent) → Weeks + Videos            │
│     └─ useQuery(progress.getCourseProgress) → User progress           │
│     ↓                                                                 │
│  3. useVideoNavigation determines activeVideoId                       │
│     ↓                                                                 │
│  4. VideoPlayer initializes YouTube IFrame API                        │
│     ├─ Loads script (if not cached)                                   │
│     ├─ Creates YT.Player instance                                     │
│     └─ Seeks to initialPosition (from progress)                       │
│     ↓                                                                 │
│  5. User plays video                                                  │
│     ├─ onStateChange → PLAYING                                        │
│     └─ startProgressTracking() → 1s interval                          │
│     ↓                                                                 │
│  6. Every 1s: onProgressUpdate fires                                  │
│     ├─ setCurrentTime(playedSeconds)                                  │
│     └─ If 5s since last save → updateProgress mutation                │
│     ↓                                                                 │
│  7. Video ends (onStateChange → ENDED)                                │
│     ├─ onEnded callback fires                                         │
│     └─ autoplay.startCountdown(nextVideoId)                           │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 4.2 Progress Persistence Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PROGRESS SAVE DECISION TREE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Is video playing?                                                      │
│      │                                                                  │
│      ├── YES: Every 1s check                                            │
│      │      │                                                           │
│      │      └── 5s since last save?                                     │
│      │              │                                                   │
│      │              ├── YES → updateProgress mutation                   │
│      │              │         (progress, watchedSeconds, lastPosition)  │
│      │              │                                                   │
│      │              └── NO → Skip (throttled)                           │
│      │                                                                  │
│      └── NO (paused): onPause fires                                     │
│              │                                                          │
│              └── Immediate updateProgress mutation                      │
│                                                                         │
│  User leaves page?                                                      │
│      │                                                                  │
│      └── visibilitychange/pagehide event                                │
│              │                                                          │
│              └── sendBeacon to /api/save-progress                       │
│                      │                                                  │
│                      └── savePositionBeacon mutation (no auth check)    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Course Discovery Flow

```
User lands on /lectures
    ↓
useQuery(courses.listWithStats)  ──────────────────────┐
    ↓                                                  │
useQuery(users.getUser)                                │ Parallel
    ↓                                                  │
useQuery(progress.getAllCoursesProgress)  ─────────────┘
    ↓
Tabs render:
    ├── "Enrolled" → Filter by enrolledCourseIds
    └── "Library" → Group by level (foundation/diploma/degree)
            │
            └── Each course card shows:
                ├── Code, title, level
                ├── Lecture count, duration
                └── Progress percentage
```

---

## 5. Data Model

### 5.1 Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CONVEX SCHEMA                                  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐         │
│  │   USERS     │       │   COURSES   │       │    WEEKS    │         │
│  ├─────────────┤       ├─────────────┤       ├─────────────┤         │
│  │ _id         │       │ _id         │◄──────│ courseId    │         │
│  │ clerkId  ●──┼───┐   │ code        │       │ title       │         │
│  │ email       │   │   │ title       │       │ order       │         │
│  │ name        │   │   │ level       │       └──────┬──────┘         │
│  │ avatarUrl?  │   │   └─────────────┘              │                │
│  │ joinedAt    │   │                                │                │
│  │ level?      │   │   ┌─────────────┐       ┌──────▼──────┐         │
│  │ enrolled[]──┼───┼──►│ (array ref) │       │   VIDEOS    │         │
│  └─────────────┘   │   └─────────────┘       ├─────────────┤         │
│                    │                         │ _id         │         │
│                    │                         │ weekId      │         │
│  ┌─────────────────┼───────────────────────►│ courseId    │         │
│  │                 │                         │ title       │         │
│  │                 │                         │ youtubeId   │         │
│  │                 │                         │ duration    │         │
│  │                 │                         │ slug        │         │
│  │                 │                         │ order       │         │
│  │                 │                         └──────┬──────┘         │
│  │                 │                                │                │
│  │  ┌──────────────┼────────────────────────────────┤                │
│  │  │              │                                │                │
│  │  ▼              ▼                                ▼                │
│  │  ┌─────────────────────────────┐    ┌──────────────────────────┐  │
│  │  │       VIDEO_PROGRESS        │    │      VIDEO_NOTES         │  │
│  │  ├─────────────────────────────┤    ├──────────────────────────┤  │
│  │  │ _id                         │    │ _id                      │  │
│  │  │ clerkId ◄───────────────────│    │ clerkId ◄────────────────│  │
│  │  │ videoId ◄───────────────────│    │ videoId ◄────────────────│  │
│  │  │ courseId                    │    │ timestamp                │  │
│  │  │ progress (0-1)              │    │ content                  │  │
│  │  │ watchedSeconds              │    │ createdAt                │  │
│  │  │ completed (bool)            │    │ updatedAt                │  │
│  │  │ lastPosition                │    └──────────────────────────┘  │
│  │  │ lastWatchedAt               │                                  │
│  │  └─────────────────────────────┘                                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Table Schemas

**users**
| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | string | Clerk user ID (primary lookup) |
| `email` | string | User email |
| `name` | string | Display name |
| `avatarUrl` | string? | Profile image URL |
| `joinedAt` | number | Unix timestamp |
| `level` | enum? | foundation / diploma / degree |
| `enrolledCourseIds` | Id[] ? | Array of course references |

**courses**
| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Course code (e.g., "CS1001") |
| `title` | string | Full course title |
| `level` | enum | foundation / diploma / degree |

**weeks**
| Field | Type | Description |
|-------|------|-------------|
| `courseId` | Id<courses> | Parent course |
| `title` | string | Week name (e.g., "Week 1") |
| `order` | number | Sort order |

**videos**
| Field | Type | Description |
|-------|------|-------------|
| `weekId` | Id<weeks> | Parent week |
| `courseId` | Id<courses> | Denormalized for queries |
| `title` | string | Video title |
| `youtubeId` | string | YouTube video ID |
| `duration` | number | Duration in seconds |
| `slug` | string | URL-safe identifier |
| `order` | number | Sort order within week |

**videoProgress**
| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | string | User identifier |
| `videoId` | Id<videos> | Video reference |
| `courseId` | Id<courses> | Course reference |
| `progress` | number | 0-1 completion ratio |
| `watchedSeconds` | number | Total watch time |
| `completed` | boolean | True if progress >= 90% |
| `lastPosition` | number | Resume point in seconds |
| `lastWatchedAt` | number | Unix timestamp |

**videoNotes**
| Field | Type | Description |
|-------|------|-------------|
| `clerkId` | string | User identifier |
| `videoId` | Id<videos> | Video reference |
| `timestamp` | number | Video timestamp in seconds |
| `content` | string | Note text |
| `createdAt` | number | Unix timestamp |
| `updatedAt` | number | Unix timestamp |

### 5.3 Indexes

| Table | Index | Fields | Purpose |
|-------|-------|--------|---------|
| users | `by_clerkId` | [clerkId] | User lookup |
| courses | `by_code` | [code] | Course lookup by code |
| weeks | `by_course` | [courseId] | Get weeks for course |
| videos | `by_course` | [courseId] | All videos in course |
| videos | `by_week` | [weekId] | Videos in week |
| videos | `by_youtubeId` | [youtubeId] | Lookup by YouTube ID |
| videos | `search_title` | search: title | Full-text search |
| videoProgress | `by_user` | [clerkId] | User's all progress |
| videoProgress | `by_user_video` | [clerkId, videoId] | Specific video progress |
| videoProgress | `by_user_course` | [clerkId, courseId] | Course progress |
| videoProgress | `by_user_recent` | [clerkId, lastWatchedAt] | Recent videos |
| videoNotes | `by_user` | [clerkId] | User's all notes |
| videoNotes | `by_user_video` | [clerkId, videoId] | Notes for video |

---

## 6. Performance Analysis

### 6.1 Throughput Characteristics

| Operation | Frequency | Bottleneck | Mitigation |
|-----------|-----------|------------|------------|
| Course list | Page load | DB query | Cached via Convex |
| Course content | Page load | DB joins | Batched in getCourseContent |
| Progress read | Page load | DB index | by_user_course index |
| Progress write | Every 5s | DB mutation | Client-side throttling |
| Beacon save | Tab close | HTTP POST | Async, fire-and-forget |

### 6.2 Latency Breakdown

**Lecture Page Load** (Cold start):
```
Client Request ────────────────────────────────────────────────────► 
    │
    ├── DNS + TLS (50-100ms)
    │
    ├── Vercel Edge (5-20ms)
    │       └── Next.js SSR/ISR
    │
    ├── Convex Queries (parallel) ─────────────────────────────────┐
    │       ├── courses.get (~10-30ms)                             │
    │       ├── courses.getCourseContent (~20-50ms)                │ ~50-80ms
    │       └── progress.getCourseProgress (~15-40ms)              │
    │                                                              ┘
    ├── YouTube IFrame Load (~100-200ms)
    │
    └── First Paint (~200-400ms total)
```

**Progress Update** (Warm):
```
Client Mutation ────► Convex (5-15ms) ────► DB Write ────► Subscription Broadcast
                                                                  │
                                                                  ▼
                                               Other tabs get real-time update
```

### 6.3 Resource Usage

| Resource | Development | Production | Notes |
|----------|-------------|------------|-------|
| Client JS | ~500KB gzipped | ~200KB gzipped | Includes React, Convex client |
| Memory (client) | ~50-100MB | ~30-50MB | YouTube player dominates |
| Convex reads | ~10/page | ~10/page | Subscription-based, efficient |
| Convex writes | ~12/minute | ~12/minute | While watching (5s throttle) |

### 6.4 Scaling Considerations

**Current Limits**:
- Convex free tier: 100K function calls/month, 1M DB reads/month
- No explicit rate limiting on progress writes
- Single YouTube player instance (appropriate)

**Scaling Strategies**:
1. **Vertical**: Convex paid tier removes limits
2. **Horizontal**: N/A (serverless by design)
3. **Optimization**: Reduce progress write frequency (10s vs 5s)

---

## 7. Distributed Systems Analysis

### 7.1 CAP Theorem Trade-offs

Aceon prioritizes **Availability** and **Partition Tolerance** over **Consistency**:

| Property | Status | Implementation |
|----------|--------|----------------|
| **Consistency** | Eventual | Convex optimistic updates, last-write-wins |
| **Availability** | High | Serverless architecture, edge CDN |
| **Partition Tolerance** | Yes | Convex handles network issues gracefully |

**Consistency Model**: Last-Write-Wins
- Progress updates use `Math.max(existing.progress, args.progress)`
- Multiple tabs can conflict but converge to highest value
- Beacon saves may race with mutation saves (acceptable)

### 7.2 Failure Modes

| Scenario | Impact | Handling |
|----------|--------|----------|
| Convex unavailable | Can't save progress | Client continues, retries silently |
| YouTube unavailable | Video won't play | Error display in player area |
| Clerk unavailable | Can't authenticate | Clerk handles with fallback UI |
| Network partition | Mutations queued | Convex optimistic updates + retry |
| Tab crash | Potential data loss | sendBeacon fires on visibilitychange |

### 7.3 Real-time Sync Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CONVEX REAL-TIME SYNC                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Tab A                    Convex                    Tab B         │
│    │                        │                         │           │
│    │ ── useQuery(progress) ─► Subscription            │           │
│    │ ◄── Initial data ──────┤                         │           │
│    │                        │ ◄── useQuery(progress) ─│           │
│    │                        ├── Initial data ────────►│           │
│    │                        │                         │           │
│    │ ── mutation(update) ──►│                         │           │
│    │ ◄── Optimistic update ─┤                         │           │
│    │                        │── DB write ─────────────┤           │
│    │                        │                         │           │
│    │                        ├── Broadcast ───────────►│           │
│    │                        │                         │           │
│    │                        │  (Both tabs now synced) │           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Analysis

### 8.1 Authentication Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      CLERK AUTHENTICATION                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. User clicks "Sign In" or protected route                      │
│     ↓                                                             │
│  2. Clerk Modal/Redirect (OAuth or email)                         │
│     ↓                                                             │
│  3. Clerk issues JWT with `subject` = clerkId                     │
│     ↓                                                             │
│  4. ConvexProviderWithClerk passes token to Convex                │
│     ↓                                                             │
│  5. Convex mutations/queries check ctx.auth.getUserIdentity()     │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 8.2 Authorization Model

| Layer | Check | Implementation |
|-------|-------|----------------|
| Frontend | Route protection | Clerk `<SignedIn>` / `<SignedOut>` |
| Convex Query | User isolation | `identity.subject === args.clerkId` |
| Convex Mutation | User isolation | Same check, throws on mismatch |
| API Route | No auth | sendBeacon can't include headers |

**Security Note**: `/api/save-progress` has no auth check by design. The `savePositionBeacon` mutation only updates existing progress records (won't create new ones), limiting abuse potential.

### 8.3 Data Protection

| Concern | Status | Notes |
|---------|--------|-------|
| HTTPS | Yes | Enforced by Vercel |
| Data at rest | Yes | Convex handles encryption |
| PII | Minimal | Only email, name from Clerk |
| Secrets | .env.local | Never committed |
| CORS | Handled | Convex/Clerk manage |

### 8.4 Potential Vulnerabilities

| Risk | Severity | Mitigation |
|------|----------|------------|
| Progress spoofing via beacon | Low | Can only update existing records |
| Video ID enumeration | Low | YouTube IDs are public anyway |
| Rate limiting absence | Medium | Add Convex rate limiting for mutations |
| XSS in notes | Low | React escapes by default |

---

## 9. Reliability Patterns

### 9.1 Error Handling

| Layer | Strategy |
|-------|----------|
| Convex queries | Return empty array/null on auth fail |
| Convex mutations | Throw error, catch in UI |
| API routes | Try-catch with JSON error response |
| React components | Error boundaries, fallback UI |
| Video player | Graceful degradation to error state |

### 9.2 Retry Logic

| Operation | Strategy |
|-----------|----------|
| Convex mutations | Automatic (built-in) |
| Progress save | Fire-and-forget with .catch() |
| YouTube load | Manual retry via video change |
| Network errors | Convex handles reconnection |

### 9.3 Health Monitoring

Currently no explicit health checks. Recommendations:
1. Add `/api/health` endpoint
2. Convex dashboard for function metrics
3. Sentry or similar for error tracking

---

## 10. Key Features Deep Dive

### 10.1 Smart Resume

**Problem**: User should resume exactly where they left off.

**Solution**:
1. URL preserves video selection (`?v=videoId`)
2. `lastPosition` saved with multiple strategies
3. `initialPosition` prop passed to VideoPlayer
4. YouTube `start` param for initial seek
5. `seekTo()` called on player ready for mid-video switches

**Edge Cases**:
| Scenario | Behavior |
|----------|----------|
| Hard refresh | URL → video, DB → position |
| Mark complete | Position cleared to 0 |
| Invalid video in URL | Toast + fallback to first incomplete |

### 10.2 Auto-Complete at 90%

**Problem**: User shouldn't need to watch credits to mark complete.

**Implementation**:
```typescript
const completed = args.progress >= 0.9;
// In updateProgress mutation
```

### 10.3 Bulk Completion

**Week Complete**:
- Finds all videos in week
- Checks existing progress for each
- Toggles all (if all complete → uncomplete, else → complete)
- Creates progress records for unwatched videos

**Course Complete**:
- Same pattern, across all videos in course

---

## 11. Configuration

### 11.1 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CONVEX_DEPLOYMENT` | Yes | Convex deployment name |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Convex HTTP URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk public key |
| `CLERK_SECRET_KEY` | Yes | Clerk backend key |

### 11.2 Convex Auth Config

**File**: `convex/auth.config.ts`

```typescript
{
  providers: [{
    domain: "https://related-snipe-20.clerk.accounts.dev",
    applicationID: "convex",
  }]
}
```

### 11.3 Development Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start Next.js + Convex dev servers |
| `bun run build` | Production build |
| `bun run lint` | ESLint check |
| `bun x tsc --noEmit` | TypeScript type check |
| `bun x convex dev` | Convex dev server only |

---

## 12. Deployment

### 12.1 Production Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION DEPLOYMENT                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  GitHub Repository                                                   │
│      │                                                               │
│      │ Push to main                                                  │
│      ▼                                                               │
│  ┌───────────────┐      ┌───────────────┐      ┌───────────────┐    │
│  │   Vercel CI   │─────►│  Vercel Edge  │      │    Convex     │    │
│  │               │      │               │      │  (prod:glad-  │    │
│  │ - Build       │      │ - SSR/ISR     │◄────►│   marten-760) │    │
│  │ - Deploy      │      │ - CDN cache   │      │               │    │
│  │ - Preview     │      │ - API routes  │      │ - Real-time   │    │
│  └───────────────┘      └───────────────┘      │ - Functions   │    │
│                                                │ - Database    │    │
│                                                └───────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 12.2 Important Notes

- **Local dev uses PRODUCTION database** (`prod:glad-marten-760`)
- Dev deployment exists but is unused (`dev:marvelous-lobster-114`)
- Port: 5550 (configured for local development)

---

## 13. Known Limitations

| Limitation | Impact | Workaround |
|------------|--------|------------|
| No offline support | Can't watch offline | Service worker future work |
| Single player instance | No picture-in-picture | YouTube native PiP works |
| No transcript search | Can't search within videos | Future enhancement |
| Notes not exportable | Data locked in platform | API endpoint needed |
| No mobile app | Browser-only | PWA installable |

---

## 14. Future Enhancements

### High Priority
1. **Transcript Integration** - Add `transcriptUrl` to videos, display alongside
2. **Keyboard Shortcuts** - Seek, play/pause, mark complete (hook exists but unused)
3. **Search Improvement** - Full-text search across notes and transcripts

### Medium Priority
4. **PWA Support** - Offline caching, installability
5. **Analytics Dashboard** - Study time, completion trends
6. **Social Features** - Leaderboards, study groups

### Low Priority
7. **Multiple Playback Speeds** - Server-saved preference
8. **Dark/Light Theme** - Currently forced dark
9. **Internationalization** - Hindi support for IITM students

---

## 15. Appendices

### A. API Reference

#### Convex Queries

| Query | Args | Returns |
|-------|------|---------|
| `courses.list` | - | Course[] |
| `courses.listWithStats` | - | (Course & stats)[] |
| `courses.get` | id | Course |
| `courses.getCourseContent` | courseId | (Week & videos)[] |
| `courses.searchLectures` | searchQuery, limit? | Video[] |
| `progress.getProgress` | clerkId, videoId | Progress |
| `progress.getCourseProgress` | clerkId, courseId | Progress[] |
| `progress.getAllCoursesProgress` | clerkId | Record<courseId, %> |
| `users.getUser` | clerkId | User |

#### Convex Mutations

| Mutation | Args | Returns |
|----------|------|---------|
| `progress.updateProgress` | clerkId, videoId, courseId, progress, watchedSeconds, lastPosition | Id |
| `progress.savePositionBeacon` | clerkId, videoId, courseId, lastPosition | Id |
| `progress.markComplete` | clerkId, videoId, courseId | Id |
| `progress.markWeekComplete` | clerkId, courseId, weekId | { markedCount, completed } |
| `progress.markCourseComplete` | clerkId, courseId | { markedCount, completed } |
| `users.updateUser` | clerkId, level, enrolledCourseIds | Id |
| `users.enrollInCourse` | clerkId, courseId | void |
| `users.unenrollFromCourse` | clerkId, courseId | void |
| `videoNotes.addNote` | clerkId, videoId, timestamp, content | Id |
| `videoNotes.updateNote` | noteId, content | void |
| `videoNotes.deleteNote` | noteId | void |

### B. Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Progress not saving | Auth mismatch | Check Clerk session |
| Video not loading | YouTube blocked | Check network/adblocker |
| Page stuck loading | Convex subscription | Refresh, check console |
| Wrong video selected | Invalid URL param | Toast shown, fallback used |

### C. Data Pipeline

Course data flows from external sources:

```
1. External IITM Portal
       ↓
2. Scraper Scripts (scripts/*.ts)
       ↓
3. JSON Files (data/*.json)
       ↓
4. Seed Script (scripts/seed-database.ts)
       ↓
5. Convex Database
       ↓
6. Client via useQuery
```

### D. Component Hierarchy

```
RootLayout
├── Navbar (global)
└── Page Content
    ├── LandingPage (/)
    │   ├── Hero
    │   │   └── Particles
    │   └── Footer
    │
    ├── LecturesPage (/lectures)
    │   ├── ProfileSheet
    │   └── Tabs
    │       ├── Enrolled (ChainsawCard[])
    │       └── Library (Accordion + ChainsawCard[])
    │
    └── LecturePlayerPage (/lectures/[subjectId])
        ├── LectureSidebar (desktop) / Sheet (mobile)
        ├── VideoPlayer
        ├── AutoplayOverlay (conditional)
        └── LectureHeader
```

---

*Document generated: February 2026*  
*For questions or updates, contact the development team.*
