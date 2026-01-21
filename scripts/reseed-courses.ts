
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL not defined");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const slugify = (text: string) => {
  return text.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
};

const getLevel = (code: string): "foundation" | "diploma" | "degree" => {
  const num = code.match(/\d+/)?.[0];
  if (!num) return "foundation";
  const first = parseInt(num[0]);
  if (first === 1) return "foundation";
  if (first === 2) return "diploma";
  return "degree";
};

async function reseed() {
  const targetCourses = process.argv.slice(2);
  
  if (targetCourses.length === 0) {
    console.log("Usage: bun scripts/reseed-courses.ts ma1001 [ma1002] ...");
    process.exit(0);
  }

  console.log(`🌱 Re-seeding ${targetCourses.length} course(s)...\n`);

  for (const code of targetCourses) {
    const filename = `data_course:_${code.toLowerCase()}.json`;
    
    if (!fs.existsSync(filename)) {
      console.error(`❌ File not found: ${filename}. Run rescrape-courses.ts first.`);
      continue;
    }

    const courseData = JSON.parse(fs.readFileSync(filename, "utf-8"));
    const courseId = `ns_24t3_${code.toLowerCase()}`;
    const term = "24t3";

    interface Video { title: string; yt_vid: string; duration?: number; }
    interface Week { title: string; videos: Video[]; }

    const weeks = courseData.week_wise.map((week: Week, index: number) => ({
      title: week.title,
      order: index + 1,
      videos: week.videos.map((video: Video, vIndex: number) => ({
        title: video.title,
        youtubeId: video.yt_vid,
        duration: video.duration || 0,
        slug: slugify(video.title),
        isPublic: true,
        order: vIndex + 1,
      })),
    }));

    const payload = {
      courseId,
      code: code.toUpperCase(),
      term,
      title: courseData.title,
      level: getLevel(code),
      weeks,
    };

    console.log(`Processing ${code.toUpperCase()} (${courseData.title})...`);
    console.log(`  Weeks: ${weeks.length}`);
    console.log(`  Videos: ${weeks.reduce((s: number, w: { videos: unknown[] }) => s + w.videos.length, 0)}`);

    try {
      // @ts-expect-error - Script environment types
      const result = await client.mutation(api.seed.syncCourseData, { course: payload });
      console.log(`✅ Synced: ${result.courseId}\n`);
    } catch (error) {
      console.error(`❌ Failed to sync ${code}:`, error);
    }
  }

  console.log("✨ Re-seeding complete!");
}

reseed().catch(console.error);
