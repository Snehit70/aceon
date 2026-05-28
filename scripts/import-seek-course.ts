import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as fs from "fs";
import * as dotenv from "dotenv";
import { execFileSync } from "child_process";
import * as os from "os";
import * as path from "path";

dotenv.config({ path: ".env.local" });

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error("Error: NEXT_PUBLIC_CONVEX_URL not defined");
  process.exit(1);
}
const convexUrl = CONVEX_URL;

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: bun scripts/import-seek-course.ts /abs/path/aceon-seek-course-*.json");
  process.exit(1);
}
const skipDuration = process.argv.includes("--skip-duration");
const outFlagIndex = process.argv.indexOf("--out");
const explicitOutPath = outFlagIndex >= 0 ? process.argv[outFlagIndex + 1] : null;

type Level = "foundation" | "diploma" | "degree";
type Video = {
  title: string;
  youtubeId: string;
  duration?: number;
  transcriptUrl?: string;
  slug: string;
  order: number;
};
type Week = {
  title: string;
  order: number;
  videos: Video[];
};
type ImportShape = {
  course: {
    code: string;
    title: string;
    level: Level;
  };
  weeks: Week[];
};

type SeekFile = {
  aceonImportShape?: ImportShape;
  recommendedAceonImportShape?: ImportShape;
};
type FinalPayload = {
  code: string;
  title: string;
  level: Level;
  weeks: Week[];
};

function fetchDurationsBatch(youtubeIds: string[]): Map<string, number> {
  const result = new Map<string, number>();
  if (youtubeIds.length === 0) return result;

  const uniqueIds = [...new Set(youtubeIds)];
  const batchPath = path.join(
    os.tmpdir(),
    `aceon-yt-batch-${Date.now()}-${Math.random().toString(16).slice(2)}.txt`,
  );

  try {
    fs.writeFileSync(
      batchPath,
      uniqueIds.map((id) => `https://www.youtube.com/watch?v=${id}`).join("\n"),
    );

    const output = execFileSync(
      "yt-dlp",
      [
        "--no-warnings",
        "--skip-download",
        "--batch-file",
        batchPath,
        "--print",
        "%(id)s\t%(duration)s",
      ],
      { encoding: "utf-8", maxBuffer: 20 * 1024 * 1024, timeout: 120000 },
    );

    for (const line of output.split("\n")) {
      if (!line.trim()) continue;
      const [id, durationRaw] = line.split("\t");
      const seconds = Number(durationRaw);
      if (id && Number.isFinite(seconds) && seconds > 0) {
        result.set(id.trim(), seconds);
      }
    }
  } finally {
    if (fs.existsSync(batchPath)) fs.unlinkSync(batchPath);
  }

  return result;
}

function fetchDurationSeconds(youtubeId: string): number {
  try {
    const output = execFileSync(
      "yt-dlp",
      [
        "--no-warnings",
        "--skip-download",
        "--print",
        "%(duration)s",
        `https://www.youtube.com/watch?v=${youtubeId}`,
      ],
      { encoding: "utf-8" },
    ).trim();

    const seconds = Number(output);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  } catch {
    return 0;
  }
}

async function run() {
  const raw = fs.readFileSync(inputPath, "utf-8");
  const data = JSON.parse(raw) as SeekFile;

  const maybePayload = data as unknown as FinalPayload;
  const importShape = data.aceonImportShape ?? data.recommendedAceonImportShape;

  const courseCode = importShape?.course.code ?? maybePayload.code;
  const courseTitle = importShape?.course.title ?? maybePayload.title;
  const courseLevel = importShape?.course.level ?? maybePayload.level;
  const sourceWeeks = importShape?.weeks ?? maybePayload.weeks;

  if (!courseCode || !courseTitle || !courseLevel || !Array.isArray(sourceWeeks)) {
    throw new Error(
      "Input JSON must be either SEEK format (aceonImportShape) or final payload format ({ code, title, level, weeks })",
    );
  }

  const weeks = sourceWeeks.map((week) => ({
      title: week.title,
      order: week.order,
      videos: week.videos.map((video) => ({
        title: video.title,
        youtubeId: video.youtubeId,
        duration: video.duration ?? 0,
        transcriptUrl: video.transcriptUrl,
        slug: video.slug,
        order: video.order,
      })),
    }));

  const allVideos = weeks.flatMap((week) => week.videos);
  let updatedDurations = 0;

  console.log(`Course ${courseCode}: ${weeks.length} weeks, ${allVideos.length} videos`);
  if (!skipDuration) {
    console.log("Fetching durations with fast yt-dlp batch mode...");

    const zeroDurationIds = allVideos
      .filter((video) => (video.duration ?? 0) <= 0)
      .map((video) => video.youtubeId);

    console.log(`Videos needing duration: ${zeroDurationIds.length}`);
    const chunkSize = 20;
    const totalChunks = Math.max(1, Math.ceil(zeroDurationIds.length / chunkSize));
    const durationById = new Map<string, number>();

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * chunkSize;
      const end = start + chunkSize;
      const chunkIds = zeroDurationIds.slice(start, end);
      if (chunkIds.length === 0) break;

      const label = `Chunk ${chunkIndex + 1}/${totalChunks}`;
      console.log(`${label}: fetching durations for ${chunkIds.length} videos...`);
      const chunkDurations = fetchDurationsBatch(chunkIds);
      for (const [id, seconds] of chunkDurations.entries()) {
        durationById.set(id, seconds);
      }
      console.log(
        `${label}: resolved ${chunkDurations.size}/${chunkIds.length} (cumulative ${durationById.size}/${zeroDurationIds.length})`,
      );
    }

    console.log("Applying durations and running single-video fallback for unresolved IDs...");
    let fallbackTried = 0;
    let fallbackRecovered = 0;
    for (const video of allVideos) {
      if ((video.duration ?? 0) > 0) continue;
      const seconds = durationById.get(video.youtubeId) ?? 0;
      if (seconds > 0) {
        video.duration = seconds;
        updatedDurations += 1;
        continue;
      }
      // Fallback for entries yt-dlp skipped in batch mode.
      fallbackTried += 1;
      const fallbackSeconds = fetchDurationSeconds(video.youtubeId);
      if (fallbackSeconds > 0) {
        video.duration = fallbackSeconds;
        updatedDurations += 1;
        fallbackRecovered += 1;
      }
    }
    console.log(`Fallback tried: ${fallbackTried}, recovered: ${fallbackRecovered}`);
  } else {
    console.log("Skipping duration extraction (--skip-duration enabled).");
  }

  const missingDurations = allVideos.filter((video) => (video.duration ?? 0) <= 0).length;
  console.log(`Durations updated: ${updatedDurations}, still missing: ${missingDurations}`);

  const payload = {
    code: courseCode,
    title: courseTitle,
    level: courseLevel,
    weeks,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const defaultOutPath = path.resolve(
    process.cwd(),
    "data",
    "imports",
    `aceon-seek-course-import-ready-${payload.code.toLowerCase()}-${stamp}.json`,
  );
  const outPath = explicitOutPath ? path.resolve(explicitOutPath) : defaultOutPath;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(`Saved import-ready payload: ${outPath}`);

  const client = new ConvexHttpClient(convexUrl);
  const result = await client.mutation(api.seed.replaceCourseData, {
    course: payload,
    importToken: process.env.CONVEX_SEED_IMPORT_TOKEN,
  });
  console.log("Replace import complete:", result);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
