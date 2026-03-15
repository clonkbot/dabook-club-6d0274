import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profile with onboarding quiz answers
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    onboardingComplete: v.boolean(),
    quizAnswers: v.optional(v.object({
      readingFrequency: v.string(),
      favoriteGenres: v.array(v.string()),
      bookLength: v.string(),
      readingGoal: v.string(),
      clubExperience: v.string(),
      discussionStyle: v.string(),
      snackPreference: v.string(),
      availability: v.string(),
    })),
    subscriptionStatus: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Book clubs
  clubs: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    inviteCode: v.string(),
    ownerId: v.id("users"),
    currentBookId: v.optional(v.id("books")),
    pickerOrder: v.array(v.id("users")),
    currentPickerIndex: v.number(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  // Club memberships
  memberships: defineTable({
    clubId: v.id("clubs"),
    userId: v.id("users"),
    role: v.string(), // "owner" | "member"
    joinedAt: v.number(),
  }).index("by_club", ["clubId"])
    .index("by_user", ["userId"])
    .index("by_club_and_user", ["clubId", "userId"]),

  // Books
  books: defineTable({
    googleBooksId: v.string(),
    title: v.string(),
    authors: v.array(v.string()),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    pageCount: v.optional(v.number()),
    amazonUrl: v.optional(v.string()),
  }).index("by_google_id", ["googleBooksId"]),

  // Club books (reading history)
  clubBooks: defineTable({
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    pickerId: v.id("users"),
    status: v.string(), // "current" | "completed"
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_club", ["clubId"])
    .index("by_club_and_status", ["clubId", "status"]),

  // Chat messages
  messages: defineTable({
    clubId: v.id("clubs"),
    userId: v.id("users"),
    userName: v.string(),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_club", ["clubId"]),

  // AI-generated content cache
  aiContent: defineTable({
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    type: v.string(), // "questions" | "food" | "games"
    content: v.string(),
    createdAt: v.number(),
  }).index("by_club_book_type", ["clubId", "bookId", "type"]),

  // Personalized book recommendations
  recommendations: defineTable({
    userId: v.id("users"),
    books: v.array(v.object({
      title: v.string(),
      author: v.string(),
      reason: v.string(),
      amazonUrl: v.string(),
    })),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
