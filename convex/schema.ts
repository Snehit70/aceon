import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // USER & AUTH
  // ============================================
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    joinedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  // ============================================
  // COURSE CONTENT (Lectures)
  // ============================================
  courses: defineTable({
    courseId: v.string(),       // "ns_24t3_cs1001" (Unique ID from backend)
    code: v.string(),           // "cs1001"
    term: v.string(),           // "24t3"
    title: v.string(),          // "Computational Thinking"
    forumUrl: v.optional(v.string()),
    credits: v.optional(v.number()),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
  }).index("by_courseId", ["courseId"]),

  weeks: defineTable({
    courseId: v.id("courses"),
    title: v.string(),          // "Week 1", "Week 2", "Course Introduction"
    order: v.number(),
  }).index("by_course", ["courseId"]),

  videos: defineTable({
    weekId: v.id("weeks"),
    courseId: v.id("courses"),  // Denormalized for easier querying
    title: v.string(),          // "L1.1: Introduction"
    youtubeId: v.string(),      // "8ndsDXohLMQ"
    duration: v.number(),       // Seconds
    slug: v.string(),           // "l1-1-introduction" (for URLs)
    isPublic: v.boolean(),
    transcriptUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_week", ["weekId"])
    .index("by_youtubeId", ["youtubeId"]),

  // ============================================
  // USER PROGRESS & ENGAGEMENT
  // ============================================
  videoProgress: defineTable({
    clerkId: v.string(),        // User identifier (from Clerk)
    videoId: v.id("videos"),
    courseId: v.id("courses"),  // Denormalized for course-level queries
    progress: v.number(),       // 0-1 (percentage watched)
    watchedSeconds: v.number(), // Actual seconds watched
    completed: v.boolean(),     // True if watched >= 90%
    lastPosition: v.number(),   // Resume position in seconds
    lastWatchedAt: v.number(),  // Timestamp
  })
    .index("by_user", ["clerkId"])
    .index("by_user_video", ["clerkId", "videoId"])
    .index("by_user_course", ["clerkId", "courseId"])
    .index("by_user_recent", ["clerkId", "lastWatchedAt"]),

  bookmarks: defineTable({
    clerkId: v.string(),
    videoId: v.id("videos"),
    timestamp: v.number(),      // Position in video (seconds)
    label: v.optional(v.string()), // Optional user label
    createdAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_video", ["clerkId", "videoId"]),

  videoNotes: defineTable({
    clerkId: v.string(),
    videoId: v.id("videos"),
    timestamp: v.number(),      // Position in video (seconds)
    content: v.string(),        // Note text (markdown supported)
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_video", ["clerkId", "videoId"]),

  userPreferences: defineTable({
    clerkId: v.string(),
    playbackSpeed: v.number(),  // 0.5 - 2.0
    autoplay: v.boolean(),
    theaterMode: v.boolean(),
    volume: v.number(),         // 0-1
  }).index("by_user", ["clerkId"]),

  // ============================================
  // STUDENT PROFILE
  // ============================================
  studentProfile: defineTable({
    clerkId: v.string(),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
    currentTerm: v.optional(v.string()), // e.g., "Jan 2024"
    enrolledCourseIds: v.array(v.id("courses")),
  }).index("by_user", ["clerkId"]),
});
