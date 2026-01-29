import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Retrieves a user profile by their Clerk ID.
 *
 * @param args.clerkId - The unique Clerk user ID.
 * @returns The user document, or null if not found.
 */
export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Updates an existing user profile or creates a new one if it doesn't exist.
 *
 * @param args.clerkId - The unique Clerk user ID.
 * @param args.level - The academic level of the user ("foundation", "diploma", or "degree").
 * @param args.enrolledCourseIds - A list of course IDs the user is enrolled in.
 * @returns The ID of the updated or created user record.
 */
export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    level: v.union(v.literal("foundation"), v.literal("diploma"), v.literal("degree")),
    enrolledCourseIds: v.array(v.id("courses")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error("Unauthorized");
    }

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

/**
 * Enrolls a user in a specific course.
 * If the user is already enrolled, no action is taken.
 *
 * @param args.clerkId - The unique Clerk user ID.
 * @param args.courseId - The ID of the course to enroll in.
 * @throws Error if the user profile is not found.
 */
export const enrollInCourse = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error("Unauthorized");
    }

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

/**
 * Unenrolls a user from a specific course.
 *
 * @param args.clerkId - The unique Clerk user ID.
 * @param args.courseId - The ID of the course to unenroll from.
 */
export const unenrollFromCourse = mutation({
  args: {
    clerkId: v.string(),
    courseId: v.id("courses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error("Unauthorized");
    }

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

