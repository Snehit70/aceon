
/* eslint-disable @typescript-eslint/no-explicit-any -- Dev script: dynamic JSON tree traversal */
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL is not defined in .env.local");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// --- Helpers ---
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

async function seedMath() {
  const code = 'ns_25t1_ma1001';
  const filename = `data/data_course_${code}.json`; // Correct path

  if (!fs.existsSync(filename)) {
    console.error(`❌ File ${filename} not found`);
    return;
  }

  console.log(`Processing ${filename}...`);
  const rawData = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  const { course, lessons } = rawData;

  // 1. Structure the data into Weeks/Videos
  // The 'courseOutlineWithChildrenOrder' is the source of truth for structure
  const outline = JSON.parse(course.courseOutlineWithChildrenOrder);

  interface Video {
    title: string;
    youtubeId: string;
    slug: string;
    order: number;
    duration: number;
    isPublic: boolean;
    // We can add vttUrl if schema supports it, but sticking to basics for now
  }

  interface Week {
    title: string;
    order: number;
    videos: Video[];
  }

  const weeks: Week[] = [];
  
  // We need to traverse the outline to find "Weeks" or logical groupings
  // Looking at the data sample:
  // Root -> "Course Introduction" (Topic) -> Lessons
  // Root -> "L1.1: ..." (Lesson directly? Or Topic?)
  
  // Let's assume top-level items are "Weeks" or "Modules" if they have children
  let weekOrder = 1;

  for (const item of outline) {
    const weekTitle = item.title;
    const weekVideos: Video[] = [];
    let videoOrder = 1;

    // Helper to extract videos from a node (recursively or just children)
    // The structure seems to be: Week/Topic -> Lesson (which has video)
    // Or Week/Topic -> SubTopic -> Lesson
    
    const extractVideos = (node: any) => {
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
            extractVideos(child);
        }
      }
      
      // If it's a lesson and we have details for it
      if (node.type === 'lesson' && node.has_video && lessons[node.id]) {
        const lessonDetail = lessons[node.id];
        // The 'video' field in scraping seems to be the YouTube ID (e.g. "s9zDRWmgsb4")
        if (lessonDetail.video) {
            weekVideos.push({
                title: lessonDetail.title,
                youtubeId: lessonDetail.video,
                slug: slugify(lessonDetail.title),
                order: videoOrder++,
                duration: 0, // Default duration since scraper doesn't provide it
                isPublic: true // Default visibility
            });
        }
      }
    };

    extractVideos(item);

    if (weekVideos.length > 0) {
        weeks.push({
            title: weekTitle,
            order: weekOrder++,
            videos: weekVideos
        });
    }
  }

  console.log(`Generated ${weeks.length} weeks with ${weeks.reduce((a,b) => a + b.videos.length, 0)} videos.`);

  // 2. Payload for Mutation
  const coursePayload = {
    courseId: code, // e.g. ns_25t1_ma1001
    code: 'MA1001', // Standard code
    term: '25t1',
    title: course.title,
    level: 'foundation',
    weeks: weeks
  };

  // 3. Send to Convex
  try {
      // Using the same mutation as the main seed script
      // @ts-expect-error - types might be inferred differently
      await client.mutation(api.seed.syncCourseData, { course: coursePayload });
      console.log(`✅ Successfully seeded ${coursePayload.code}`);
  } catch (err) {
      console.error(`❌ Seed failed:`, err);
  }
}

seedMath().catch(console.error);
