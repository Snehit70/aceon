import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

function aggregateCourseStats(
  videos: Array<{
    duration?: number;
  }>,
) {
  const lectureCount = videos.length;
  const totalDurationSeconds = videos.reduce(
    (sum, video) => sum + (video.duration || 0),
    0,
  );
  return { lectureCount, totalDurationSeconds };
}

/**
 * Recompute and persist stats for all courses.
 *
 * Safe backfill utility: does not alter course identity fields, only updates
 * denormalized stats (`lectureCount`, `totalDurationSeconds`).
 */
export const recomputeAllCourseStats = internalMutation({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    const updated: Array<{
      courseId: string;
      code: string;
      lectureCount: number;
      totalDurationSeconds: number;
    }> = [];

    for (const course of courses) {
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect();

      const stats = aggregateCourseStats(videos);
      await ctx.db.patch(course._id, stats);

      updated.push({
        courseId: course._id,
        code: course.code,
        lectureCount: stats.lectureCount,
        totalDurationSeconds: stats.totalDurationSeconds,
      });
    }

    return {
      processedCourses: courses.length,
      updated,
    };
  },
});

/**
 * Recompute and persist stats for one course by code.
 *
 * Useful for targeted validation after import/sync operations.
 */
export const recomputeCourseStatsByCode = internalMutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!course) {
      throw new Error(`Course not found for code: ${args.code}`);
    }

    const videos = await ctx.db
      .query("videos")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .collect();

    const stats = aggregateCourseStats(videos);
    await ctx.db.patch(course._id, stats);

    return {
      courseId: course._id,
      code: course.code,
      ...stats,
    };
  },
});
