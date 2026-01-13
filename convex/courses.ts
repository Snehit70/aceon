import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
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
      .withIndex("by_courseId", (q) => q.eq("courseId", args.code))
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
