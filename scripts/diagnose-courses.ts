
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL not defined");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

async function diagnose() {
  console.log("🔍 Diagnosing course data integrity...\n");

  const courses = await client.query(api.courses.listWithStats, {});
  
  const issues: { code: string; title: string; expectedVideos: number; weekCount: number; avgPerWeek: number }[] = [];

  for (const course of courses) {
    const content = await client.query(api.courses.getCourseContent, { courseId: course._id });
    
    const weekCount = content.length;
    const visibleVideos = content.reduce((sum, w) => sum + w.videos.length, 0);
    const totalVideos = course.stats.lectureCount;
    
    const missing = totalVideos - visibleVideos;
    const avgPerWeek = weekCount > 0 ? Math.round(totalVideos / weekCount) : 0;
    
    console.log(`${course.code} (${course.title})`);
    console.log(`  Weeks: ${weekCount} | Videos in DB: ${totalVideos} | Visible: ${visibleVideos} | Missing: ${missing}`);
    
    if (missing > 0) {
      console.log(`  ⚠️  ISSUE: ${missing} videos are orphaned (linked to missing weeks)`);
      issues.push({ 
        code: course.code, 
        title: course.title, 
        expectedVideos: totalVideos, 
        weekCount,
        avgPerWeek 
      });
    }
    console.log("");
  }

  if (issues.length > 0) {
    console.log("\n========================================");
    console.log(`🚨 Found ${issues.length} courses with missing weeks:`);
    console.log("========================================");
    issues.forEach(i => {
      console.log(`  - ${i.code}: ${i.weekCount} weeks, ~${i.avgPerWeek} videos/week expected`);
    });
    console.log("\nThese courses need re-scraping.");
  } else {
    console.log("\n✅ All courses have complete week data.");
  }
}

diagnose().catch(console.error);
