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
 * **Performance**: Fetches all videos once and aggregates in-memory
 * instead of N+1 queries per course.
 *
 * @returns A list of courses with an added `stats` object containing `lectureCount`, `totalDurationSeconds`, and `totalDurationFormatted`.
 */
export const listWithStats = query({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    const coursesMissingPrecomputedStats = courses.filter(
      (course) =>
        course.lectureCount === undefined ||
        course.totalDurationSeconds === undefined,
    );

    const statsByCourse = new Map<string, { count: number; seconds: number }>();
    if (coursesMissingPrecomputedStats.length > 0) {
      console.warn(
        `[courses.listWithStats] fallback aggregation for ${coursesMissingPrecomputedStats.length}/${courses.length} courses`,
      );
      const allVideos = await ctx.db.query("videos").collect();
      for (const video of allVideos) {
        const stats = statsByCourse.get(video.courseId) || { count: 0, seconds: 0 };
        stats.count++;
        stats.seconds += video.duration || 0;
        statsByCourse.set(video.courseId, stats);
      }
    }

    return courses.map((course) => {
      const stats =
        course.lectureCount !== undefined &&
        course.totalDurationSeconds !== undefined
          ? {
              count: course.lectureCount,
              seconds: course.totalDurationSeconds,
            }
          : statsByCourse.get(course._id) || { count: 0, seconds: 0 };
      const hours = Math.floor(stats.seconds / 3600);
      const minutes = Math.floor((stats.seconds % 3600) / 60);
      const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return {
        ...course,
        stats: {
          lectureCount: stats.count,
          totalDurationSeconds: stats.seconds,
          totalDurationFormatted: formatted,
        },
      };
    });
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

export const videoExistsByYoutubeId = query({
  args: { youtubeId: v.string() },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .withIndex("by_youtubeId", (q) => q.eq("youtubeId", args.youtubeId))
      .first();
    return Boolean(video);
  },
});

/**
 * Retrieves the full content structure of a course.
 * Includes all weeks and their associated videos.
 *
 * **Performance**: Fetches weeks and videos in parallel, then groups
 * videos by weekId in-memory instead of N+1 queries per week.
 *
 * @param args.courseId - The ID of the course.
 * @returns A list of weeks, each containing a `videos` array.
 */
export const getCourseContent = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const [weeks, allVideos] = await Promise.all([
      ctx.db
        .query("weeks")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect(),
      ctx.db
        .query("videos")
        .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
        .collect(),
    ]);

    weeks.sort((a, b) => a.order - b.order);

    const videosByWeek = new Map<string, typeof allVideos>();
    for (const video of allVideos) {
      const weekVideos = videosByWeek.get(video.weekId) || [];
      weekVideos.push(video);
      videosByWeek.set(video.weekId, weekVideos);
    }

    return weeks.map((week) => ({
      ...week,
      videos: (videosByWeek.get(week._id) || []).sort((a, b) => a.order - b.order),
    }));
  },
});

/**
 * Searches for lectures by title across all videos.
 *
 * **Performance**: Batch fetches unique courses and weeks instead of
 * N+1 queries per video result.
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
    const searchTerm = args.searchQuery.trim();

    if (!searchTerm) return [];

    const matchingVideos = await ctx.db
      .query("videos")
      .withSearchIndex("search_title", (q) => q.search("title", searchTerm))
      .take(limit);

    if (matchingVideos.length === 0) return [];

    const courseIds = [...new Set(matchingVideos.map((v) => v.courseId))];
    const weekIds = [...new Set(matchingVideos.map((v) => v.weekId))];

    const [courses, weeks] = await Promise.all([
      Promise.all(courseIds.map((id) => ctx.db.get(id))),
      Promise.all(weekIds.map((id) => ctx.db.get(id))),
    ]);

    const courseMap = new Map(courses.filter(Boolean).map((c) => [c!._id, c]));
    const weekMap = new Map(weeks.filter(Boolean).map((w) => [w!._id, w]));

    return matchingVideos
      .map((video) => ({
        ...video,
        course: courseMap.get(video.courseId),
        week: weekMap.get(video.weekId),
      }))
      .filter((r) => r.course && r.week);
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
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    if (
      course.lectureCount !== undefined &&
      course.totalDurationSeconds !== undefined
    ) {
      const precomputedSeconds = course.totalDurationSeconds;
      const hours = Math.floor(precomputedSeconds / 3600);
      const minutes = Math.floor((precomputedSeconds % 3600) / 60);
      const formatted = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return {
        lectureCount: course.lectureCount,
        totalDurationSeconds: precomputedSeconds,
        totalDurationFormatted: formatted,
      };
    }

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
