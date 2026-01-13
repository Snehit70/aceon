import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),      // Indexed for auth lookup
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("admin")),
    enrolledCourses: v.array(v.string()), // Array of Course IDs
    joinedAt: v.number(),     // Timestamp
  }).index("by_clerkId", ["clerkId"]),

  courses: defineTable({
    courseId: v.string(),       // "ns_24t3_cs1001" (Unique ID from backend)
    code: v.string(),           // "cs1001"
    term: v.string(),           // "24t3"
    title: v.string(),          // "Computational Thinking"
    forumUrl: v.optional(v.string()),      // Link to Discourse
    credits: v.optional(v.number()),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
  }).index("by_courseId", ["courseId"]),

  weeks: defineTable({
    courseId: v.id("courses"),
    title: v.string(),          // "Week 1", "Week 2", "Course Introduction"
    order: v.number(),          // 0, 1, 2... for sorting
  }).index("by_course", ["courseId"]),

  videos: defineTable({
    weekId: v.id("weeks"),
    courseId: v.id("courses"),  // Denormalized for easier querying
    title: v.string(),          // "L1.1: Introduction"
    youtubeId: v.string(),      // "8ndsDXohLMQ"
    duration: v.number(),       // Seconds
    slug: v.string(),           // "l1-1-introduction" (for URLs)
    isPublic: v.boolean(),      // from "availability"
    transcriptUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_week", ["weekId"]),

  notes: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    fileUrl: v.string(),      // Convex Storage URL
    type: v.union(v.literal("pdf"), v.literal("link")),
    tags: v.array(v.string()),
    uploadedBy: v.id("users"),
    downloads: v.number(),
  }).index("by_course", ["courseId"]),

  quizzes: defineTable({
    title: v.string(),
    courseId: v.id("courses"),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    totalQuestions: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    isPublic: v.boolean(),
    createdBy: v.id("users"), // Admin or approved creator
  }).index("by_course", ["courseId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    text: v.string(),
    options: v.array(v.string()),    // ["Option A", "Option B"...]
    correctOption: v.number(), // Index of correct option
    explanation: v.optional(v.string()),
  }).index("by_quiz", ["quizId"]),

  attempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    answers: v.array(v.number()),    // User selected indices
    completedAt: v.number(),
  }).index("by_user", ["userId"]),

  posts: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    channelId: v.string(),    // e.g., "general", "maths-help"
    likes: v.number(),
    commentCount: v.number(),
    createdAt: v.number(),
  }).index("by_channel", ["channelId"]),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")), // For threaded replies
    createdAt: v.number(),
  }).index("by_post", ["postId"]),

  gpa_history: defineTable({
    userId: v.id("users"),
    term: v.string(),         // e.g., "Jan 2024"
    courses: v.array(
      v.object({
        code: v.string(),
        grade: v.string(),      // "S", "A", "B"...
        credits: v.number()
      })
    ),
    sgpa: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
