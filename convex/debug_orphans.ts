
import { query } from "./_generated/server";
import { v } from "convex/values";

export const findOrphanedVideos = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // 1. Get all known weeks
    const weeks = await ctx.db
      .query("weeks")
      .withIndex("by_course", q => q.eq("courseId", args.courseId))
      .collect();
    
    const knownWeekIds = new Set(weeks.map(w => w._id));

    // 2. Get all videos for the course
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_course", q => q.eq("courseId", args.courseId))
      .collect();

    // 3. Find videos with unknown week IDs
    const orphaned = videos.filter(v => !knownWeekIds.has(v.weekId));
    
    // 4. Group orphans by their weekId to see what's missing
    const missingWeeksMap = new Map();
    orphaned.forEach(v => {
      const count = missingWeeksMap.get(v.weekId) || 0;
      missingWeeksMap.set(v.weekId, count + 1);
    });

    return {
      knownWeeks: weeks.length,
      totalVideos: videos.length,
      orphanedVideos: orphaned.length,
      missingWeekIds: Array.from(missingWeeksMap.entries()).map(([id, count]) => ({ id, count }))
    };
  }
});
