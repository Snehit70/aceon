/**
 * fetch-subtitles-local.ts
 *
 * Phase 1 of the subtitle pipeline: fetch VTT content for every unique YouTube ID
 * in the project's import JSONs and save it to data/subtitles/{youtubeId}.vtt.
 *
 * Features:
 *  - Resume-safe: state is persisted to data/subtitles/.state.json after every video.
 *    Re-running skips IDs already marked "ok" or "no-subs". "error" entries are retried.
 *  - Concurrent pool with configurable concurrency (default: 8).
 *  - Retry per video (default: 2 extra attempts = 3 total).
 *  - Realistic ETA based on rolling average of completed videos.
 *  - yt-dlp binary auto-detected (prefers ~/.local/bin/yt-dlp, falls back to system).
 *  - Dry-run mode (--dry-run) to preview scope without downloading.
 *  - Optional --force flag to re-fetch IDs already marked "ok".
 *
 * Usage:
 *   bun scripts/fetch-subtitles-local.ts [options]
 *
 * Options:
 *   --concurrency N   Parallel workers (default: 8)
 *   --retries N       Extra retry attempts per video (default: 2)
 *   --limit N         Process only the first N pending IDs (for testing)
 *   --force           Re-download even IDs already marked "ok"
 *   --dry-run         Print scope and exit without downloading
 *   --ytdlp PATH      Override yt-dlp binary path
 *
 * Output:
 *   data/subtitles/{youtubeId}.vtt  — downloaded VTT content
 *   data/subtitles/.state.json      — resume state (persisted after each video)
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";

const execFileAsync = promisify(execFile);

// ─── Types ─────────────────────────────────────────────────────────────────

type VideoEntry = {
  youtubeId: string;
  title?: string;
};

type VideoState = "ok" | "no-subs" | "error";

type StateFile = {
  version: 2;
  updatedAt: string;
  entries: Record<string, { state: VideoState; updatedAt: string; attempts: number }>;
};

// ─── Arg Parsing ───────────────────────────────────────────────────────────

function parseArgs() {
  const argv = process.argv.slice(2);

  const get = (flag: string): string | null => {
    const i = argv.indexOf(flag);
    return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null;
  };

  const concurrencyRaw = get("--concurrency");
  const retriesRaw = get("--retries");
  const limitRaw = get("--limit");
  const ytdlpOverride = get("--ytdlp");

  // Default 2: mweb client + node JS runtime is slower per-video; higher
  // concurrency causes 429s. 2 workers is the safe sweet spot.
  const concurrency = concurrencyRaw ? Number(concurrencyRaw) : 2;
  const retries = retriesRaw ? Number(retriesRaw) : 2;
  const limit = limitRaw ? Number(limitRaw) : null;
  const force = argv.includes("--force");
  const dryRun = argv.includes("--dry-run");
  const fromConvex = argv.includes("--from-convex");
  const convexUrlOverride = get("--convex-url");

  if (!Number.isFinite(concurrency) || concurrency < 1) throw new Error("Invalid --concurrency");
  if (!Number.isFinite(retries) || retries < 0) throw new Error("Invalid --retries");
  if (limit !== null && (!Number.isFinite(limit) || limit < 1)) throw new Error("Invalid --limit");

  return {
    concurrency: Math.floor(concurrency),
    retries: Math.floor(retries),
    limit: limit !== null ? Math.floor(limit) : null,
    force,
    dryRun,
    ytdlpOverride,
    fromConvex,
    convexUrlOverride,
  };
}

// ─── yt-dlp Detection ──────────────────────────────────────────────────────

function findYtDlp(override: string | null): string {
  if (override) {
    if (!fs.existsSync(override)) throw new Error(`yt-dlp not found at: ${override}`);
    return override;
  }

  // Prefer fresh pip-installed version over system one
  const candidates = [
    path.join(os.homedir(), ".local", "bin", "yt-dlp"),
    "/usr/local/bin/yt-dlp",
    "/usr/bin/yt-dlp",
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }

  throw new Error(
    "yt-dlp not found. Install with: pip install yt-dlp\n" +
      "Or pass --ytdlp /path/to/yt-dlp"
  );
}

// ─── Import JSON Parsing ────────────────────────────────────────────────────

function collectVideosFromImports(importsDir: string): VideoEntry[] {
  if (!fs.existsSync(importsDir)) throw new Error(`Imports dir not found: ${importsDir}`);

  const seen = new Set<string>();
  const results: VideoEntry[] = [];

  const files = fs
    .readdirSync(importsDir)
    .filter((f) => f.endsWith(".json"))
    // Prefer non-enriched originals; process all and deduplicate by youtubeId
    .map((f) => path.join(importsDir, f));

  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      console.warn(`[warn] Could not parse ${path.basename(file)}, skipping`);
      continue;
    }

    const d = raw as Record<string, unknown>;

    // Support both direct { weeks } and nested { aceonImportShape: { weeks } }
    let weeks: unknown[] = [];
    if (Array.isArray(d.weeks)) {
      weeks = d.weeks as unknown[];
    } else if (d.aceonImportShape && Array.isArray((d.aceonImportShape as Record<string, unknown>).weeks)) {
      weeks = (d.aceonImportShape as Record<string, unknown[]>).weeks;
    } else if (
      d.recommendedAceonImportShape &&
      Array.isArray((d.recommendedAceonImportShape as Record<string, unknown>).weeks)
    ) {
      weeks = (d.recommendedAceonImportShape as Record<string, unknown[]>).weeks;
    }

    for (const week of weeks) {
      const w = week as Record<string, unknown>;
      if (!Array.isArray(w.videos)) continue;
      for (const video of w.videos as Record<string, unknown>[]) {
        const id = typeof video.youtubeId === "string" ? video.youtubeId.trim() : null;
        if (!id || seen.has(id)) continue;
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) continue; // sanity check
        seen.add(id);
        results.push({ youtubeId: id, title: typeof video.title === "string" ? video.title : undefined });
      }
    }
  }

  return results;
}

// ─── Convex DB Collection ──────────────────────────────────────────────────

async function collectVideosFromConvex(convexUrl: string): Promise<VideoEntry[]> {
  // Dynamically import convex so the script still works without it for --from-convex=false
  const { ConvexHttpClient } = await import("convex/browser");
  const { api } = await import("../convex/_generated/api");

  const client = new ConvexHttpClient(convexUrl);
  const ids: string[] = await client.query(api.courses.getAllYoutubeIds);

  console.log(`[convex] fetched ${ids.length} unique YouTube IDs from ${convexUrl}`);
  return ids.map((youtubeId) => ({ youtubeId }));
}

// ─── State Management ───────────────────────────────────────────────────────

function loadState(stateFile: string): StateFile {
  if (fs.existsSync(stateFile)) {
    try {
      const raw = JSON.parse(fs.readFileSync(stateFile, "utf-8")) as StateFile;
      if (raw.version === 2) return raw;
      // migrate v1 (flat string values)
      const migrated: StateFile = { version: 2, updatedAt: new Date().toISOString(), entries: {} };
      for (const [id, val] of Object.entries(raw.entries ?? {})) {
        const oldVal = val as unknown;
        if (typeof oldVal === "string") {
          migrated.entries[id] = { state: oldVal as VideoState, updatedAt: new Date().toISOString(), attempts: 1 };
        } else {
          migrated.entries[id] = val as StateFile["entries"][string];
        }
      }
      return migrated;
    } catch {
      console.warn("[warn] State file corrupted, starting fresh");
    }
  }
  return { version: 2, updatedAt: new Date().toISOString(), entries: {} };
}

function saveState(stateFile: string, state: StateFile) {
  state.updatedAt = new Date().toISOString();
  // Atomic write: write to temp then rename
  const tmp = stateFile + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, stateFile);
}

// ─── yt-dlp Fetch ──────────────────────────────────────────────────────────

async function fetchVttForVideo(
  youtubeId: string,
  ytdlp: string,
  retries: number
): Promise<string | null> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const tempDir = await mkdtemp(path.join(tmpdir(), "aceon-subs-"));
    try {
      const args = [
        // mweb client avoids the web PO-token/bot-check; falls back to default
        "--extractor-args", "youtube:player-client=mweb,default",
        // node is already on PATH; needed for JS challenge solving
        "--js-runtimes", "node",
        "--skip-download",
        "--write-subs",
        "--write-auto-subs",
        "--sub-langs", "en.*,en",
        "--sub-format", "vtt",
        "--no-warnings",
        // Polite delay — prevents per-IP 429s when running sequential
        "--sleep-interval", "1",
        "--max-sleep-interval", "3",
        "-o", path.join(tempDir, "%(id)s.%(ext)s"),
        url,
      ];

      try {
        await execFileAsync(ytdlp, args, {
          timeout: 90_000,
          maxBuffer: 20 * 1024 * 1024,
        });
      } catch (_ytErr) {
        // yt-dlp exits non-zero when ANY sub-variant request fails (e.g. the
        // plain "en" track gets a 429 even after the auto-sub variant already
        // wrote its file). Still check the temp dir — partial success counts.
      }

      const files = await readdir(tempDir);
      const vttFile = files.find((f) => f.startsWith(`${youtubeId}.`) && f.endsWith(".vtt"));

      if (!vttFile) {
        // No file produced at all — genuine no-subs or a full failure.
        // Back off before retry: 8s, 16s, 24s …
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 8_000 * (attempt + 1)));
          continue;
        }
        return null;
      }

      const content = await readFile(path.join(tempDir, vttFile), "utf-8");
      return content.trim().length > 0 ? content : null;
    } finally {
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  return null;
}

// ─── Concurrency Pool ──────────────────────────────────────────────────────

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
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

// ─── ETA Tracker ───────────────────────────────────────────────────────────

class EtaTracker {
  private startMs = Date.now();
  private completedMs: number[] = [];

  record() {
    this.completedMs.push(Date.now());
  }

  eta(remaining: number): string {
    const n = this.completedMs.length;
    if (n < 2) return "calculating...";
    const window = Math.min(n, 20); // rolling 20-sample window
    const elapsed = this.completedMs[n - 1] - this.completedMs[Math.max(0, n - window)];
    const avgMs = elapsed / (window - 1 || 1);
    const etaMs = remaining * avgMs;
    const etaSec = Math.round(etaMs / 1000);
    if (etaSec < 60) return `~${etaSec}s`;
    return `~${Math.floor(etaSec / 60)}m${etaSec % 60}s`;
  }

  elapsed(): string {
    const s = Math.round((Date.now() - this.startMs) / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m${s % 60}s`;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();

  const repoRoot = process.cwd();
  const importsDir = path.join(repoRoot, "data", "imports");
  const subtitlesDir = path.join(repoRoot, "data", "subtitles");
  const stateFile = path.join(subtitlesDir, ".state.json");

  fs.mkdirSync(subtitlesDir, { recursive: true });

  const ytdlp = findYtDlp(args.ytdlpOverride);
  console.log(`[yt-dlp] using: ${ytdlp}`);

  // Verify yt-dlp is callable
  const { stdout: ytVersion } = await execFileAsync(ytdlp, ["--version"]).catch(() => ({ stdout: "?" }));
  console.log(`[yt-dlp] version: ${ytVersion.trim()}`);

  // Collect all unique YouTube IDs
  const allVideos = args.fromConvex
    ? await collectVideosFromConvex(args.convexUrlOverride ?? "https://glad-marten-760.convex.cloud")
    : collectVideosFromImports(importsDir);
  console.log(`[scope] ${allVideos.length} unique YouTube IDs found${args.fromConvex ? " (from Convex prod DB)" : " across all import files"}`);

  // Load existing state
  const state = loadState(stateFile);
  const existingOk = Object.values(state.entries).filter((e) => e.state === "ok").length;
  const existingNoSubs = Object.values(state.entries).filter((e) => e.state === "no-subs").length;
  const existingError = Object.values(state.entries).filter((e) => e.state === "error").length;
  console.log(
    `[state] loaded: ok=${existingOk}, no-subs=${existingNoSubs}, error=${existingError} (from previous runs)`
  );

  // Determine which IDs need work
  const pending = allVideos.filter((v) => {
    const entry = state.entries[v.youtubeId];
    if (!entry) return true; // never seen
    if (args.force && entry.state === "ok") return true; // --force re-fetches ok
    if (entry.state === "error") return true; // always retry errors
    return false; // "ok" and "no-subs" are skipped
  });

  const toProcess = args.limit !== null ? pending.slice(0, args.limit) : pending;

  console.log(
    `[plan] pending=${pending.length}, will-process=${toProcess.length}${args.limit !== null ? ` (limited to ${args.limit})` : ""}${args.force ? " [--force]" : ""}`
  );

  // Time estimate (rough): 3–8s per video at concurrency workers
  const avgSecsPerVideo = 5;
  const estimatedSecs = Math.round((toProcess.length * avgSecsPerVideo) / args.concurrency);
  const estimatedMin = Math.floor(estimatedSecs / 60);
  const estimatedSec = estimatedSecs % 60;
  console.log(
    `[eta] rough estimate: ${estimatedMin}m${estimatedSec}s at concurrency=${args.concurrency} (actual varies by network)`
  );

  if (args.dryRun) {
    console.log("[dry-run] exiting without downloading");
    process.exit(0);
  }

  if (toProcess.length === 0) {
    console.log("[done] nothing to do — all IDs already processed");
    console.log(`       Run with --force to re-fetch "ok" entries`);
    process.exit(0);
  }

  // Counters (shared across workers via closure — Node is single-threaded)
  let completed = 0;
  let okCount = existingOk + (args.force ? 0 : 0); // will increment
  let noSubsCount = existingNoSubs;
  let errorCount = 0;
  const eta = new EtaTracker();

  // Persist SIGINT so partial progress is saved
  process.on("SIGINT", () => {
    console.log("\n[interrupted] saving state...");
    saveState(stateFile, state);
    console.log(`[interrupted] state saved. Re-run to resume (${completed} processed this session)`);
    process.exit(130);
  });

  await runPool(toProcess, args.concurrency, async (video, _idx) => {
    const { youtubeId } = video;
    const localPath = path.join(subtitlesDir, `${youtubeId}.vtt`);
    const prevAttempts = state.entries[youtubeId]?.attempts ?? 0;

    try {
      const vtt = await fetchVttForVideo(youtubeId, ytdlp, args.retries);

      if (vtt === null) {
        // yt-dlp ran successfully but no subtitle file produced
        state.entries[youtubeId] = {
          state: "no-subs",
          updatedAt: new Date().toISOString(),
          attempts: prevAttempts + 1,
        };
        noSubsCount++;
      } else {
        await writeFile(localPath, vtt, "utf-8");
        state.entries[youtubeId] = {
          state: "ok",
          updatedAt: new Date().toISOString(),
          attempts: prevAttempts + 1,
        };
        okCount++;
      }
    } catch (_err) {
      state.entries[youtubeId] = {
        state: "error",
        updatedAt: new Date().toISOString(),
        attempts: prevAttempts + 1,
      };
      errorCount++;
    }

    completed++;
    eta.record();
    saveState(stateFile, state); // persist after every video

    const remaining = toProcess.length - completed;
    const pct = ((completed / toProcess.length) * 100).toFixed(1);
    const label = state.entries[youtubeId].state;
    const etaStr = remaining > 0 ? ` eta=${eta.eta(remaining)}` : "";
    console.log(
      `[${completed}/${toProcess.length}] ${pct}% | ${youtubeId} → ${label} | ok=${okCount} no-subs=${noSubsCount} err=${errorCount}${etaStr}`
    );
  });

  saveState(stateFile, state);

  console.log("\n─────────────────────────────────────────");
  console.log(`[summary] elapsed=${eta.elapsed()}`);
  console.log(`  total unique IDs : ${allVideos.length}`);
  console.log(`  processed now    : ${completed}`);
  console.log(`  ok (this run)    : ${okCount - existingOk}`);
  console.log(`  no-subs found    : ${noSubsCount - existingNoSubs}`);
  console.log(`  errors           : ${errorCount}`);
  console.log(`  state file       : ${stateFile}`);
  console.log(`  vtt directory    : ${subtitlesDir}`);
  console.log("─────────────────────────────────────────");

  if (errorCount > 0) {
    console.log(`\n[note] ${errorCount} videos errored — re-run to retry them automatically`);
  }

  const totalOk = Object.values(state.entries).filter((e) => e.state === "ok").length;
  const totalNoSubs = Object.values(state.entries).filter((e) => e.state === "no-subs").length;
  const totalRemaining = allVideos.length - totalOk - totalNoSubs;
  if (totalRemaining > 0) {
    console.log(`[note] ${totalRemaining} IDs still pending (errors or not-yet-seen) — re-run to continue`);
  } else {
    console.log("\n[done] All IDs processed! Ready for Phase 2: bun scripts/export-subtitles-to-convex.ts");
  }
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
