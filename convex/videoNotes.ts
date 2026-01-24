import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addNote = mutation({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
    timestamp: v.number(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      throw new Error("Unauthorized");
    }

    const now = Date.now();
    return await ctx.db.insert("videoNotes", {
      clerkId: args.clerkId,
      videoId: args.videoId,
      timestamp: args.timestamp,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("videoNotes"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const note = await ctx.db.get(args.noteId);
    if (!note) throw new Error("Note not found");

    if (note.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("videoNotes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const note = await ctx.db.get(args.noteId);
    if (!note) return;

    if (note.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.noteId);
  },
});

export const getNotesForVideo = query({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      return [];
    }

    const notes = await ctx.db
      .query("videoNotes")
      .withIndex("by_user_video", (q) =>
        q.eq("clerkId", args.clerkId).eq("videoId", args.videoId)
      )
      .collect();

    return notes.sort((a, b) => a.timestamp - b.timestamp);
  },
});

export const getAllNotes = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkId) {
      return [];
    }

    const limit = args.limit ?? 50;
    const notes = await ctx.db
      .query("videoNotes")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(limit);

    const results = await Promise.all(
      notes.map(async (note) => {
        const video = await ctx.db.get(note.videoId);
        return {
          ...note,
          video,
        };
      })
    );

    return results.filter((r) => r.video);
  },
});
