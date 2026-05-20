/*
 * SEEK course final extractor for Aceon
 *
 * Paste into DevTools Console on any authenticated IITM SEEK course page:
 *   https://seek.onlinedegree.iitm.ac.in/courses/<namespace>
 *
 * It extracts the data Aceon needs:
 * - course code/title/level/namespace/forum URL
 * - week/module titles and order
 * - all lesson video links exposed by the course API
 * - YouTube IDs
 * - transcript VTT URLs when present
 * - source IDs/paths for traceability
 * - assignment metadata for future use
 *
 * Duration is intentionally left as 0 so it can be filled later with yt-dlp.
 *
 * Output file: aceon-seek-course-<namespace>-<timestamp>.json
 */
(async function seekCourseFinalExtractor() {
  const API_BASE = "https://open-nptel-nk7eaoz6ha-el.a.run.app";
  const FETCH_TIMEOUT_MS = 30000;

  const cleanText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const namespace = location.pathname.match(/\/courses\/([^/?#]+)/)?.[1]
    || new URL(location.href).searchParams.get("namespace")
    || "unknown-course";

  const inferCourseCode = (value) => String(value || "").match(/ns_\d+t\d+_([a-z]+\d+)/i)?.[1]?.toUpperCase() || "";

  const inferLevel = (code, title) => {
    const text = `${code} ${title}`.toLowerCase();
    if (/degree|cs3|bscs3|gn3|bsgn3/.test(text)) return "degree";
    if (/diploma|cs2|bsse2|bsms2|bsda2|cs200|se200|ms200|da200/.test(text)) return "diploma";
    return "foundation";
  };

  const slugify = (value) => cleanText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";

  const stripHtml = (value) => {
    const div = document.createElement("div");
    div.innerHTML = String(value || "");
    return cleanText(div.innerText || div.textContent);
  };

  const getFirst = (...values) => values.find((value) => cleanText(value)) || "";

  const extractYoutubeId = (item) => {
    const direct = getFirst(item?.video, item?.youtubeId, item?.youtube_id, item?.yt_vid, item?.video_id);
    const text = typeof direct === "string" && direct ? direct : JSON.stringify(item || {});
    return (
      text.match(/(?:youtube\.com\/(?:embed|shorts|watch)\/?(?:\?v=|\/)?|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)?.[1]
      || text.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)?.[1]
      || text.match(/[?&]video_id=([a-zA-Z0-9_-]{6,})/)?.[1]
      || (typeof direct === "string" && /^[a-zA-Z0-9_-]{6,}$/.test(direct) ? direct : "")
    );
  };

  const extractAllUrls = (item) => {
    const text = JSON.stringify(item || {});
    return Array.from(
      new Set(
        [...text.matchAll(/https?:\/\/[^\s"'<>)]+/g)]
          .map((match) => match[0].replace(/[),.;]+$/, "")),
      ),
    );
  };

  const extractTranscriptUrl = (item) => {
    const transcripts = item?.transcripts;
    if (Array.isArray(transcripts)) {
      const preferred = transcripts.find((entry) => entry?.language === "en" || entry?.lang === "en" || entry?.url || entry?.vtt_url || entry?.transcript_vtt_url) || transcripts[0];
      return getFirst(preferred?.url, preferred?.vtt_url, preferred?.transcript_vtt_url, preferred?.transcriptVttUrl);
    }
    if (transcripts && typeof transcripts === "object") {
      return getFirst(transcripts.url, transcripts.vtt_url, transcripts.transcript_vtt_url, transcripts.transcriptVttUrl);
    }
    return getFirst(item?.transcriptVttUrl, item?.transcript_vtt_url, item?.transcriptUrl, item?.transcript_url);
  };

  const readIndexedDb = async (dbName) => new Promise((resolve) => {
    const request = indexedDB.open(dbName);
    request.onerror = () => resolve([]);
    request.onsuccess = () => {
      const db = request.result;
      const stores = Array.from(db.objectStoreNames || []);
      const rows = [];
      if (!stores.length) {
        db.close();
        resolve(rows);
        return;
      }

      let remaining = stores.length;
      const finish = () => {
        remaining -= 1;
        if (remaining === 0) {
          db.close();
          resolve(rows);
        }
      };

      for (const storeName of stores) {
        try {
          const requestAll = db.transaction(storeName, "readonly").objectStore(storeName).getAll();
          requestAll.onsuccess = () => {
            rows.push(...requestAll.result);
            finish();
          };
          requestAll.onerror = finish;
        } catch {
          finish();
        }
      }
    };
  });

  const findFirebaseAccessToken = async () => {
    const databases = await indexedDB.databases?.() || [];
    const rows = [];
    for (const db of databases) {
      if (db.name) rows.push(...await readIndexedDb(db.name));
    }

    const tokens = [];
    const visit = (value) => {
      if (!value || typeof value !== "object") return;
      if (typeof value.stsTokenManager?.accessToken === "string") tokens.push(value.stsTokenManager.accessToken);
      if (typeof value.accessToken === "string") tokens.push(value.accessToken);
      for (const child of Object.values(value)) {
        if (child && typeof child === "object") visit(child);
      }
    };
    visit(rows);
    return tokens[0] || "";
  };

  const fetchCourseApi = async (token) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const url = `${API_BASE}/api/v2/user/course/?namespace=${encodeURIComponent(namespace)}`;
      const response = await fetch(url, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(`Course API ${response.status}: ${JSON.stringify(body).slice(0, 800)}`);
      }
      return body;
    } finally {
      clearTimeout(timeout);
    }
  };

  const flattenOutline = (items, path = []) => (items || []).flatMap((item, index) => {
    const title = cleanText(item.title || item.name || item.display_name || `Untitled ${index + 1}`);
    const currentPath = [...path, title];
    return [
      { item, title, path: currentPath, siblingOrder: index + 1, depth: path.length },
      ...flattenOutline(item.children || [], currentPath),
    ];
  });

  const isLessonVideo = (entry) => entry.item?.type === "L" && Boolean(extractYoutubeId(entry.item));
  const isRecommendedAceonLecture = (entry) => {
    const title = entry.title.trim();
    if (/^Lx[TI]\b/i.test(title)) return false;
    return /^(?:L)?\d+(?:\.\d+)+\b\s*:?.+/i.test(title);
  };
  const isAssignmentLike = (entry) => {
    const text = `${entry.title} ${entry.item?.type || ""} ${entry.item?.content_type || ""} ${entry.item?.availability || ""}`.toLowerCase();
    return !isLessonVideo(entry) && /assignment|programming|quiz|activity|graded|practice/.test(text);
  };

  const makeLecture = (entry, order) => ({
    title: entry.title,
    youtubeId: extractYoutubeId(entry.item),
    rawLinks: extractAllUrls(entry.item),
    duration: 0,
    slug: slugify(entry.title),
    transcriptUrl: extractTranscriptUrl(entry.item) || undefined,
    order,
    sourceId: entry.item?.id ?? null,
    sourcePath: entry.path,
  });

  const makeAssignmentMetadata = (entry, order) => ({
    title: entry.title,
    order,
    sourceId: entry.item?.id ?? null,
    sourcePath: entry.path,
    rawType: entry.item?.type || entry.item?.content_type || entry.item?.availability || "",
  });

  const downloadJson = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  console.log("[SEEK extractor] Reading Firebase access token from IndexedDB...");
  const token = await findFirebaseAccessToken();
  if (!token) throw new Error("Could not find Firebase access token in IndexedDB. Make sure you are logged in on SEEK.");

  console.log(`[SEEK extractor] Fetching course API for ${namespace}...`);
  const apiCourse = await fetchCourseApi(token);
  const outline = Array.isArray(apiCourse.outline) ? apiCourse.outline : [];
  const flat = flattenOutline(outline);
  const topModules = flat.filter((entry) => entry.depth === 0);
  const lessonVideoEntries = flat.filter(isLessonVideo);
  const recommendedLectureEntries = lessonVideoEntries.filter(isRecommendedAceonLecture);
  const assignmentEntries = flat.filter(isAssignmentLike);

  const code = inferCourseCode(namespace);
  const title = apiCourse.title || cleanText(document.querySelector(".course-title")?.innerText) || namespace;
  const course = {
    code,
    title,
    level: inferLevel(code, title),
    namespace,
    forumUrl: apiCourse.forum_url || "",
  };

  const weeks = topModules
    .map((module, moduleIndex) => {
      const entries = lessonVideoEntries.filter((entry) => entry.path[0] === module.title);
      return {
        title: module.title,
        order: moduleIndex + 1,
        sourceId: module.item?.id ?? null,
        videos: entries.map((entry, videoIndex) => makeLecture(entry, videoIndex + 1)),
      };
    })
    .filter((week) => week.videos.length > 0)
    .map((week, weekIndex) => ({ ...week, order: weekIndex + 1 }));

  const lectures = weeks.flatMap((week) => week.videos.map((video) => ({ ...video, weekTitle: week.title })));
  const lecturesWithoutYoutubeId = lectures.filter((lecture) => !lecture.youtubeId);
  const recommendedWeeks = topModules
    .map((module, moduleIndex) => {
      const entries = recommendedLectureEntries.filter((entry) => entry.path[0] === module.title);
      return {
        title: module.title,
        order: moduleIndex + 1,
        sourceId: module.item?.id ?? null,
        videos: entries.map((entry, videoIndex) => makeLecture(entry, videoIndex + 1)),
      };
    })
    .filter((week) => week.videos.length > 0)
    .map((week, weekIndex) => ({ ...week, order: weekIndex + 1 }));
  const recommendedLectures = recommendedWeeks.flatMap((week) => week.videos.map((video) => ({ ...video, weekTitle: week.title })));
  const assignments = assignmentEntries.map((entry, index) => makeAssignmentMetadata(entry, index + 1));

  const result = {
    meta: {
      scrapedAt: new Date().toISOString(),
      sourceUrl: location.href,
      namespace,
      extractor: "scripts/seek-course-final-extractor.console.js",
      durationNote: "duration is intentionally 0; fill later with yt-dlp using youtubeId",
    },
    summary: {
      topModules: topModules.length,
      importWeeks: weeks.length,
      importLectures: lectures.length,
      lecturesWithYoutubeId: lectures.filter((lecture) => lecture.youtubeId).length,
      lecturesWithoutYoutubeId: lecturesWithoutYoutubeId.length,
      lecturesWithTranscriptUrl: lectures.filter((lecture) => lecture.transcriptUrl).length,
      recommendedImportWeeks: recommendedWeeks.length,
      recommendedImportLectures: recommendedLectures.length,
      assignmentMetadata: assignments.length,
    },
    course,
    weeks,
    lectures,
    assignmentMetadata: assignments,
    allVideoLinksShape: {
      course: {
        code: course.code,
        title: course.title,
        level: course.level,
      },
      weeks: weeks.map((week) => ({
        title: week.title,
        order: week.order,
        videos: week.videos.map(({ sourceId: _sourceId, sourcePath: _sourcePath, ...video }) => video),
      })),
    },
    recommendedAceonImportShape: {
      course: {
        code: course.code,
        title: course.title,
        level: course.level,
      },
      weeks: recommendedWeeks.map((week) => ({
        title: week.title,
        order: week.order,
        videos: week.videos.map(({ sourceId: _sourceId, sourcePath: _sourcePath, ...video }) => video),
      })),
    },
    aceonImportShape: {
      course: {
        code: course.code,
        title: course.title,
        level: course.level,
      },
      weeks: weeks.map((week) => ({
        title: week.title,
        order: week.order,
        videos: week.videos.map(({ sourceId: _sourceId, sourcePath: _sourcePath, ...video }) => video),
      })),
    },
    diagnostics: {
      courseApiKeys: Object.keys(apiCourse),
      outlineItemCount: flat.length,
      allLessonVideoCount: flat.filter(isLessonVideo).length,
      recommendedLectureCount: recommendedLectureEntries.length,
      lecturesWithoutYoutubeId,
    },
  };

  const filename = `aceon-seek-course-${namespace}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
  downloadJson(result, filename);
  console.log("[SEEK extractor] Complete", result.summary, result);
  console.log(`[SEEK extractor] Downloaded ${filename}`);
  return result;
})();
