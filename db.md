# Database Schema Design (Convex)

## Users
```typescript
// users table
{
  clerkId: string,      // Indexed for auth lookup
  email: string,
  name: string,
  avatarUrl?: string,
  role: "student" | "admin",
  enrolledCourses: string[], // Array of Course IDs
  joinedAt: number,     // Timestamp
}
```

## Academic Content (Scraped Schema)

### Courses (Refined)
Mapped from `data_courses_index.json` and course details.
```typescript
// courses table
{
  courseId: string,       // "ns_24t3_cs1001" (Unique ID from backend)
  code: string,           // "cs1001"
  term: string,           // "24t3"
  title: string,          // "Computational Thinking"
  forumUrl?: string,      // Link to Discourse
  credits?: number,       // To be enriched manually or via curriculum map
  level: "foundation" | "diploma" | "degree",
}
```

### Course Structure
Derived from `week_wise` array in scraped JSON.

```typescript
// weeks table
{
  courseId: Id<"courses">,
  title: string,          // "Week 1", "Week 2", "Course Introduction"
  order: number,          // 0, 1, 2... for sorting
}
```

```typescript
// videos table
{
  weekId: Id<"weeks">,
  courseId: Id<"courses">, // Denormalized for easier querying
  title: string,          // "L1.1: Introduction"
  youtubeId: string,      // "8ndsDXohLMQ"
  duration: number,       // Seconds
  slug: string,           // "l1-1-introduction" (for URLs)
  isPublic: boolean,      // from "availability"
  transcriptUrl?: string,
  order: number,
}
```

### Notes (User Uploaded)
```typescript
// notes table
{
  courseId: Id<"courses">,
  title: string,
  fileUrl: string,      // Convex Storage URL
  type: "pdf" | "link",
  tags: string[],
  uploadedBy: Id<"users">,
  downloads: number,
}
```


## Quiz System [COMING SOON]

### Quizzes
```typescript
// quizzes table
{
  title: string,
  subjectId: Id<"subjects">,
  description?: string,
  durationMinutes: number,
  totalQuestions: number,
  difficulty: "easy" | "medium" | "hard",
  isPublic: boolean,
  createdBy: Id<"users">, // Admin or approved creator
}
```

### Questions
```typescript
// questions table
{
  quizId: Id<"quizzes">,
  text: string,
  options: string[],    // ["Option A", "Option B"...]
  correctOption: number, // Index of correct option
  explanation?: string,
}
```

### Attempts
```typescript
// attempts table
{
  userId: Id<"users">,
  quizId: Id<"quizzes">,
  score: number,
  answers: number[],    // User selected indices
  completedAt: number,
}
```

## Community [COMING SOON]

### Posts
```typescript
// posts table
{
  authorId: Id<"users">,
  content: string,
  channelId: string,    // e.g., "general", "maths-help"
  likes: number,
  commentCount: number,
  createdAt: number,
}
```

### Comments
```typescript
// comments table
{
  postId: Id<"posts">,
  authorId: Id<"users">,
  content: string,
  parentId?: Id<"comments">, // For threaded replies
  createdAt: number,
}
```

## Calculator History
```typescript
// gpa_history table
{
  userId: Id<"users">,
  term: string,         // e.g., "Jan 2024"
  courses: {
    code: string,
    grade: string,      // "S", "A", "B"...
    credits: number
  }[],
  sgpa: number,
  createdAt: number,
}
```
