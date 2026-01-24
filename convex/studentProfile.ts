import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getProfile = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentProfile")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
    currentTerm: v.optional(v.string()),
    enrolledCourseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("studentProfile")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        level: args.level,
        currentTerm: args.currentTerm,
        enrolledCourseIds: args.enrolledCourseIds,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("studentProfile", {
        clerkId: args.clerkId,
        level: args.level,
        currentTerm: args.currentTerm,
        enrolledCourseIds: args.enrolledCourseIds,
      });
    }
  },
});

export const enrollInCourse = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("studentProfile")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!profile) {
      throw new Error("Profile not found. Please set up your profile first.");
    }

    if (!profile.enrolledCourseIds.includes(args.courseId)) {
      await ctx.db.patch(profile._id, {
        enrolledCourseIds: [...profile.enrolledCourseIds, args.courseId],
      });
    }
  },
});

export const unenrollFromCourse = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("studentProfile")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!profile) return;

    await ctx.db.patch(profile._id, {
      enrolledCourseIds: profile.enrolledCourseIds.filter((id) => id !== args.courseId),
    });
  },
});
