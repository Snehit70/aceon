#!/usr/bin/env node
/**
 * generate-changelog.mjs
 *
 * Regenerates CHANGELOG.md from the repository's GitHub Releases.
 *
 * The file is rebuilt from scratch on every run (idempotent — no duplicate
 * entries), so it always mirrors the current set of published releases.
 *
 * Env:
 * - GITHUB_REPOSITORY  "owner/repo" (provided automatically in Actions)
 * - GITHUB_TOKEN       token for the GitHub API (optional locally, raises rate limit)
 *
 * Usage: node scripts/generate-changelog.mjs
 */
import { writeFile } from "node:fs/promises";

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const OUT = "CHANGELOG.md";

if (!repo) {
  console.error("GITHUB_REPOSITORY is not set (expected 'owner/repo').");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

/** Fetch every release, following pagination. */
async function fetchReleases() {
  const all = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status} ${res.statusText}: ${await res.text()}`);
    }
    const batch = await res.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

const formatDate = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

/** Normalize a release body to clean GitHub-flavored Markdown. */
function normalizeBody(body) {
  if (!body || !body.trim()) return "_No release notes._";
  return body
    .replace(/\r\n/g, "\n") // normalize CRLF
    .replace(/\n{3,}/g, "\n\n") // collapse excess blank lines
    .trim();
}

const releases = (await fetchReleases())
  .filter((r) => !r.draft)
  .sort(
    (a, b) =>
      new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at),
  );

const lines = [
  "# Changelog",
  "",
  "All notable changes to Aceon. This file is generated automatically from GitHub Releases — do not edit it by hand.",
  "",
];

if (releases.length === 0) {
  lines.push("_No releases yet._", "");
} else {
  for (const r of releases) {
    const title = (r.name && r.name.trim()) || r.tag_name;
    const date = formatDate(r.published_at || r.created_at);
    const pre = r.prerelease ? " — pre-release" : "";
    lines.push(`## ${title}${date ? ` (${date})` : ""}${pre}`, "");
    lines.push(normalizeBody(r.body), "");
  }
}

const content = lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
await writeFile(OUT, content, "utf8");
console.log(`Wrote ${OUT} with ${releases.length} release(s).`);
