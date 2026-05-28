import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readdir, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

const execFileAsync = promisify(execFile);
const subtitleCache = new Map<string, string>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cacheExpiry = new Map<string, number>();
const noSubtitleCacheExpiry = new Map<string, number>();
const allowedVideoCache = new Map<string, number>();
const ALLOWED_VIDEO_CACHE_TTL_MS = 1000 * 60 * 30;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = CONVEX_URL ? new ConvexHttpClient(CONVEX_URL) : null;

function getCachedSubtitle(youtubeId: string): string | null {
  const missExpiry = noSubtitleCacheExpiry.get(youtubeId);
  if (missExpiry && Date.now() <= missExpiry) {
    return "__NO_SUBTITLE__";
  }
  if (missExpiry && Date.now() > missExpiry) {
    noSubtitleCacheExpiry.delete(youtubeId);
  }

  const expiry = cacheExpiry.get(youtubeId);
  if (!expiry || Date.now() > expiry) {
    subtitleCache.delete(youtubeId);
    cacheExpiry.delete(youtubeId);
    return null;
  }
  return subtitleCache.get(youtubeId) ?? null;
}

function setCachedSubtitle(youtubeId: string, content: string) {
  subtitleCache.set(youtubeId, content);
  cacheExpiry.set(youtubeId, Date.now() + CACHE_TTL_MS);
  noSubtitleCacheExpiry.delete(youtubeId);
}

function setNoSubtitleCache(youtubeId: string) {
  noSubtitleCacheExpiry.set(youtubeId, Date.now() + CACHE_TTL_MS);
}

async function isKnownVideoId(youtubeId: string): Promise<boolean> {
  const cachedExpiry = allowedVideoCache.get(youtubeId);
  if (cachedExpiry && cachedExpiry > Date.now()) return true;
  if (!convexClient) return false;

  try {
    const exists = await convexClient.query((api as any).courses.videoExistsByYoutubeId, { youtubeId });
    if (exists) {
      allowedVideoCache.set(youtubeId, Date.now() + ALLOWED_VIDEO_CACHE_TTL_MS);
    }
    return Boolean(exists);
  } catch (error) {
    // Failsafe: if Convex lookup fails, don't hard-fail subtitle playback for
    // authenticated users; rely on strict youtubeId validation + subtitle cache.
    console.error("Subtitle known-video lookup failed; bypassing guard for this request", error);
    return true;
  }
}

type ExecSpec = { file: string; argsPrefix?: string[] };

function getYtDlpCandidates(): ExecSpec[] {
  const configured = process.env.YT_DLP_BINARY?.trim();
  const candidates: ExecSpec[] = [];
  if (configured) {
    candidates.push({ file: configured });
  }
  candidates.push({ file: "yt-dlp" });
  candidates.push({ file: "python3", argsPrefix: ["-m", "yt_dlp"] });
  return candidates;
}

async function fetchSubtitleViaYtDlp(youtubeId: string): Promise<string | null> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const tempDir = await mkdtemp(join(tmpdir(), "aceon-subs-"));

  try {
    const baseArgs = [
      "--skip-download",
      "--write-subs",
      "--write-auto-subs",
      "--sub-langs",
      "en.*,en",
      "--sub-format",
      "vtt",
      "-o",
      join(tempDir, "%(id)s.%(ext)s"),
      url,
    ];

    const isUnavailableError = (candidate: ExecSpec, error: unknown) => {
      const errno = (error as NodeJS.ErrnoException).code;
      if (errno === "ENOENT") return true;

      // python3 exists but the yt_dlp module is not installed in runtime.
      if (candidate.file === "python3") {
        const stderr = String((error as { stderr?: unknown }).stderr ?? "");
        const stdout = String((error as { stdout?: unknown }).stdout ?? "");
        const combined = `${stderr}\n${stdout}`;
        if (combined.includes("No module named yt_dlp")) return true;
      }

      return false;
    };

    let lastError: unknown = null;
    let attempted = 0;
    for (const candidate of getYtDlpCandidates()) {
      attempted += 1;
      try {
        await execFileAsync(candidate.file, [...(candidate.argsPrefix ?? []), ...baseArgs]);
        lastError = null;
        break;
      } catch (error: unknown) {
        lastError = error;
        if (!isUnavailableError(candidate, error)) {
          throw error;
        }
      }
    }

    if (lastError && attempted > 0) {
      throw new Error("yt-dlp-unavailable");
    }

    const files = await readdir(tempDir);
    const subtitleFile = files.find((file) => file.startsWith(`${youtubeId}.`) && file.endsWith(".vtt"));
    if (!subtitleFile) return null;

    const content = await readFile(join(tempDir, subtitleFile), "utf-8");
    return content.trim().length > 0 ? content : null;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const youtubeId = req.nextUrl.searchParams.get("youtubeId")?.trim();
  if (!youtubeId) {
    return NextResponse.json({ error: "youtubeId is required" }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
    return NextResponse.json({ error: "Invalid youtubeId" }, { status: 400 });
  }

  const knownVideo = await isKnownVideoId(youtubeId);
  if (!knownVideo) {
    return NextResponse.json({ error: "Unknown videoId" }, { status: 404 });
  }

  const cached = getCachedSubtitle(youtubeId);
  if (cached === "__NO_SUBTITLE__") {
    return NextResponse.json({ error: "No subtitles found" }, { status: 404 });
  }
  if (cached) {
    return new NextResponse(cached, {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8", "X-Subtitle-Source": "cache" },
    });
  }

  try {
    const subtitle = await fetchSubtitleViaYtDlp(youtubeId);
    if (!subtitle) {
      setNoSubtitleCache(youtubeId);
      return NextResponse.json({ error: "No subtitles found" }, { status: 404 });
    }
    setCachedSubtitle(youtubeId, subtitle);
    return new NextResponse(subtitle, {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8", "X-Subtitle-Source": "yt-dlp" },
    });
  } catch (error) {
    console.error("Subtitle fetch failed", error);
    if (error instanceof Error && error.message === "yt-dlp-unavailable") {
      return NextResponse.json(
        {
          error:
            "Subtitle fallback is unavailable on this deployment. Install yt-dlp or set YT_DLP_BINARY to a valid executable path.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Failed to fetch subtitles" }, { status: 500 });
  }
}
