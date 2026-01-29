import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    joinedAt: v.number(),
    level: v.optional(v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree"))),
    enrolledCourseIds: v.optional(v.array(v.id("courses"))),
  }).index("by_clerkId", ["clerkId"]),

  courses: defineTable({
    code: v.string(),
    title: v.string(),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
  }).index("by_code", ["code"]),

  weeks: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  }).index("by_course", ["courseId"]),

  videos: defineTable({
    weekId: v.id("weeks"),
    courseId: v.id("courses"),
    title: v.string(),
    youtubeId: v.string(),
    duration: v.number(),
    slug: v.string(),
    transcriptUrl: v.optional(v.string()),
    order: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_week", ["weekId"])
    .index("by_youtubeId", ["youtubeId"]),

  videoProgress: defineTable({
    clerkId: v.string(),
    videoId: v.id("videos"),
    courseId: v.id("courses"),
    progress: v.number(),
    watchedSeconds: v.number(),
    completed: v.boolean(),
    lastPosition: v.number(),
    lastWatchedAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_video", ["clerkId", "videoId"])
    .index("by_user_course", ["clerkId", "courseId"])
    .index("by_user_recent", ["clerkId", "lastWatchedAt"]),

  videoNotes: defineTable({
    clerkId: v.string(),
    videoId: v.id("videos"),
    timestamp: v.number(),
    content: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["clerkId"])
    .index("by_user_video", ["clerkId", "videoId"]),
});

