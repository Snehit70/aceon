import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Input validation schema matching the scraped data structure
const videoSchema = v.object({
  title: v.string(),
  youtubeId: v.string(),
  duration: v.number(),
  slug: v.string(),
  isPublic: v.boolean(),
  order: v.number(),
});

const weekSchema = v.object({
  title: v.string(),
  order: v.number(),
  videos: v.array(videoSchema),
});

const courseSchema = v.object({
  courseId: v.string(), // "ns_24t3_cs1001"
  code: v.string(),
  term: v.string(),
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

    // 1. Sync Course
    let courseId = null;
    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", course.courseId))
      .first();

    if (existingCourse) {
      courseId = existingCourse._id;
      await ctx.db.patch(courseId, {
        code: course.code,
        term: course.term,
        title: course.title,
        level: course.level,
      });
    } else {
      courseId = await ctx.db.insert("courses", {
        courseId: course.courseId,
        code: course.code,
        term: course.term,
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
            isPublic: video.isPublic,
            order: video.order,
            courseId: courseId!, // Ensure denormalized field is correct
          });
        } else {
          await ctx.db.insert("videos", {
            weekId: weekId!,
            courseId: courseId!,
            title: video.title,
            youtubeId: video.youtubeId,
            duration: video.duration,
            slug: video.slug,
            isPublic: video.isPublic,
            order: video.order,
          });
        }
      }
    }

    return { success: true, courseId: course.courseId };
  },
});

const questionSchema = v.object({
  text: v.string(),
  options: v.array(v.string()),
  correctOption: v.number(),
  explanation: v.optional(v.string()),
});

const quizSchema = v.object({
  courseId: v.string(), // "ns_24t3_cs1001" (external ID)
  title: v.string(),
  description: v.optional(v.string()),
  durationMinutes: v.number(),
  difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
  questions: v.array(questionSchema),
});

export const seedQuiz = mutation({
  args: {
    quiz: quizSchema,
  },
  handler: async (ctx, args) => {
    const { quiz } = args;

    // 1. Find the course by its external ID
    const course = await ctx.db
      .query("courses")
      .withIndex("by_courseId", (q) => q.eq("courseId", quiz.courseId))
      .first();

    if (!course) {
      throw new Error(`Course not found: ${quiz.courseId}`);
    }

    // 2. Find admin user (or create a dummy one if needed for "createdBy")
    // For seeding, we'll look for any admin, or just the first user, or create a system user
    // Ideally, we should have a seeded admin. Let's see if we can find one.
    let user = await ctx.db.query("users").first();
    if (!user) {
        // Create a dummy system user if none exists
        // This is a bit hacky but needed if we seed on a fresh DB without users
        const id = await ctx.db.insert("users", {
            clerkId: "system_seeder",
            email: "admin@aceon.ai",
            name: "System Admin",
            role: "admin",
            enrolledCourses: [],
            joinedAt: Date.now()
        });
        user = (await ctx.db.get(id))!;
    }

    // 3. Create or Update Quiz
    // Check if quiz exists by title + course
    const existingQuizzes = await ctx.db
        .query("quizzes")
        .withIndex("by_course", (q) => q.eq("courseId", course._id))
        .collect();

    const existingQuiz = existingQuizzes.find(q => q.title === quiz.title);
    let quizId: Id<"quizzes">;

    if (existingQuiz) {
        quizId = existingQuiz._id;
        await ctx.db.patch(quizId, {
            description: quiz.description,
            durationMinutes: quiz.durationMinutes,
            difficulty: quiz.difficulty,
            totalQuestions: quiz.questions.length,
            isPublic: true,
        });

        // Delete existing questions to replace them (simplest sync strategy)
        const existingQuestions = await ctx.db
            .query("questions")
            .withIndex("by_quiz", (q) => q.eq("quizId", quizId))
            .collect();

        for (const q of existingQuestions) {
            await ctx.db.delete(q._id);
        }
    } else {
        quizId = await ctx.db.insert("quizzes", {
            courseId: course._id,
            title: quiz.title,
            description: quiz.description,
            durationMinutes: quiz.durationMinutes,
            difficulty: quiz.difficulty,
            totalQuestions: quiz.questions.length,
            isPublic: true,
            createdBy: user._id,
        });
    }

    // 4. Insert Questions
    for (const q of quiz.questions) {
        await ctx.db.insert("questions", {
            quizId,
            text: q.text,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
        });
    }

    return { success: true, quizId };
  }
});
