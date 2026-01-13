import { mutation } from "./_generated/server";

export const populate = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Check if data exists
    const existingSubject = await ctx.db.query("subjects").first();
    if (existingSubject) {
      // Data already seeded
      return "Data already exists";
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Must be logged in to seed");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) throw new Error("User record not found");

    // 2. Create Subjects
    const mathSubjectId = await ctx.db.insert("subjects", {
      code: "MAT101",
      name: "Engineering Mathematics I",
      semester: 1,
      credits: 4,
      description: "Linear Algebra and Calculus",
    });

    await ctx.db.insert("subjects", {
      code: "CS101",
      name: "Programming in C",
      semester: 1,
      credits: 4,
      description: "Introduction to structured programming",
    });

    // 3. Create Notes
    await ctx.db.insert("notes", {
      subjectId: mathSubjectId,
      title: "Unit 1: Matrices - Lecture Notes",
      fileUrl: "https://example.com/notes.pdf", // Placeholder
      type: "pdf",
      tags: ["matrices", "linear-algebra"],
      uploadedBy: user._id,
      downloads: 0,
    });

    // 4. Create Quizzes
    const quizId = await ctx.db.insert("quizzes", {
      title: "Calculus Fundamentals",
      subjectId: mathSubjectId,
      description: "Test your understanding of limits and derivatives",
      durationMinutes: 15,
      totalQuestions: 3,
      difficulty: "easy",
      isPublic: true,
      createdBy: user._id,
    });

    // 5. Create Questions
    await ctx.db.insert("questions", {
      quizId,
      text: "What is the derivative of x^2?",
      options: ["x", "2x", "x^2", "2"],
      correctOption: 1,
      explanation: "Power rule: d/dx(x^n) = nx^(n-1)",
    });

    await ctx.db.insert("questions", {
      quizId,
      text: "Limit of (1/x) as x approaches infinity is?",
      options: ["0", "1", "Infinity", "Undefined"],
      correctOption: 0,
    });

    await ctx.db.insert("questions", {
      quizId,
      text: "Integral of 2x dx is?",
      options: ["x^2 + C", "2x^2 + C", "x + C", "2x"],
      correctOption: 0,
    });

    return "Seeding complete";
  },
});
