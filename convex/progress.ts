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

export const markWeekComplete = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
    weekId: v.id("weeks"),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_week", (q) => q.eq("weekId", args.weekId))
      .collect();

    const now = Date.now();

    for (const video of videos) {
      const existing = await ctx.db
        .query("videoProgress")
        .withIndex("by_user_video", (q) =>
          q.eq("clerkId", args.clerkId).eq("videoId", video._id)
        )
        .first();

      if (existing) {
        if (!existing.completed) {
          await ctx.db.patch(existing._id, {
            completed: true,
            progress: 1,
            lastWatchedAt: now,
          });
        }
      } else {
        await ctx.db.insert("videoProgress", {
          clerkId: args.clerkId,
          videoId: video._id,
          courseId: args.courseId,
          progress: 1,
          watchedSeconds: 0,
          completed: true,
          lastPosition: 0,
          lastWatchedAt: now,
        });
      }
    }

    return { markedCount: videos.length };
  },
});

export const markCourseComplete = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const now = Date.now();

    for (const video of videos) {
      const existing = await ctx.db
        .query("videoProgress")
        .withIndex("by_user_video", (q) =>
          q.eq("clerkId", args.clerkId).eq("videoId", video._id)
        )
        .first();

      if (existing) {
        if (!existing.completed) {
          await ctx.db.patch(existing._id, {
            completed: true,
            progress: 1,
            lastWatchedAt: now,
          });
        }
      } else {
        await ctx.db.insert("videoProgress", {
          clerkId: args.clerkId,
          videoId: video._id,
          courseId: args.courseId,
          progress: 1,
          watchedSeconds: 0,
          completed: true,
          lastPosition: 0,
          lastWatchedAt: now,
        });
      }
    }

    return { markedCount: videos.length };
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

export const getAllCoursesProgress = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const allProgress = await ctx.db
      .query("videoProgress")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .collect();

    const progressByCourseTmp: Record<string, { completed: number; total: number }> = {};

    for (const record of allProgress) {
      const courseId = record.courseId;
      if (!progressByCourseTmp[courseId]) {
        progressByCourseTmp[courseId] = { completed: 0, total: 0 };
      }
      progressByCourseTmp[courseId].total++;
      if (record.completed) {
        progressByCourseTmp[courseId].completed++;
      }
    }

    const courses = await ctx.db.query("courses").collect();
    const result: Record<string, number> = {};

    for (const course of courses) {
      const allVideos = await ctx.db
        .query("videos")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect();

      const totalVideos = allVideos.length;
      const completedVideos = progressByCourseTmp[course._id]?.completed || 0;

      result[course._id] = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    }

    return result;
  },
});
