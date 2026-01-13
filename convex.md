# Convex Backend Plan

## Overview
Convex will serve as the backend-as-a-service, handling real-time data syncing, server functions, and database interactions.

## Core Functions

### Authentication
- Integration with **Clerk** for user identity.
- Store user profiles in `users` table synced via webhooks.

### Notes Module
- `getNotes`: Fetch notes by subject/module.
- `searchNotes`: Full-text search for study materials.

### Calculator Module
- `saveCalculation`: Store user's GPA/CGPA calculations.
- `getHistory`: Retrieve past calculations.


### Quiz Module [COMING SOON]
- `getQuizzes`: List available quizzes by subject.
- `getQuizDetails`: Fetch questions for a specific quiz (start attempt).
- `submitAttempt`: Grade the quiz and store the result.
- `getAttemptHistory`: Review past performance.

### Community Module [COMING SOON]
- `getPosts`: Paginated feed of community posts.
- `createPost`: Mutation to add new content.
- `addComment`: Threaded comments on posts.
- `toggleLike`: Reactive like functionality.

### Real-time Features
- Live study group chat using Convex subscriptions.
- Real-time upvote updates.

## Integration
- **Client**: `convex/react` for React hooks.
- **Server**: `convex/server` for backend logic.
