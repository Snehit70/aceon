import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveCalculation = mutation({
  args: {
    term: v.string(),
    courses: v.array(
      v.object({
        code: v.string(),
        grade: v.string(),
        credits: v.number(),
      })
    ),
    sgpa: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("gpa_history", {
      userId: user._id,
      term: args.term,
      courses: args.courses,
      sgpa: args.sgpa,
      createdAt: Date.now(),
    });
  },
});

export const getHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return [];

    return await ctx.db
      .query("gpa_history")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});
