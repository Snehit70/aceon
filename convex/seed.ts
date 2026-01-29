import { mutation } from "./_generated/server";
import { v } from "convex/values";

const videoSchema = v.object({
  title: v.string(),
  youtubeId: v.string(),
  duration: v.number(),
  slug: v.string(),
  order: v.number(),
});

const weekSchema = v.object({
  title: v.string(),
  order: v.number(),
  videos: v.array(videoSchema),
});

const courseSchema = v.object({
  code: v.string(),
  title: v.string(),
  level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
  weeks: v.array(weekSchema),
});

export const syncCourseData = mutation({
  args: {
    course: courseSchema,
  },
  handler: async (ctx, args) => {
    const { course } = args;

    let courseId = null;
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_code", (q) => q.eq("code", course.code))
      .first();

    if (existingCourse) {
      courseId = existingCourse._id;
      await ctx.db.patch(courseId, {
        title: course.title,
        level: course.level,
      });
    } else {
      courseId = await ctx.db.insert("courses", {
        code: course.code,
        title: course.title,
        level: course.level,
      });
    }

    // 2. Sync Weeks and Videos
    for (const week of course.weeks) {
      // Check if week exists for this course
      let weekId = null;
      // We don't have a unique ID for weeks from source, so we match by title + courseId
      // A better approach would be adding an index on courseId + order or title
      // For now, we'll just check all weeks for this course (usually small number ~12)
      const existingWeeks = await ctx.db
        .query("weeks")
        .withIndex("by_course", (q) => q.eq("courseId", courseId!))
        .collect();

      const existingWeek = existingWeeks.find(w => w.title === week.title);

      if (existingWeek) {
        weekId = existingWeek._id;
        await ctx.db.patch(weekId, {
          order: week.order,
        });
      } else {
        weekId = await ctx.db.insert("weeks", {
          courseId: courseId!,
          title: week.title,
          order: week.order,
        });
      }

      // 3. Sync Videos
      for (const video of week.videos) {
        // Check by youtubeId (globally unique usually) or slug
        // We'll use weeks' children query if possible, but simplest is explicit check
        // Ideally we'd have a unique index on youtubeId?
        // Schema says: .index("by_week", ["weekId"])

        // Let's find if this video exists in this week
        const existingVideosInWeek = await ctx.db
          .query("videos")
          .withIndex("by_week", (q) => q.eq("weekId", weekId!))
          .collect();

        const existingVideo = existingVideosInWeek.find(v => v.youtubeId === video.youtubeId);

        if (existingVideo) {
          await ctx.db.patch(existingVideo._id, {
            title: video.title,
            duration: video.duration,
            slug: video.slug,
            order: video.order,
            courseId: courseId!,
          });
        } else {
          await ctx.db.insert("videos", {
            weekId: weekId!,
            courseId: courseId!,
            title: video.title,
            youtubeId: video.youtubeId,
            duration: video.duration,
            slug: video.slug,
            order: video.order,
          });
        }
      }
    }

    return { success: true, code: course.code };
  },
});
