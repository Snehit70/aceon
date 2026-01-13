import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    role: v.union(v.literal("student"), v.literal("admin")),
    enrolledCourses: v.array(v.string()), // Course Codes
    joinedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  subjects: defineTable({
    code: v.string(),
    name: v.string(),
    semester: v.number(),
    credits: v.number(),
    description: v.optional(v.string()),
  }).index("by_code", ["code"]),

  notes: defineTable({
    subjectId: v.id("subjects"),
    title: v.string(),
    fileUrl: v.string(), // Convex Storage URL
    type: v.union(v.literal("pdf"), v.literal("link")),
    tags: v.array(v.string()),
    uploadedBy: v.id("users"),
    downloads: v.number(),
  }).index("by_subject", ["subjectId"]),

  gpa_history: defineTable({
    userId: v.id("users"),
    term: v.string(), // e.g., "Jan 2024"
    courses: v.array(
      v.object({
        code: v.string(),
        grade: v.string(), // "S", "A", "B"...
        credits: v.number(),
      })
    ),
    sgpa: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Quiz System [COMING SOON]
  quizzes: defineTable({
    title: v.string(),
    subjectId: v.id("subjects"),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    totalQuestions: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    isPublic: v.boolean(),
    createdBy: v.id("users"),
  }).index("by_subject", ["subjectId"]),

  questions: defineTable({
    quizId: v.id("quizzes"),
    text: v.string(),
    options: v.array(v.string()),
    correctOption: v.number(),
    explanation: v.optional(v.string()),
  }).index("by_quiz", ["quizId"]),

  attempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    answers: v.array(v.number()),
    completedAt: v.number(),
  }).index("by_user", ["userId"]),
});
