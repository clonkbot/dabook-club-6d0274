import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const getContent = query({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("aiContent")
      .withIndex("by_club_book_type", (q) =>
        q.eq("clubId", args.clubId).eq("bookId", args.bookId).eq("type", args.type)
      )
      .first();

    return content;
  },
});

export const saveContent = mutation({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    type: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if content already exists
    const existing = await ctx.db
      .query("aiContent")
      .withIndex("by_club_book_type", (q) =>
        q.eq("clubId", args.clubId).eq("bookId", args.bookId).eq("type", args.type)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { content: args.content, createdAt: Date.now() });
      return existing._id;
    }

    return await ctx.db.insert("aiContent", {
      clubId: args.clubId,
      bookId: args.bookId,
      type: args.type,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const generateQuestions = action({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    bookTitle: v.string(),
    bookAuthor: v.string(),
  },
  handler: async (ctx, args) => {
    const prompt = `Generate 10 thoughtful book club discussion questions for "${args.bookTitle}" by ${args.bookAuthor}.

Include a mix of:
- Questions about character motivations and development
- Questions about themes and symbolism
- Questions that connect the book to readers' personal experiences
- Questions about the author's writing style and choices
- Open-ended questions that spark debate

Format as a numbered list. Make questions engaging and thought-provoking for a women's book club.`;

    // For MVP, return sample questions (in production, this would call Claude API)
    const sampleQuestions = `1. What was your initial reaction to the main character, and how did your perception change throughout the book?

2. Which scene or moment in the book stayed with you the most, and why do you think it resonated?

3. How did the author's writing style contribute to the overall mood of the story?

4. What themes in this book felt most relevant to your own life experiences?

5. If you could have a conversation with any character, who would it be and what would you ask them?

6. How did the setting influence the characters' decisions and the overall plot?

7. Were there any plot twists or revelations that surprised you? Did they feel earned?

8. What do you think the author was trying to say about [major theme]?

9. How would you describe this book to someone who hasn't read it?

10. If this book were made into a movie, who would you cast in the main roles and why?`;

    await ctx.runMutation(api.ai.saveContent, {
      clubId: args.clubId,
      bookId: args.bookId,
      type: "questions",
      content: sampleQuestions,
    });

    return sampleQuestions;
  },
});

export const generateFoodRecommendations = action({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    bookTitle: v.string(),
    bookAuthor: v.string(),
  },
  handler: async (ctx, args) => {
    // For MVP, return sample recommendations
    const sampleRecommendations = `🍽️ **Food & Drink Pairings for "${args.bookTitle}"**

**Appetizers:**
- Artisan cheese board with fig jam and crackers
- Bruschetta with fresh tomatoes and basil
- Spinach and artichoke dip with warm bread

**Main Bites:**
- Mini quiches (vegetable or bacon)
- Chicken salad on croissants
- Caprese skewers with balsamic glaze

**Sweets:**
- Lemon lavender shortbread cookies
- Dark chocolate truffles
- Fresh fruit tart

**Drinks:**
- Sparkling rosé or prosecco
- Elderflower lemonade (non-alcoholic)
- Chai tea lattes
- A signature "Book Club Spritz" (Aperol, prosecco, splash of grapefruit)

**Themed Touch:**
Consider setting the table with elements that evoke the book's setting or era. Tea lights and fresh flowers always create a cozy atmosphere for discussion!`;

    await ctx.runMutation(api.ai.saveContent, {
      clubId: args.clubId,
      bookId: args.bookId,
      type: "food",
      content: sampleRecommendations,
    });

    return sampleRecommendations;
  },
});

export const generateGames = action({
  args: {
    clubId: v.id("clubs"),
    bookId: v.id("books"),
    bookTitle: v.string(),
    bookAuthor: v.string(),
  },
  handler: async (ctx, args) => {
    const sampleGames = `🎮 **Book Club Games for "${args.bookTitle}"**

**1. Two Truths and a Lie (Book Edition)**
Each member shares three "facts" about the book—two true and one false. Others guess which is the lie!

**2. Character Hot Seat**
One person "becomes" a character from the book. Others ask questions and they answer in character.

**3. Quote Detective**
Read out quotes from the book. Members guess which character said it and in what context.

**4. Plot Twist Prediction**
Before your next meeting, each person writes down an alternate ending. Vote on the most creative!

**5. Book Bingo**
Create bingo cards with common book elements (plot twist, romance, cliffhanger, etc.). Mark them as you discuss!

**6. Speed Round**
Quick-fire questions: "Favorite character?" "Least favorite moment?" "One word to describe the book?"

**7. Casting Call**
Go around and cast the movie adaptation. Bonus points for creative choices!

**Icebreaker:**
"What other book does this remind you of, and why?"`;

    await ctx.runMutation(api.ai.saveContent, {
      clubId: args.clubId,
      bookId: args.bookId,
      type: "games",
      content: sampleGames,
    });

    return sampleGames;
  },
});

export const generateRecommendations = action({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sampleRecs = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        reason: "A heartwarming story about life's infinite possibilities—perfect for reflective readers.",
        amazonUrl: "https://www.amazon.com/s?k=The+Midnight+Library+Matt+Haig&tag=dabookclub-20",
      },
      {
        title: "Where the Crawdads Sing",
        author: "Delia Owens",
        reason: "A beautiful blend of mystery and coming-of-age, with stunning nature writing.",
        amazonUrl: "https://www.amazon.com/s?k=Where+the+Crawdads+Sing+Delia+Owens&tag=dabookclub-20",
      },
      {
        title: "The Seven Husbands of Evelyn Hugo",
        author: "Taylor Jenkins Reid",
        reason: "A glamorous, emotional journey through Old Hollywood with unforgettable characters.",
        amazonUrl: "https://www.amazon.com/s?k=Seven+Husbands+Evelyn+Hugo&tag=dabookclub-20",
      },
    ];

    return sampleRecs;
  },
});
