/**
 * export-subtitles-to-convex.ts
 *
 * Phase 2 of the subtitle pipeline: push locally cached VTT files from
 * data/subtitles/{youtubeId}.vtt into Convex using the chunked subtitle
 * mutation.
 *
 * Defaults:
 *  - Targets only YouTube IDs that exist in the configured Convex deployment.
 *  - Resume-safe via a persisted state file per deployment.
 *  - Retries only items with no prior state or state=error unless --force.
 *
 * Usage:
 *   bun scripts/export-subtitles-to-convex.ts [options]
 *
 * Options:
 *   --concurrency N   Parallel uploads (default: 2)
 *   --limit N         Process only the first N pending IDs
 *   --force           Re-process all scoped IDs regardless of saved state
 *   --all-local       Use every local .vtt file instead of querying Convex IDs
 *   --dry-run         Print scope and exit without mutating Convex
 *   --state-file P    Override the resume state file path
 *   --subtitles-dir P Override the local subtitle directory
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

type ExportState = "uploaded" | "unchanged" | "missing-file" | "missing-video" | "error";

type StateFile = {
  version: 1;
  updatedAt: string;
  deploymentUrl: string;
  entries: Record<
    string,
    {
      state: ExportState;
      updatedAt: string;
      attempts: number;
      bytes?: number;
      note?: string;
    }
  >;
};

function parseArgs() {
  const argv = process.argv.slice(2);

  const get = (flag: string): string | null => {
    const i = argv.indexOf(flag);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
  };

  const concurrencyRaw = get("--concurrency");
  const limitRaw = get("--limit");

  const concurrency = concurrencyRaw ? Number(concurrencyRaw) : 2;
  const limit = limitRaw ? Number(limitRaw) : null;
  const force = argv.includes("--force");
  const allLocal = argv.includes("--all-local");
  const dryRun = argv.includes("--dry-run");
  const stateFileOverride = get("--state-file");
  const subtitlesDirOverride = get("--subtitles-dir");

  if (!Number.isFinite(concurrency) || concurrency < 1) {
    throw new Error("Invalid --concurrency");
  }
  if (limit !== null && (!Number.isFinite(limit) || limit < 1)) {
    throw new Error("Invalid --limit");
  }

  return {
    concurrency: Math.floor(concurrency),
    limit: limit === null ? null : Math.floor(limit),
    force,
    allLocal,
    dryRun,
    stateFileOverride,
    subtitlesDirOverride,
  };
}

function sanitizeForFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function loadState(stateFile: string, deploymentUrl: string): StateFile {
  if (!fs.existsSync(stateFile)) {
    return { version: 1, updatedAt: new Date().toISOString(), deploymentUrl, entries: {} };
  }

  try {
    const raw = JSON.parse(fs.readFileSync(stateFile, "utf-8")) as StateFile;
    if (raw.version === 1 && raw.deploymentUrl === deploymentUrl) {
      return raw;
    }
  } catch {
    console.warn("[warn] Export state file is invalid, starting fresh");
  }

  return { version: 1, updatedAt: new Date().toISOString(), deploymentUrl, entries: {} };
}

function saveState(stateFile: string, state: StateFile) {
  state.updatedAt = new Date().toISOString();
  const tempFile = `${stateFile}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(state, null, 2));
  fs.renameSync(tempFile, stateFile);
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
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
  const args = parseArgs();

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined in .env.local");
  }

  const persistToken = process.env.CONVEX_SUBTITLE_PERSIST_TOKEN?.trim();
  if (!persistToken) {
    throw new Error("CONVEX_SUBTITLE_PERSIST_TOKEN is not defined in .env.local");
  }

  const client = new ConvexHttpClient(convexUrl);
  const repoRoot = process.cwd();
  const subtitlesDir = path.resolve(repoRoot, args.subtitlesDirOverride ?? "data/subtitles");
  if (!fs.existsSync(subtitlesDir)) {
    throw new Error(`Subtitles directory not found: ${subtitlesDir}`);
  }

  const defaultStateFile = path.join(
    subtitlesDir,
    `.export-state-${sanitizeForFilename(convexUrl)}.json`,
  );
  const stateFile = path.resolve(repoRoot, args.stateFileOverride ?? defaultStateFile);
  const state = loadState(stateFile, convexUrl);

  const localSubtitleFiles = fs
    .readdirSync(subtitlesDir)
    .filter((file) => file.endsWith(".vtt"))
    .sort();
  const localIds = localSubtitleFiles.map((file) => path.basename(file, ".vtt"));
  const localIdSet = new Set(localIds);

  const scopedIds = args.allLocal
    ? localIds
    : await client.query(api.courses.getAllYoutubeIds, {}).then((ids) => ids.slice().sort());

  const existingStateCounts = Object.values(state.entries).reduce<Record<ExportState, number>>(
    (acc, entry) => {
      acc[entry.state] += 1;
      return acc;
    },
    { uploaded: 0, unchanged: 0, "missing-file": 0, "missing-video": 0, error: 0 },
  );

  const pending = scopedIds.filter((youtubeId) => {
    const entry = state.entries[youtubeId];
    if (!entry) return true;
    if (args.force) return true;
    return entry.state === "error";
  });

  const toProcess = args.limit === null ? pending : pending.slice(0, args.limit);

  const matchedLocalCount = scopedIds.filter((youtubeId) => localIdSet.has(youtubeId)).length;
  const missingLocalCount = scopedIds.length - matchedLocalCount;

  console.log(`[convex] target deployment: ${convexUrl}`);
  console.log(`[scope] localVtt=${localIds.length} scopedIds=${scopedIds.length} matchedLocal=${matchedLocalCount} missingLocal=${missingLocalCount}`);
  console.log(
    `[state] uploaded=${existingStateCounts.uploaded} unchanged=${existingStateCounts.unchanged} missing-file=${existingStateCounts["missing-file"]} missing-video=${existingStateCounts["missing-video"]} error=${existingStateCounts.error}`,
  );
  console.log(
    `[plan] pending=${pending.length} will-process=${toProcess.length}${args.force ? " [--force]" : ""}${args.allLocal ? " [--all-local]" : ""}`,
  );
  console.log(`[state-file] ${stateFile}`);

  if (args.dryRun) {
    console.log("[dry-run] exiting without exporting");
    return;
  }

  if (toProcess.length === 0) {
    console.log("[done] nothing to export");
    return;
  }

  let completed = 0;
  let uploaded = 0;
  let unchanged = 0;
  let missingFile = 0;
  let missingVideo = 0;
  let errorCount = 0;
  let uploadedBytes = 0;

  process.on("SIGINT", () => {
    console.log("\n[interrupted] saving export state...");
    saveState(stateFile, state);
    console.log(`[interrupted] state saved after ${completed} items`);
    process.exit(130);
  });

  await runPool(toProcess, args.concurrency, async (youtubeId) => {
    const subtitlePath = path.join(subtitlesDir, `${youtubeId}.vtt`);
    const previousAttempts = state.entries[youtubeId]?.attempts ?? 0;

    try {
      if (!fs.existsSync(subtitlePath)) {
        state.entries[youtubeId] = {
          state: "missing-file",
          updatedAt: new Date().toISOString(),
          attempts: previousAttempts + 1,
          note: "Local VTT not found",
        };
        missingFile += 1;
      } else {
        const subtitleVtt = fs.readFileSync(subtitlePath, "utf-8");
        const bytes = Buffer.byteLength(subtitleVtt, "utf-8");
        const result = await client.mutation(api.courses.storeSubtitleVttByYoutubeId, {
          youtubeId,
          subtitleVtt,
          persistToken,
        });

        if (result.reason === "missing") {
          state.entries[youtubeId] = {
            state: "missing-video",
            updatedAt: new Date().toISOString(),
            attempts: previousAttempts + 1,
            bytes,
            note: "YouTube ID not present in target Convex deployment",
          };
          missingVideo += 1;
        } else if (result.reason === "unchanged") {
          state.entries[youtubeId] = {
            state: "unchanged",
            updatedAt: new Date().toISOString(),
            attempts: previousAttempts + 1,
            bytes,
          };
          unchanged += 1;
        } else {
          state.entries[youtubeId] = {
            state: "uploaded",
            updatedAt: new Date().toISOString(),
            attempts: previousAttempts + 1,
            bytes,
          };
          uploaded += 1;
          uploadedBytes += bytes;
        }
      }
    } catch (error) {
      state.entries[youtubeId] = {
        state: "error",
        updatedAt: new Date().toISOString(),
        attempts: previousAttempts + 1,
        note: error instanceof Error ? error.message : String(error),
      };
      errorCount += 1;
    }

    completed += 1;
    saveState(stateFile, state);

    const status = state.entries[youtubeId]?.state ?? "error";
    const pct = ((completed / toProcess.length) * 100).toFixed(1);
    console.log(
      `[${completed}/${toProcess.length}] ${pct}% | ${youtubeId} -> ${status} | uploaded=${uploaded} unchanged=${unchanged} missing-file=${missingFile} missing-video=${missingVideo} error=${errorCount}`,
    );
  });

  saveState(stateFile, state);

  console.log("\n─────────────────────────────────────────");
  console.log("[summary]");
  console.log(`  deployment      : ${convexUrl}`);
  console.log(`  scoped IDs      : ${scopedIds.length}`);
  console.log(`  processed now   : ${completed}`);
  console.log(`  uploaded        : ${uploaded}`);
  console.log(`  unchanged       : ${unchanged}`);
  console.log(`  missing-file    : ${missingFile}`);
  console.log(`  missing-video   : ${missingVideo}`);
  console.log(`  errors          : ${errorCount}`);
  console.log(`  uploaded bytes  : ${uploadedBytes}`);
  console.log(`  state file      : ${stateFile}`);
  console.log("─────────────────────────────────────────");
}

main().catch((error) => {
  console.error("[fatal]", error);
  process.exit(1);
});
