
import { internalQuery } from "./_generated/server";

export const verifyContent = internalQuery({
  args: {},
  handler: async (ctx) => {
    const courses = await ctx.db.query("courses").collect();
    
    const results = [];
    
    for (const course of courses) {
      const weeks = await ctx.db
        .query("weeks")
        .withIndex("by_course", q => q.eq("courseId", course._id))
        .collect();
        
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_course", q => q.eq("courseId", course._id))
        .collect();
        
      // Get week numbers/titles to see range
      const weekTitles = weeks.map(w => w.title).sort();
      
      results.push({
        code: course.code,
        title: course.title,
        weekCount: weeks.length,
        videoCount: videos.length,
        weeks: weekTitles
      });
    }
    
    return results.sort((a, b) => a.code.localeCompare(b.code));
  }
});
