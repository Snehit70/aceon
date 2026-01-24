import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addBookmark = mutation({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
    timestamp: v.number(),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }
    if (identity.subject !== args.clerkId) {
      throw new Error("Unauthorized: Identity mismatch");
    }

    return await ctx.db.insert("bookmarks", {
      clerkId: identity.subject,
      videoId: args.videoId,
      timestamp: args.timestamp,
      label: args.label,
      createdAt: Date.now(),
    });
  },
});

export const removeBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark) return;

    if (bookmark.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.bookmarkId);
  },
});

export const updateBookmark = mutation({
  args: {
    bookmarkId: v.id("bookmarks"),
    label: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const bookmark = await ctx.db.get(args.bookmarkId);
    if (!bookmark) throw new Error("Bookmark not found");

    if (bookmark.clerkId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.bookmarkId, {
      label: args.label,
    });
  },
});

export const getBookmarksForVideo = query({
  args: {
    clerkId: v.string(),
    videoId: v.id("videos"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (identity.subject !== args.clerkId) {
      // In a real app, maybe allow reading others' bookmarks if public?
      // For now, strict ownership.
      return [];
    }

    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_video", (q) =>
        q.eq("clerkId", args.clerkId).eq("videoId", args.videoId)
      )
      .collect();

    return bookmarks.sort((a, b) => a.timestamp - b.timestamp);
  },
});

export const getAllBookmarks = query({
  args: {
    clerkId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    if (identity.subject !== args.clerkId) {
      return [];
    }

    const limit = args.limit ?? 50;
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("clerkId", args.clerkId))
      .order("desc")
      .take(limit);

    const results = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const video = await ctx.db.get(bookmark.videoId);
        return {
          ...bookmark,
          video,
        };
      })
    );

    return results.filter((r) => r.video);
  },
});
