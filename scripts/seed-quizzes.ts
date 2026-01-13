
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const DBMS_COURSE_ID = "ns_24t3_cs2001";

const sampleQuizzes = [
  {
    courseId: DBMS_COURSE_ID,
    title: "Week 1: Introduction to DBMS",
    description: "Test your understanding of basic DBMS concepts, file systems vs DBMS, and data abstraction.",
    durationMinutes: 15,
    difficulty: "easy" as const,
    questions: [
      {
        text: "Which of the following is NOT a disadvantage of a File Processing System?",
        options: [
          "Data Redundancy and Inconsistency",
          "Difficulty in Accessing Data",
          "Data Isolation",
          "Simple to implement for small applications"
        ],
        correctOption: 3,
        explanation: "File systems are actually simple to implement for small, standalone applications. The other options are well-known disadvantages compared to a DBMS."
      },
      {
        text: "Which level of data abstraction describes HOW data is stored in the database?",
        options: [
          "Physical Level",
          "Logical Level",
          "View Level",
          "Conceptual Level"
        ],
        correctOption: 0,
        explanation: "The Physical Level describes the complex low-level data structures. The Logical level describes WHAT data is stored."
      },
      {
        text: "What does the 'I' in ACID properties stand for?",
        options: [
          "Integrity",
          "Isolation",
          "Identity",
          "Inconsistency"
        ],
        correctOption: 1,
        explanation: "ACID stands for Atomicity, Consistency, Isolation, and Durability."
      },
      {
        text: "Which of the following is a Data Definition Language (DDL) command?",
        options: [
          "SELECT",
          "INSERT",
          "UPDATE",
          "CREATE"
        ],
        correctOption: 3,
        explanation: "CREATE is a DDL command used to define database schema. SELECT, INSERT, UPDATE are DML (Data Manipulation Language) commands."
      },
      {
        text: "A relationship between two entities is called:",
        options: [
          "Unary relationship",
          "Binary relationship",
          "Ternary relationship",
          "Weak relationship"
        ],
        correctOption: 1,
        explanation: "A relationship involving two entity sets is a Binary relationship."
      }
    ]
  },
  {
    courseId: DBMS_COURSE_ID,
    title: "Week 2: Relational Model & SQL",
    description: "Assess your knowledge of the Relational Model, Keys, and basic SQL queries.",
    durationMinutes: 20,
    difficulty: "medium" as const,
    questions: [
      {
        text: "Which of the following is a minimal super key?",
        options: [
          "Super Key",
          "Candidate Key",
          "Primary Key",
          "Foreign Key"
        ],
        correctOption: 1,
        explanation: "A Candidate Key is a super key for which no proper subset is a super key (minimal)."
      },
      {
        text: "Which SQL clause is used to filter groups of rows?",
        options: [
          "WHERE",
          "HAVING",
          "ORDER BY",
          "GROUP BY"
        ],
        correctOption: 1,
        explanation: "WHERE filters individual rows before grouping. HAVING filters groups after GROUP BY."
      },
      {
        text: "In SQL, which wildcard character represents zero or more characters?",
        options: [
          "_",
          "?",
          "%",
          "*"
        ],
        correctOption: 2,
        explanation: "% represents zero, one, or multiple characters. _ represents exactly one character."
      },
      {
        text: "Which integrity constraint ensures that a value in one table matches a value in another table?",
        options: [
          "Unique Constraint",
          "Check Constraint",
          "Referential Integrity (Foreign Key)",
          "Not Null Constraint"
        ],
        correctOption: 2,
        explanation: "Foreign Keys enforce Referential Integrity."
      }
    ]
  }
];

async function main() {
  console.log("🚀 Starting Quiz Seeder...");

  for (const quiz of sampleQuizzes) {
    console.log(`\nCreating Quiz: ${quiz.title}...`);
    try {
      const result = await client.mutation(api.seed.seedQuiz, { quiz });
      console.log(`✅ Created/Updated Quiz ID: ${result.quizId}`);
    } catch (error) {
      console.error(`❌ Failed to seed quiz: ${quiz.title}`);
      console.error(error);
    }
  }

  console.log("\n✨ Quiz Seeding Completed!");
}

main();
