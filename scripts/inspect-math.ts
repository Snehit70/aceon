
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

async function inspectMath() {
  console.log("🔍 Inspecting MA1001 content distribution...\n");

  const courses = await client.query(api.courses.list, {});
  const mathCourse = courses.find(c => c.code === "MA1001");

  if (!mathCourse) {
    console.error("MA1001 not found");
    return;
  }

  const content = await client.query(api.courses.getCourseContent, { courseId: mathCourse._id });
  
  content.forEach(week => {
    console.log(`${week.title}: ${week.videos.length} videos`);
    // Print first and last video to see if there's a pattern
    if (week.videos.length > 0) {
      console.log(`   First: ${week.videos[0].title}`);
      console.log(`   Last:  ${week.videos[week.videos.length-1].title}`);
    }
  });
}

inspectMath().catch(console.error);
