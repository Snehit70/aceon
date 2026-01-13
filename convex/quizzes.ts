import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    // In a real app, we might filter by subject or visibility
    const quizzes = await ctx.db.query("quizzes").collect();

    // Enrich with subject names (optional, but good for UI)
    // For now, let's just return the quizzes
    return quizzes;
  },
});

export const get = query({
  args: { id: v.id("quizzes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getQuestions = query({
  args: { quizId: v.id("quizzes") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    // Remove correctOption from client response to prevent cheating
    return questions.map(({ correctOption, ...q }) => q);
  },
});

export const submitAttempt = mutation({
  args: {
    quizId: v.id("quizzes"),
    answers: v.array(v.number()), // Array of selected option indices
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch questions to calculate score securely on server
    const questions = await ctx.db
      .query("questions")
      .withIndex("by_quiz", (q) => q.eq("quizId", args.quizId))
      .collect();

    const correctCount = questions.reduce((acc, question, index) => {
      // Use fallback if user didn't answer a specific question (though frontend should prevent this)
      const userAnswer = args.answers[index];
      if (userAnswer === question.correctOption) {
        return acc + 1;
      }
      return acc;
    }, 0);

    // Calculate percentage or raw score? Let's do raw score for now
    // Or maybe percentage rounded to 2 decimals
    const percentage = (correctCount / questions.length) * 100;

    const attemptId = await ctx.db.insert("attempts", {
      userId: user._id,
      quizId: args.quizId,
      score: percentage,
      answers: args.answers,
      completedAt: Date.now(),
    });

    return { attemptId, score: percentage, total: questions.length, correct: correctCount };
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) return null;

    const attempts = await ctx.db
      .query("attempts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (attempts.length === 0) return { totalAttempts: 0, averageScore: 0 };

    const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    return {
      totalAttempts: attempts.length,
      averageScore: totalScore / attempts.length,
      recentAttempts: attempts.sort((a, b) => b.completedAt - a.completedAt).slice(0, 5)
    };
  },
});
