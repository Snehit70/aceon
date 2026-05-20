"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { ChevronRight, Clapperboard, Clock, Search } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import {
  ArchiveTierSkeleton,
  EnrolledCardSkeleton,
} from "@/components/mobile/mobile-skeletons";

const LEVELS = [
  { key: "foundation", label: "Foundation", blurb: "Entry-level operations" },
  { key: "diploma", label: "Diploma", blurb: "Intermediate field work" },
  { key: "degree", label: "Degree", blurb: "Senior-tier engagements" },
] as const;

type LevelKey = (typeof LEVELS)[number]["key"];

export default function MobileLecturesPage() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "archives" ? "archives" : "enrolled";
  const levelParam = searchParams.get("level");
  const activeLevel: LevelKey | null = LEVELS.some((l) => l.key === levelParam)
    ? (levelParam as LevelKey)
    : null;

  const courses = useQuery(api.courses.listWithStats);
  const profile = useQuery(api.users.getUser, user?.id ? { clerkId: user.id } : "skip");
  const coursesProgress = useQuery(
    api.progress.getAllCoursesProgress,
    user?.id ? { clerkId: user.id } : "skip",
  );

  const [searchQuery, setSearchQuery] = useState("");

  const enrolledIds = useMemo(
    () => profile?.enrolledCourseIds || [],
    [profile?.enrolledCourseIds],
  );

  const enrolledCourses = useMemo(
    () => (courses || []).filter((course) => enrolledIds.includes(course._id)),
    [courses, enrolledIds],
  );

  const archiveCourses = useMemo(
    () => (courses || []).filter((course) => !enrolledIds.includes(course._id)),
    [courses, enrolledIds],
  );

  const archiveCountsByLevel = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of archiveCourses) counts[c.level] = (counts[c.level] || 0) + 1;
    return counts;
  }, [archiveCourses]);

  const levelCourses = useMemo(() => {
    if (!activeLevel) return [];
    const base = archiveCourses.filter((c) => c.level === activeLevel);
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (c) => c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [archiveCourses, activeLevel, searchQuery]);

  const isEnrolledTab = tab === "enrolled";
  const showLevelDetail = !isEnrolledTab && activeLevel;
  const showLevelIndex = !isEnrolledTab && !activeLevel;
  const activeLevelMeta = LEVELS.find((l) => l.key === activeLevel);

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-black px-4 py-5 pb-28">
      <header className="mb-5">
        {showLevelDetail && (
          <Link
            href="/m/lectures?tab=archives"
            className="mb-2 inline-block font-mono text-[11px] uppercase tracking-wider text-primary"
          >
            ← Archives
          </Link>
        )}
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">
          {isEnrolledTab
            ? "// Active_Operations"
            : showLevelDetail
              ? `// ${activeLevelMeta?.label}_Tier`
              : "// Archive_Index"}
        </p>
        <h1 className="mt-1.5 font-display text-[1.65rem] font-black uppercase leading-none tracking-wide text-white">
          {isEnrolledTab ? "Missions" : showLevelDetail ? activeLevelMeta?.label : "Archives"}
        </h1>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/55">
          {isEnrolledTab
            ? `${enrolledCourses.length} enrolled course${enrolledCourses.length === 1 ? "" : "s"}`
            : showLevelDetail
              ? `${levelCourses.length} of ${archiveCountsByLevel[activeLevel!] || 0} available`
              : `${archiveCourses.length} available across ${LEVELS.length} tiers`}
        </p>
      </header>

      {showLevelDetail && (
        <div className="sticky top-14 z-20 mb-4 -mx-1 px-1">
          <div className="relative border border-white/15 bg-black/95 shadow-[0_6px_20px_rgba(0,0,0,0.45)] backdrop-blur-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`SEARCH_${activeLevelMeta?.label.toUpperCase()}...`}
              className="h-11 border-0 bg-transparent pl-10 font-mono text-xs uppercase tracking-wider focus-visible:ring-0"
            />
          </div>
        </div>
      )}

      {courses === undefined ? (
        isEnrolledTab ? (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <EnrolledCardSkeleton />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <ArchiveTierSkeleton />
              </li>
            ))}
          </ul>
        )
      ) : isEnrolledTab ? (
        enrolledCourses.length > 0 ? (
          <ul className="space-y-3">
            {enrolledCourses.map((course) => {
              const percent = Math.round(coursesProgress?.[course._id] || 0);
              const started = percent > 0;
              const complete = percent >= 100;
              return (
                <li key={course._id}>
                  <Link
                    href={`/m/course/${course._id}`}
                    className="group relative block border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 transition-colors active:bg-primary/5"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-full w-[3px] bg-primary"
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {course.code}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-white/45">
                          {course.level}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/30 group-hover:text-primary" />
                    </div>

                    <h3 className="mt-3 line-clamp-2 font-display text-[1.15rem] font-bold uppercase leading-[1.05] text-white">
                      {course.title}
                    </h3>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="relative h-1.5 flex-1 overflow-hidden bg-white/8">
                        <div
                          className={`h-full ${complete ? "bg-green-500" : "bg-primary"}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span
                        className={`shrink-0 font-mono text-[11px] font-bold tabular-nums ${complete ? "text-green-400" : "text-primary"}`}
                      >
                        {percent}%
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/55">
                      <span className="inline-flex items-center gap-1.5">
                        <Clapperboard className="h-3 w-3" />
                        {course.stats.lectureCount} lec
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {course.stats.totalDurationFormatted}
                      </span>
                      <span
                        className={
                          complete
                            ? "text-green-400"
                            : started
                              ? "text-primary"
                              : "text-white/55"
                        }
                      >
                        {complete ? "Complete" : started ? "In progress" : "Not started"}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
            <p className="font-display text-sm font-bold uppercase tracking-wider text-white/80">
              No active missions
            </p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-white/50">
              Tap Archives below to enroll
            </p>
          </div>
        )
      ) : showLevelIndex ? (
        <ul className="space-y-3">
          {LEVELS.map((lvl, idx) => {
            const count = archiveCountsByLevel[lvl.key] || 0;
            return (
              <li key={lvl.key}>
                <Link
                  href={`/m/lectures?tab=archives&level=${lvl.key}`}
                  className="group relative flex items-center gap-4 border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-4 transition-colors active:bg-primary/5"
                >
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-full w-[3px] bg-primary/70"
                  />
                  <span className="font-display text-3xl font-black leading-none text-primary/30">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[1.05rem] font-bold uppercase leading-tight text-white">
                      {lvl.label}
                    </p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/55">
                      {lvl.blurb}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-primary/80">
                      {count} course{count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-white/40 group-hover:text-primary" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="space-y-2.5">
          {levelCourses.map((course) => (
            <li key={course._id}>
              <Link
                href={`/m/course/${course._id}`}
                className="group flex items-center gap-3 border border-white/10 bg-white/[0.03] p-3.5 transition-colors active:bg-primary/10"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                      {course.code}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                      · {course.level}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                    {course.title}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-white/30 group-hover:text-primary" />
              </Link>
            </li>
          ))}
          {levelCourses.length === 0 && (
            <div className="py-10 text-center font-mono text-xs uppercase tracking-wider text-white/55">
              {searchQuery.trim() ? "No courses match search" : "No courses in this tier"}
            </div>
          )}
        </ul>
      )}
    </div>
  );
}
