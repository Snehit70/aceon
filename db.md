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

## Academic Content

### Subjects
```typescript
// subjects table
{
  code: string,         // e.g., "MA1001"
  name: string,         // e.g., "Mathematics 1"
  semester: number,     // 1-8
  credits: number,
  description?: string,
}
```

### Notes
```typescript
// notes table
{
  subjectId: Id<"subjects">,
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
