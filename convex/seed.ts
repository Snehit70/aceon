import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

export const clearAll = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["videoNotes", "videoProgress", "videos", "weeks", "courses", "users"] as const;
    const results: Record<string, number> = {};
    
    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      results[table] = docs.length;
    }
    
    return results;
  },
});

const videoSchema = v.object({
  title: v.string(),
  youtubeId: v.string(),
  duration: v.number(),
  transcriptUrl: v.optional(v.string()),
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

type ImportVideo = {
  title: string;
  youtubeId: string;
  duration: number;
  transcriptUrl?: string;
  slug: string;
  order: number;
};

type ImportWeek = {
  title: string;
  order: number;
  videos: ImportVideo[];
};

type ImportCourse = {
  code: string;
  title: string;
  level: "foundation" | "diploma" | "degree";
  weeks: ImportWeek[];
};

type VideoDoc = {
  _id: any;
  youtubeId: string;
  slug: string;
  title: string;
  duration: number;
  transcriptUrl?: string;
  order: number;
  weekId: any;
  courseId: any;
};

const requireSeedAuth = async (
  _ctx: { auth: { getUserIdentity: () => Promise<unknown> } },
  importToken?: string,
) => {
  const expectedToken = process.env.CONVEX_SEED_IMPORT_TOKEN;
  if (!expectedToken || importToken !== expectedToken) {
    throw new Error("Unauthorized");
  }
};

const videoIdentityKey = (video: { youtubeId: string; order: number }) =>
  `${video.youtubeId}::${video.order}`;

const deleteProgressAndNotesForVideo = async (ctx: any, videoId: any) => {
  const notesRows = (await ctx.db.query("videoNotes").collect()).filter(
    (row: any) => row.videoId === videoId,
  );
  for (const row of notesRows) {
    await ctx.db.delete(row._id);
  }

  const progressRows = (await ctx.db.query("videoProgress").collect()).filter(
    (row: any) => row.videoId === videoId,
  );
  for (const row of progressRows) {
    await ctx.db.delete(row._id);
  }
};

const upsertCourseData = async (ctx: any, course: ImportCourse) => {
  let courseId = null;
  const existingCourse = await ctx.db
    .query("courses")
    .withIndex("by_code", (q: any) => q.eq("code", course.code))
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
      .withIndex("by_course", (q: any) => q.eq("courseId", courseId!))
      .collect();

    const existingWeek = existingWeeks.find((w: any) => w.title === week.title);

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
        .withIndex("by_week", (q: any) => q.eq("weekId", weekId!))
        .collect();

      const existingVideo = existingVideosInWeek.find((v: any) => v.youtubeId === video.youtubeId);

      if (existingVideo) {
        await ctx.db.patch(existingVideo._id, {
          title: video.title,
          duration: video.duration,
          transcriptUrl: video.transcriptUrl,
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
          transcriptUrl: video.transcriptUrl,
          slug: video.slug,
          order: video.order,
        });
      }
    }
  }

  const courseVideos = await ctx.db
    .query("videos")
    .withIndex("by_course", (q: any) => q.eq("courseId", courseId!))
    .collect();
  const lectureCount = courseVideos.length;
  const totalDurationSeconds = courseVideos.reduce(
    (sum: number, video: any) => sum + (video.duration || 0),
    0,
  );

  await ctx.db.patch(courseId!, {
    lectureCount,
    totalDurationSeconds,
  });

  return { success: true, code: course.code };
};

export const syncCourseData = mutation({
  args: {
    course: courseSchema,
    importToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSeedAuth(ctx, args.importToken);
    return upsertCourseData(ctx, args.course);
  },
});

export const replaceCourseData = mutation({
  args: {
    course: courseSchema,
    importToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSeedAuth(ctx, args.importToken);

    const existingCourse = await ctx.db
      .query("courses")
      .withIndex("by_code", (q: any) => q.eq("code", args.course.code))
      .first();

    const oldVideosByKey = new Map<string, VideoDoc[]>();
    const oldVideoIdsToDelete = new Set<any>();

    if (existingCourse) {
      const weeks = await ctx.db
        .query("weeks")
        .withIndex("by_course", (q: any) => q.eq("courseId", existingCourse._id))
        .collect();
      for (const week of weeks) {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_week", (q: any) => q.eq("weekId", week._id))
          .collect();
        for (const video of videos) {
          const key = videoIdentityKey(video);
          const list = oldVideosByKey.get(key) ?? [];
          list.push(video as VideoDoc);
          oldVideosByKey.set(key, list);
          oldVideoIdsToDelete.add(video._id);
        }
      }
    }

    const courseId = existingCourse
      ? existingCourse._id
      : await ctx.db.insert("courses", {
          code: args.course.code,
          title: args.course.title,
          level: args.course.level,
        });

    if (existingCourse) {
      await ctx.db.patch(courseId, {
        title: args.course.title,
        level: args.course.level,
      });
    }

    let lectureCount = 0;
    let totalDurationSeconds = 0;

    for (const week of args.course.weeks) {
      const weekId = await ctx.db.insert("weeks", {
        courseId,
        title: week.title,
        order: week.order,
      });

      for (const video of week.videos) {
        const key = videoIdentityKey(video);
        const candidates = oldVideosByKey.get(key) ?? [];
        const reusableVideo = candidates.shift();

        if (reusableVideo) {
          await ctx.db.patch(reusableVideo._id, {
            weekId,
            courseId,
            title: video.title,
            youtubeId: video.youtubeId,
            duration: video.duration,
            transcriptUrl: video.transcriptUrl,
            slug: video.slug,
            order: video.order,
          });
          oldVideoIdsToDelete.delete(reusableVideo._id);
        } else {
          await ctx.db.insert("videos", {
            weekId,
            courseId,
            title: video.title,
            youtubeId: video.youtubeId,
            duration: video.duration,
            transcriptUrl: video.transcriptUrl,
            slug: video.slug,
            order: video.order,
          });
        }
        lectureCount += 1;
        totalDurationSeconds += video.duration || 0;
      }
    }

    if (existingCourse) {
      for (const oldVideoId of oldVideoIdsToDelete) {
        await deleteProgressAndNotesForVideo(ctx, oldVideoId);
        await ctx.db.delete(oldVideoId);
      }

      const staleWeeks = await ctx.db
        .query("weeks")
        .withIndex("by_course", (q: any) => q.eq("courseId", existingCourse._id))
        .collect();
      for (const staleWeek of staleWeeks) {
        const hasVideos = await ctx.db
          .query("videos")
          .withIndex("by_week", (q: any) => q.eq("weekId", staleWeek._id))
          .first();
        if (!hasVideos) {
          await ctx.db.delete(staleWeek._id);
        }
      }
    }

    await ctx.db.patch(courseId, {
      lectureCount,
      totalDurationSeconds,
    });

    return { success: true, code: args.course.code };
  },
});

export const dedupeCourseById = mutation({
  args: {
    keepCourseId: v.id("courses"),
    removeCourseId: v.id("courses"),
    newTitle: v.optional(v.string()),
    importToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSeedAuth(ctx, args.importToken);

    if (args.keepCourseId === args.removeCourseId) {
      throw new Error("keepCourseId and removeCourseId must be different");
    }

    const keepCourse = await ctx.db.get(args.keepCourseId);
    const removeCourse = await ctx.db.get(args.removeCourseId);
    if (!keepCourse) throw new Error("keepCourseId not found");
    if (!removeCourse) throw new Error("removeCourseId not found");

    const keepWeeks = await ctx.db
      .query("weeks")
      .withIndex("by_course", (q: any) => q.eq("courseId", args.keepCourseId))
      .collect();
    const keepVideos = (
      await Promise.all(
        keepWeeks.map((week: any) =>
          ctx.db.query("videos").withIndex("by_week", (q: any) => q.eq("weekId", week._id)).collect(),
        ),
      )
    ).flat();
    const keepVideoByKey = new Map<string, any>();
    for (const keepVideo of keepVideos) {
      keepVideoByKey.set(videoIdentityKey(keepVideo), keepVideo);
    }

    const removeWeeks = await ctx.db
      .query("weeks")
      .withIndex("by_course", (q: any) => q.eq("courseId", args.removeCourseId))
      .collect();
    const removeToKeepVideoId = new Map<any, any>();
    const removeVideoIds: any[] = [];
    for (const week of removeWeeks) {
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_week", (q: any) => q.eq("weekId", week._id))
        .collect();
      for (const video of videos) {
        const matchingKeep = keepVideoByKey.get(videoIdentityKey(video));
        if (matchingKeep) {
          removeToKeepVideoId.set(video._id, matchingKeep._id);
        }
        removeVideoIds.push(video._id);
      }
    }

    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      const enrolled = user.enrolledCourseIds || [];
      if (!enrolled.includes(args.removeCourseId)) continue;
      const withoutRemoved = enrolled.filter((id) => id !== args.removeCourseId);
      const merged = withoutRemoved.includes(args.keepCourseId)
        ? withoutRemoved
        : [...withoutRemoved, args.keepCourseId];
      await ctx.db.patch(user._id, { enrolledCourseIds: merged });
    }

    const progressRows = (await ctx.db.query("videoProgress").collect()).filter(
      (row) => row.courseId === args.removeCourseId,
    );
    for (const row of progressRows) {
      const targetVideoId = removeToKeepVideoId.get(row.videoId);
      if (!targetVideoId) {
        await ctx.db.delete(row._id);
        continue;
      }

      const existingTarget = await ctx.db
        .query("videoProgress")
        .withIndex("by_user_video", (q: any) =>
          q.eq("clerkId", row.clerkId).eq("videoId", targetVideoId),
        )
        .first();

      if (existingTarget && existingTarget._id !== row._id) {
        await ctx.db.patch(existingTarget._id, {
          courseId: args.keepCourseId,
          progress: Math.max(existingTarget.progress, row.progress),
          watchedSeconds: Math.max(existingTarget.watchedSeconds, row.watchedSeconds),
          completed: existingTarget.completed || row.completed,
          lastPosition: Math.max(existingTarget.lastPosition, row.lastPosition),
          lastWatchedAt: Math.max(existingTarget.lastWatchedAt, row.lastWatchedAt),
        });
        await ctx.db.delete(row._id);
      } else {
        await ctx.db.patch(row._id, {
          courseId: args.keepCourseId,
          videoId: targetVideoId,
        });
      }
    }

    const noteRows = (await ctx.db.query("videoNotes").collect()).filter(
      (row: any) => removeToKeepVideoId.has(row.videoId),
    );
    for (const row of noteRows) {
      await ctx.db.patch(row._id, { videoId: removeToKeepVideoId.get(row.videoId) });
    }

    const orphanNotes = (await ctx.db.query("videoNotes").collect()).filter(
      (row: any) => removeVideoIds.includes(row.videoId) && !removeToKeepVideoId.has(row.videoId),
    );
    for (const row of orphanNotes) {
      await ctx.db.delete(row._id);
    }

    for (const week of removeWeeks) {
      const videos = await ctx.db
        .query("videos")
        .withIndex("by_week", (q: any) => q.eq("weekId", week._id))
        .collect();
      for (const video of videos) {
        await ctx.db.delete(video._id);
      }
      await ctx.db.delete(week._id);
    }

    if (args.newTitle) {
      await ctx.db.patch(args.keepCourseId, { title: args.newTitle });
    }

    await ctx.db.delete(args.removeCourseId);

    return {
      success: true,
      kept: args.keepCourseId,
      removed: args.removeCourseId,
      renamedTo: args.newTitle || keepCourse.title,
      removedWeeks: removeWeeks.length,
      migratedProgressRows: progressRows.length,
    };
  },
});
