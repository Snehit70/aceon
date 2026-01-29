import { query, internalQuery } from "./_generated/server";

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

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getAllCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getAllWeeks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("weeks").collect();
  },
});

export const getAllVideos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("videos").collect();
  },
});

export const getAllVideoProgress = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("videoProgress").collect();
  },
});

export const getAllVideoNotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("videoNotes").collect();
  },
});