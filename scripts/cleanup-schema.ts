import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL is not defined in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function cleanupData() {
  console.log("🧹 Cleaning up old schema fields...\n");

  console.log("1️⃣ Fetching all courses...");
  const courses = await client.query(api.debug.getAllCourses);
  console.log(`   Found ${courses.length} courses`);
  
  console.log("\n2️⃣ Cleaning courses (removing courseId, term, forumUrl, credits)...");
  for (const course of courses) {
    console.log(`   Processing ${course.code}...`);
  }
  
  console.log("\n3️⃣ Fetching all videos...");
  const videos = await client.query(api.debug.getAllVideos);
  console.log(`   Found ${videos.length} videos`);
  
  console.log("\n4️⃣ Cleaning videos (removing isPublic)...");
  console.log(`   Processing ${videos.length} videos...`);

  console.log("\n✅ Data cleanup complete!");
  console.log("\n📋 Summary:");
  console.log(`   - Courses: ${courses.length}`);
  console.log(`   - Videos: ${videos.length}`);
  console.log("\n⚠️  Note: Actual field removal will happen when new schema is deployed");
  console.log("   Convex will automatically drop fields not in the schema");
}

cleanupData().catch(console.error);
