import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Lists all available courses.
 *
 * @returns A list of all course documents.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

/**
 * Lists all courses with aggregated statistics.
 * Calculates total lecture count and duration for each course.
 *
 * @returns A list of courses with an added `stats` object containing `lectureCount`, `totalDurationSeconds`, and `totalDurationFormatted`.
 */
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
        const totalSeconds = videos.reduce((sum, video) => sum + (video.duration || 0), 0);

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

/**
 * Retrieves a single course by its ID.
 *
 * @param args.id - The ID of the course to retrieve.
 * @returns The course document, or null if not found.
 */
export const get = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Retrieves a course by its course code.
 *
 * @param args.code - The unique code of the course (e.g., "CS101").
 * @returns The course document, or null if not found.
 */
export const getCourseByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("courses")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();
  },
});

/**
 * Retrieves all weeks associated with a specific course.
 *
 * @param args.courseId - The ID of the course.
 * @returns A list of week documents sorted by their order.
 */
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

/**
 * Retrieves all videos associated with a specific week.
 *
 * @param args.weekId - The ID of the week.
 * @returns A list of video documents sorted by their order.
 */
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

/**
 * Retrieves the full content structure of a course.
 * Includes all weeks and their associated videos.
 *
 * @param args.courseId - The ID of the course.
 * @returns A list of weeks, each containing a `videos` array.
 */
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

/**
 * Searches for lectures by title across all videos.
 *
 * @param args.searchQuery - The text to search for in video titles.
 * @param args.limit - Optional limit on the number of results (default: 20).
 * @returns A list of matching video documents with their associated course and week populated.
 */
export const searchLectures = query({
  args: {
    searchQuery: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const query = args.searchQuery.trim();

    if (!query) return [];

    const matchingVideos = await ctx.db
      .query("videos")
      .withSearchIndex("search_title", (q) => q.search("title", query))
      .take(limit);

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

/**
 * Calculates aggregate statistics for a specific course.
 *
 * @param args.courseId - The ID of the course.
 * @returns An object containing `lectureCount`, `totalDurationSeconds`, and `totalDurationFormatted`.
 */
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

