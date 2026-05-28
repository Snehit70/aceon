import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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

type ImportPayload = {
  code: string;
  title: string;
  level: Level;
  weeks: Week[];
};

type SubtitleEntry = {
  ext?: string;
  url?: string;
  lang?: string;
  language?: string;
};

type YtDlpJson = {
  subtitles?: Record<string, SubtitleEntry[]>;
  automatic_captions?: Record<string, SubtitleEntry[]>;
};

function parseArgs() {
  const inputPathArg = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;

  const outFlagIndex = process.argv.indexOf("--out");
  const outPath = outFlagIndex >= 0 ? process.argv[outFlagIndex + 1] : null;

  const concurrencyFlagIndex = process.argv.indexOf("--concurrency");
  const retriesFlagIndex = process.argv.indexOf("--retries");
  const limitFlagIndex = process.argv.indexOf("--limit");
  const cookiesFromBrowserFlagIndex = process.argv.indexOf("--cookies-from-browser");
  const cookiesFileFlagIndex = process.argv.indexOf("--cookies-file");
  const forceAll = process.argv.includes("--force-all");

  const cpuBasedDefault = Math.max(8, Math.min(48, os.cpus().length * 4));
  const concurrency =
    concurrencyFlagIndex >= 0
      ? Number(process.argv[concurrencyFlagIndex + 1])
      : cpuBasedDefault;
  const retries = retriesFlagIndex >= 0 ? Number(process.argv[retriesFlagIndex + 1]) : 2;
  const limit = limitFlagIndex >= 0 ? Number(process.argv[limitFlagIndex + 1]) : null;
  const cookiesFromBrowser =
    cookiesFromBrowserFlagIndex >= 0 ? process.argv[cookiesFromBrowserFlagIndex + 1] : null;
  const cookiesFile = cookiesFileFlagIndex >= 0 ? process.argv[cookiesFileFlagIndex + 1] : null;

  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error("Invalid --concurrency value");
  }
  if (!Number.isFinite(retries) || retries < 0) {
    throw new Error("Invalid --retries value");
  }
  if (limit !== null && (!Number.isFinite(limit) || limit < 1)) {
    throw new Error("Invalid --limit value");
  }

  return {
    inputPathArg,
    outPath,
    concurrency: Math.floor(concurrency),
    retries: Math.floor(retries),
    limit: limit === null ? null : Math.floor(limit),
    cookiesFromBrowser,
    cookiesFile,
    forceAll,
  };
}

function findLatestImportJson(importsDir: string): string {
  if (!fs.existsSync(importsDir)) {
    throw new Error(`Imports directory not found: ${importsDir}`);
  }
  const candidates = fs
    .readdirSync(importsDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const fullPath = path.join(importsDir, name);
      const stat = fs.statSync(fullPath);
      return { fullPath, mtimeMs: stat.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  if (candidates.length === 0) {
    throw new Error(`No JSON files found in ${importsDir}`);
  }
  return candidates[0].fullPath;
}

function ensureInputFile(inputPath: string, importsDir: string) {
  if (fs.existsSync(inputPath)) return;
  const available = fs.existsSync(importsDir)
    ? fs
        .readdirSync(importsDir)
        .filter((name) => name.endsWith(".json"))
        .slice(0, 20)
        .join("\n  - ")
    : "(imports directory missing)";
  throw new Error(
    `Input file not found: ${inputPath}\n` +
      `Put a file in ${importsDir} and run without input arg, or pass a real path.\n` +
      `Available JSON files:\n  - ${available || "(none)"}`
  );
}

function pickBestVttUrl(payload: YtDlpJson): string | undefined {
  const sources = [payload.subtitles, payload.automatic_captions];
  const languagePriority = ["en", "en-US", "en-GB", "en-IN", "a.en"];

  for (const source of sources) {
    if (!source) continue;
    for (const lang of languagePriority) {
      const entries = source[lang];
      if (!entries || entries.length === 0) continue;
      const vtt = entries.find((entry) => entry.ext === "vtt" && entry.url);
      if (vtt?.url) return vtt.url;
      const fallback = entries.find((entry) => entry.url);
      if (fallback?.url) return fallback.url;
    }

    for (const entries of Object.values(source)) {
      if (!entries || entries.length === 0) continue;
      const vtt = entries.find((entry) => entry.ext === "vtt" && entry.url);
      if (vtt?.url) return vtt.url;
      const fallback = entries.find((entry) => entry.url);
      if (fallback?.url) return fallback.url;
    }
  }

  return undefined;
}

async function extractTranscriptUrl(
  youtubeId: string,
  retries: number,
  options: { cookiesFromBrowser: string | null; cookiesFile: string | null }
): Promise<string | undefined> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const args = ["--dump-single-json", "--no-warnings", "--skip-download"];
      if (options.cookiesFromBrowser) {
        args.push("--cookies-from-browser", options.cookiesFromBrowser);
      } else if (options.cookiesFile) {
        args.push("--cookies", path.resolve(options.cookiesFile));
      }
      args.push(url);

      const { stdout } = await execFileAsync("yt-dlp", args, {
        maxBuffer: 20 * 1024 * 1024,
      });

      const payload = JSON.parse(stdout) as YtDlpJson;
      return pickBestVttUrl(payload);
    } catch (error) {
      if (attempt === retries) {
        console.warn(`[subtitle-miss] ${youtubeId}: ${String(error)}`);
        return undefined;
      }
    }
  }

  return undefined;
}

async function runPool<T>(items: T[], concurrency: number, worker: (item: T, index: number) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (true) {
      const index = cursor++;
      if (index >= items.length) return;
      await worker(items[index], index);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const { inputPathArg, outPath, concurrency, retries, limit, cookiesFromBrowser, cookiesFile, forceAll } =
    parseArgs();
  const repoRoot = process.cwd();
  const importsDir = path.join(repoRoot, "data", "imports");
  const inputPath = inputPathArg ? path.resolve(inputPathArg) : findLatestImportJson(importsDir);
  ensureInputFile(inputPath, importsDir);
  const raw = fs.readFileSync(inputPath, "utf-8");
  const payload = JSON.parse(raw) as ImportPayload;

  const videos = payload.weeks.flatMap((week) => week.videos);
  const existingTranscriptCount = videos.filter((v) => !!v.transcriptUrl && v.transcriptUrl.trim().length > 0).length;
  const candidates = forceAll
    ? videos
    : videos.filter((v) => !v.transcriptUrl || v.transcriptUrl.trim().length === 0);
  const fullUniqueIds = [...new Set(candidates.map((v) => v.youtubeId).filter(Boolean))];
  const uniqueIds = limit ? fullUniqueIds.slice(0, limit) : fullUniqueIds;
  const resultMap = new Map<string, string | undefined>();
  let completed = 0;
  let found = 0;

  console.log(
    `[start] videos=${videos.length}, existingTranscripts=${existingTranscriptCount}, mode=${
      forceAll ? "force-all" : "only-missing"
    }, uniqueIds=${uniqueIds.length}/${fullUniqueIds.length}, concurrency=${concurrency}, retries=${retries}${limit ? `, limit=${limit}` : ""}`
  );

  if (uniqueIds.length === 0) {
    const outputPath = outPath
      ? path.resolve(outPath)
      : path.join(
          importsDir,
          `${
            path.basename(inputPath, path.extname(inputPath)).endsWith(".with-transcripts")
              ? path.basename(inputPath, path.extname(inputPath))
              : `${path.basename(inputPath, path.extname(inputPath))}.with-transcripts`
          }.json`
        );
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));
    console.log("[done] nothing to fetch, all videos already have transcriptUrl");
    console.log(`[saved] ${outputPath}`);
    return;
  }

  await runPool(uniqueIds, concurrency, async (youtubeId) => {
    const transcriptUrl = await extractTranscriptUrl(youtubeId, retries, {
      cookiesFromBrowser,
      cookiesFile,
    });
    resultMap.set(youtubeId, transcriptUrl);
    completed += 1;
    if (transcriptUrl) found += 1;

    if (completed % 20 === 0 || completed === uniqueIds.length) {
      const pct = ((completed / uniqueIds.length) * 100).toFixed(1);
      console.log(`[progress] ${completed}/${uniqueIds.length} (${pct}%) | subtitles=${found}`);
    }
  });

  for (const week of payload.weeks) {
    for (const video of week.videos) {
      const transcriptUrl = resultMap.get(video.youtubeId);
      if (transcriptUrl) {
        video.transcriptUrl = transcriptUrl;
      }
    }
  }

  const outputPath = outPath
    ? path.resolve(outPath)
    : path.join(
        importsDir,
        `${
          path.basename(inputPath, path.extname(inputPath)).endsWith(".with-transcripts")
            ? path.basename(inputPath, path.extname(inputPath))
            : `${path.basename(inputPath, path.extname(inputPath))}.with-transcripts`
        }.json`
      );
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

  const coverage = videos.filter((v) => !!v.transcriptUrl && v.transcriptUrl.trim().length > 0).length;
  const added = coverage - existingTranscriptCount;
  console.log(`[done] subtitleCoverage=${coverage}/${videos.length} | addedNow=${Math.max(0, added)}`);
  console.log(`[saved] ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
