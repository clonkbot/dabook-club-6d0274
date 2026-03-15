import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("memberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const clubs = await Promise.all(
      memberships.map(async (m) => {
        const club = await ctx.db.get(m.clubId);
        if (!club) return null;

        const memberCount = (await ctx.db
          .query("memberships")
          .withIndex("by_club", (q) => q.eq("clubId", club._id))
          .collect()).length;

        let currentBook = null;
        if (club.currentBookId) {
          currentBook = await ctx.db.get(club.currentBookId);
        }

        return {
          ...club,
          role: m.role,
          memberCount,
          currentBook,
        };
      })
    );

    return clubs.filter(Boolean);
  },
});

export const get = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const membership = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", args.clubId).eq("userId", userId))
      .first();

    if (!membership) return null;

    const club = await ctx.db.get(args.clubId);
    if (!club) return null;

    const members = await ctx.db
      .query("memberships")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .collect();

    const membersWithProfiles = await Promise.all(
      members.map(async (m) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", m.userId))
          .first();
        return {
          ...m,
          name: profile?.name || "Unknown",
        };
      })
    );

    let currentBook = null;
    if (club.currentBookId) {
      currentBook = await ctx.db.get(club.currentBookId);
    }

    const currentPicker = club.pickerOrder[club.currentPickerIndex];
    const currentPickerProfile = currentPicker
      ? await ctx.db.query("profiles").withIndex("by_user", (q) => q.eq("userId", currentPicker)).first()
      : null;

    return {
      ...club,
      role: membership.role,
      members: membersWithProfiles,
      currentBook,
      currentPickerName: currentPickerProfile?.name || "Unknown",
      isOwner: membership.role === "owner",
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const inviteCode = generateInviteCode();

    const clubId = await ctx.db.insert("clubs", {
      name: args.name,
      description: args.description,
      inviteCode,
      ownerId: userId,
      pickerOrder: [userId],
      currentPickerIndex: 0,
      createdAt: Date.now(),
    });

    await ctx.db.insert("memberships", {
      clubId,
      userId,
      role: "owner",
      joinedAt: Date.now(),
    });

    return clubId;
  },
});

export const join = mutation({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const club = await ctx.db
      .query("clubs")
      .withIndex("by_invite_code", (q) => q.eq("inviteCode", args.inviteCode.toUpperCase()))
      .first();

    if (!club) throw new Error("Invalid invite code");

    const existing = await ctx.db
      .query("memberships")
      .withIndex("by_club_and_user", (q) => q.eq("clubId", club._id).eq("userId", userId))
      .first();

    if (existing) throw new Error("Already a member");

    await ctx.db.insert("memberships", {
      clubId: club._id,
      userId,
      role: "member",
      joinedAt: Date.now(),
    });

    // Add to picker order
    const newPickerOrder = [...club.pickerOrder, userId];
    await ctx.db.patch(club._id, { pickerOrder: newPickerOrder });

    return club._id;
  },
});

export const updatePickerOrder = mutation({
  args: {
    clubId: v.id("clubs"),
    pickerOrder: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const club = await ctx.db.get(args.clubId);
    if (!club || club.ownerId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.clubId, { pickerOrder: args.pickerOrder });
  },
});

export const advancePicker = mutation({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const club = await ctx.db.get(args.clubId);
    if (!club || club.ownerId !== userId) throw new Error("Not authorized");

    const nextIndex = (club.currentPickerIndex + 1) % club.pickerOrder.length;
    await ctx.db.patch(args.clubId, { currentPickerIndex: nextIndex });
  },
});

export const setCurrentBook = mutation({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const club = await ctx.db.get(args.clubId);
    if (!club) throw new Error("Club not found");

    // Check if user is current picker or owner
    const currentPicker = club.pickerOrder[club.currentPickerIndex];
    if (userId !== currentPicker && userId !== club.ownerId) {
      throw new Error("Not authorized to pick book");
    }

    // Mark previous current book as completed
    const currentClubBook = await ctx.db
      .query("clubBooks")
      .withIndex("by_club_and_status", (q) => q.eq("clubId", args.clubId).eq("status", "current"))
      .first();

    if (currentClubBook) {
      await ctx.db.patch(currentClubBook._id, {
        status: "completed",
        completedAt: Date.now(),
      });
    }

    // Add new club book
    await ctx.db.insert("clubBooks", {
      clubId: args.clubId,
      bookId: args.bookId,
      pickerId: userId,
      status: "current",
      startedAt: Date.now(),
    });

    // Update club's current book
    await ctx.db.patch(args.clubId, { currentBookId: args.bookId });
  },
});
