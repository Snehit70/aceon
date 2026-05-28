import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, readdir, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

const execFileAsync = promisify(execFile);
const subtitleCache = new Map<string, string>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 6;
const cacheExpiry = new Map<string, number>();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getCachedSubtitle(youtubeId: string): string | null {
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
}

async function fetchSubtitleViaYtDlp(youtubeId: string): Promise<string | null> {
  const url = `https://www.youtube.com/watch?v=${youtubeId}`;
  const tempDir = await mkdtemp(join(tmpdir(), "aceon-subs-"));

  try {
    await execFileAsync("yt-dlp", [
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
    ]);

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
  const youtubeId = req.nextUrl.searchParams.get("youtubeId")?.trim();
  if (!youtubeId) {
    return NextResponse.json({ error: "youtubeId is required" }, { status: 400 });
  }

  const cached = getCachedSubtitle(youtubeId);
  if (cached) {
    return new NextResponse(cached, {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8", "X-Subtitle-Source": "cache" },
    });
  }

  try {
    const subtitle = await fetchSubtitleViaYtDlp(youtubeId);
    if (!subtitle) {
      return NextResponse.json({ error: "No subtitles found" }, { status: 404 });
    }
    setCachedSubtitle(youtubeId, subtitle);
    return new NextResponse(subtitle, {
      status: 200,
      headers: { "Content-Type": "text/vtt; charset=utf-8", "X-Subtitle-Source": "yt-dlp" },
    });
  } catch (error) {
    console.error("Subtitle fetch failed", error);
    return NextResponse.json({ error: "Failed to fetch subtitles" }, { status: 500 });
  }
}
