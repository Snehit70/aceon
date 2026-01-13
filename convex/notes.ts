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
    return await ctx.db
      .query("notes")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();
  },
});

export const searchNotes = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    // Simple regex search for now (Convex has better search, but this is quick start)
    // Actually, let's just return all for client-side filtering if query is empty
    if (!args.query) return [];

    // In a real app, use ctx.db.query("notes").withSearchIndex(...)
    // For now, simple filter
    const allNotes = await ctx.db.query("notes").collect();
    return allNotes.filter((note) =>
      note.title.toLowerCase().includes(args.query.toLowerCase())
    );
  },
});
