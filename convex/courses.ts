import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();

    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .collect();

        const totalVideos = videos.length;
        const totalSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

        return {
          ...course,
          stats: {
            lectureCount: totalVideos,
            totalDurationSeconds: totalSeconds,
            totalDurationFormatted: formatted,
          },
        };
      })
    );

    return coursesWithStats;
  },
});

export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCourseByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

export const getWeeks = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const weeks = await ctx.db
      .query("weeks")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    return weeks.sort((a, b) => a.order - b.order);
  },
});

export const getVideos = query({
  args: { weekId: v.id("weeks") },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_week", (q) => q.eq("weekId", args.weekId))
      .collect();

    return videos.sort((a, b) => a.order - b.order);
  },
});

export const getCourseContent = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const weeks = await ctx.db
      .query("weeks")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    weeks.sort((a, b) => a.order - b.order);

    const weeksWithVideos = await Promise.all(
      weeks.map(async (week) => {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_week", (q) => q.eq("weekId", week._id))
          .collect();

        videos.sort((a, b) => a.order - b.order);

        return {
          ...week,
          videos,
        };
      })
    );

    return weeksWithVideos;
  },
});

export const searchLectures = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const query = args.searchQuery.toLowerCase().trim();

    if (!query) return [];

    const allVideos = await ctx.db.query("videos").collect();

    const matchingVideos = allVideos
      .filter((video) => video.title.toLowerCase().includes(query))
      .slice(0, limit);

    const results = await Promise.all(
      matchingVideos.map(async (video) => {
        const course = await ctx.db.get(video.courseId);
        const week = await ctx.db.get(video.weekId);
        return {
          ...video,
          course,
          week,
        };
      })
    );

    return results.filter((r) => r.course && r.week);
  },
});

export const getCourseStats = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const totalVideos = videos.length;
    const totalSeconds = videos.reduce((sum, v) => sum + (v.duration || 0), 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return {
      lectureCount: totalVideos,
      totalDurationSeconds: totalSeconds,
      totalDurationFormatted: formatted,
    };
  },
});
