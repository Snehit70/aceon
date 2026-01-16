import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getNotes = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    // Require authentication to access study materials
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Sign in to access study materials");
    }

    return await ctx.db
      .query("notes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const searchNotes = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // Require authentication to search study materials
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized: Sign in to search study materials");
    }

    // If query is empty, return all notes (or recent ones)
    if (!args.query) {
      return await ctx.db.query("notes").order("desc").take(20);
    }

    // TODO: Replace with ctx.db.query("notes").withSearchIndex(...) for scale
    // Current implementation is O(N) - acceptable for <1000 notes
    const allNotes = await ctx.db.query("notes").collect();
    return allNotes.filter((note) =>
      note.title.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
