import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

const AMAZON_AFFILIATE_TAG = "dabookclub-20";

function generateAmazonUrl(title: string, authors: string[]): string {
  const searchQuery = encodeURIComponent(`${title} ${authors.join(" ")}`);
  return `https://www.amazon.com/s?k=${searchQuery}&tag=${AMAZON_AFFILIATE_TAG}`;
}

export const search = action({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(args.query)}&maxResults=10`
    );

    if (!response.ok) {
      throw new Error("Failed to search books");
    }

    const data = await response.json();

    return (data.items || []).map((item: any) => ({
      googleBooksId: item.id,
      title: item.volumeInfo?.title || "Unknown Title",
      authors: item.volumeInfo?.authors || ["Unknown Author"],
      coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace("http:", "https:"),
      description: item.volumeInfo?.description,
      pageCount: item.volumeInfo?.pageCount,
      amazonUrl: generateAmazonUrl(
        item.volumeInfo?.title || "",
        item.volumeInfo?.authors || []
      ),
    }));
  },
});

export const getOrCreate = mutation({
  args: {
    googleBooksId: v.string(),
    title: v.string(),
    authors: v.array(v.string()),
    coverUrl: v.optional(v.string()),
    description: v.optional(v.string()),
    pageCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("books")
      .withIndex("by_google_id", (q) => q.eq("googleBooksId", args.googleBooksId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("books", {
      googleBooksId: args.googleBooksId,
      title: args.title,
      authors: args.authors,
      coverUrl: args.coverUrl,
      description: args.description,
      pageCount: args.pageCount,
      amazonUrl: generateAmazonUrl(args.title, args.authors),
    });
  },
});

export const getClubHistory = query({
  args: { clubId: v.id("clubs") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const clubBooks = await ctx.db
      .query("clubBooks")
      .withIndex("by_club", (q) => q.eq("clubId", args.clubId))
      .order("desc")
      .collect();

    const booksWithDetails = await Promise.all(
      clubBooks.map(async (cb) => {
        const book = await ctx.db.get(cb.bookId);
        const picker = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", cb.pickerId))
          .first();

        return {
          ...cb,
          book,
          pickerName: picker?.name || "Unknown",
        };
      })
    );

    return booksWithDetails;
  },
});
