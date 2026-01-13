
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

// Helper to slugify text
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-"); // Replace multiple - with single -
};

// Helper to determine level
const getLevel = (code: string) => {
  const numberPart = code.match(/\d+/)?.[0];
  if (!numberPart) return "foundation";

  const firstDigit = parseInt(numberPart[0]);
  if (firstDigit === 1) return "foundation";
  if (firstDigit === 2) return "diploma";
  if (firstDigit >= 3) return "degree";
  return "foundation";
};

async function seed() {
  console.log("🌱 Starting database seed...");

  // 1. Read the index file
  const indexParams = fs.readFileSync("data_courses_index.json", "utf-8");
  const coursesIndex = JSON.parse(indexParams);

  console.log(`Found ${coursesIndex.length} courses in index.`);

  for (const courseIndex of coursesIndex) {
    const { code, id, title } = courseIndex;

    // Construct filename
    // Note: The file naming seems to be data_course:_[code].json based on previous ls
    // e.g. data_course:_cs1001.json
    const filename = `data_course:_${code}.json`;

    if (!fs.existsSync(filename)) {
      console.warn(`⚠️  Warning: Data file ${filename} not found for course ${code}. Skipping.`);
      continue;
    }

    console.log(`\nProcessing ${code} (${title})...`);

    const courseDataRaw = fs.readFileSync(filename, "utf-8");
    const courseData = JSON.parse(courseDataRaw);

    // Transform data
    const term = id.split("_")[1] || "24t3"; // extract term from id like ns_24t3_cs1001

    interface Video {
      title: string;
      yt_vid: string;
      duration?: number;
    }

    interface Week {
      title: string;
      videos: Video[];
    }

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

    const coursePayload = {
      courseId: id,
      code: code.toUpperCase(),
      term: term,
      title: title,
      level: getLevel(code),
      weeks: weeks,
    };

    try {
      // Call mutation
      // @ts-expect-error - The generated types might be slightly off for the script environment
      const result = await client.mutation(api.seed.syncCourseData, { course: coursePayload });
      console.log(`✅ Synced ${code}: ${result.courseId}`);
    } catch (error) {
      console.error(`❌ Failed to sync ${code}:`, error);
    }
  }

  console.log("\n✨ Seeding completed!");
}

seed().catch(console.error);
