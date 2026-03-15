import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check membership
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .first();

    if (!membership) return [];

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .order("asc")
      .take(100);

    return messages;
  },
});

export const send = mutation({
  args: {
    clubId: v.id("clubs"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check membership
    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .first();

    if (!membership) throw new Error("Not a member");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    await ctx.db.insert("messages", {
      clubId: args.clubId,
      userId,
      userName: profile?.name || "Unknown",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});
