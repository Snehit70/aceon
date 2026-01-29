import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
    enrolledCourseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        level: args.level,
        enrolledCourseIds: args.enrolledCourseIds,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: `${args.clerkId}@placeholder.com`,
        name: "User",
        joinedAt: Date.now(),
        level: args.level,
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found. Please set up your profile first.");
    }

    const currentCourses = user.enrolledCourseIds || [];
    if (!currentCourses.includes(args.courseId)) {
      await ctx.db.patch(user._id, {
        enrolledCourseIds: [...currentCourses, args.courseId],
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
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return;

    const currentCourses = user.enrolledCourseIds || [];
    await ctx.db.patch(user._id, {
      enrolledCourseIds: currentCourses.filter((id) => id !== args.courseId),
    });
  },
});
