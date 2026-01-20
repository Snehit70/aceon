import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const updateProgress = mutation({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
    courseId: v.id("courses"),
    progress: v.number(),
    watchedSeconds: v.number(),
    lastPosition: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("videoProgress")
      .withIndex("by_user_video", (q) =>
        q.eq("clerkId", args.clerkId).eq("videoId", args.videoId)
      )
      .first();

    const completed = args.progress >= 0.9;
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        progress: Math.max(existing.progress, args.progress),
        watchedSeconds: args.watchedSeconds,
        completed: existing.completed || completed,
        lastPosition: args.lastPosition,
        lastWatchedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("videoProgress", {
      clerkId: args.clerkId,
      videoId: args.videoId,
      courseId: args.courseId,
      progress: args.progress,
      watchedSeconds: args.watchedSeconds,
      completed,
      lastPosition: args.lastPosition,
      lastWatchedAt: now,
    });
  },
});

export const getProgress = query({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoProgress")
      .withIndex("by_user_video", (q) =>
        q.eq("clerkId", args.clerkId).eq("videoId", args.videoId)
      )
      .first();
  },
});

export const getCourseProgress = query({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videoProgress")
      .withIndex("by_user_course", (q) =>
        q.eq("clerkId", args.clerkId).eq("courseId", args.courseId)
      )
      .collect();
  },
});

export const markComplete = mutation({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("videoProgress")
      .withIndex("by_user_video", (q) =>
        q.eq("clerkId", args.clerkId).eq("videoId", args.videoId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        completed: true,
        progress: 1,
        lastWatchedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("videoProgress", {
      clerkId: args.clerkId,
      videoId: args.videoId,
      courseId: args.courseId,
      progress: 1,
      watchedSeconds: 0,
      completed: true,
      lastPosition: 0,
      lastWatchedAt: now,
    });
  },
});

export const getRecentlyWatched = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const progressRecords = await ctx.db
      .query("videoProgress")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(limit * 2);

    const sorted = progressRecords.sort(
      (a, b) => b.lastWatchedAt - a.lastWatchedAt
    );
    const recent = sorted.slice(0, limit);

    const results = await Promise.all(
      recent.map(async (record) => {
        const video = await ctx.db.get(record.videoId);
        const course = await ctx.db.get(record.courseId);
        return {
          ...record,
          video,
          course,
        };
      })
    );

    return results.filter((r) => r.video && r.course);
  },
});

export const getContinueWatching = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 5;
    const progressRecords = await ctx.db
      .query("videoProgress")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const incomplete = progressRecords
      .filter((r) => !r.completed && r.progress > 0.05)
      .sort((a, b) => b.lastWatchedAt - a.lastWatchedAt)
      .slice(0, limit);

    const results = await Promise.all(
      incomplete.map(async (record) => {
        const video = await ctx.db.get(record.videoId);
        const course = await ctx.db.get(record.courseId);
        return {
          ...record,
          video,
          course,
        };
      })
    );

    return results.filter((r) => r.video && r.course);
  },
});
