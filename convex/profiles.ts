import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      onboardingComplete: false,
      subscriptionStatus: "inactive",
      createdAt: Date.now(),
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    quizAnswers: v.object({
      readingFrequency: v.string(),
      favoriteGenres: v.array(v.string()),
      bookLength: v.string(),
      readingGoal: v.string(),
      clubExperience: v.string(),
      discussionStyle: v.string(),
      snackPreference: v.string(),
      availability: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      quizAnswers: args.quizAnswers,
      onboardingComplete: true,
    });
  },
});

export const updateSubscription = mutation({
  args: {
    subscriptionStatus: v.string(),
    stripeCustomerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      subscriptionStatus: args.subscriptionStatus,
      ...(args.stripeCustomerId && { stripeCustomerId: args.stripeCustomerId }),
    });
  },
});

export const updateName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, { name: args.name });
  },
});
