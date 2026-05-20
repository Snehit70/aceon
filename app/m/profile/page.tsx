"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { BookOpen, Check, CircleDot, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const levels = ["foundation", "diploma", "degree"] as const;
type Level = (typeof levels)[number];

const LEVEL_META: Record<Level, { label: string; blurb: string }> = {
  foundation: { label: "Foundation", blurb: "Entry-level operations" },
  diploma: { label: "Diploma", blurb: "Intermediate field work" },
  degree: { label: "Degree", blurb: "Senior-tier engagements" },
};

const getLevelOrder = (lvl: string) => {
  if (lvl === "foundation") return 1;
  if (lvl === "diploma") return 2;
  if (lvl === "degree") return 3;
  return 0;
};

type FilterKey = "current" | "all" | Level;

export default function MobileProfilePage() {
  const { user } = useUser();
  const profile = useQuery(api.users.getUser, user ? { clerkId: user.id } : "skip");
  const courses = useQuery(api.courses.list);
  const allProgress = useQuery(api.progress.getAllCoursesProgress, user ? { clerkId: user.id } : "skip");
  const updateProfile = useMutation(api.users.updateUser);
  const markCourseComplete = useMutation(api.progress.markCourseComplete);

  const [level, setLevel] = useState<Level>("foundation");
  const [studyingCourseIds, setStudyingCourseIds] = useState<Id<"courses">[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<Id<"courses">[]>([]);
  const [initialLevel, setInitialLevel] = useState<Level>("foundation");
  const [initialStudyingIds, setInitialStudyingIds] = useState<Id<"courses">[]>([]);
  const [initialCompletedIds, setInitialCompletedIds] = useState<Id<"courses">[]>([]);
  const [filter, setFilter] = useState<FilterKey>("current");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      const lvl = profile.level as Level;
      setLevel(lvl);
      setInitialLevel(lvl);
      const enrolled = profile.enrolledCourseIds || [];
      setStudyingCourseIds(enrolled);
      setInitialStudyingIds(enrolled);
    }
  }, [profile]);

  useEffect(() => {
    if (allProgress && profile?.level && courses) {
      const userLevelOrder = getLevelOrder(profile.level);
      const doneIds: Id<"courses">[] = [];
      for (const course of courses) {
        const courseLevelOrder = getLevelOrder(course.level);
        const isPriorLevel = userLevelOrder > courseLevelOrder;
        const progressPercent = allProgress[course._id] || 0;
        if (isPriorLevel || progressPercent === 100) doneIds.push(course._id);
      }
      setCompletedCourseIds(doneIds);
      setInitialCompletedIds(doneIds);
    }
  }, [allProgress, profile, courses]);

  const stats = useMemo(() => {
    const studying = studyingCourseIds.length;
    const done = completedCourseIds.length;
    const inProgress = Object.values(allProgress || {}).filter((p) => p > 0 && p < 100).length;
    return { studying, done, inProgress };
  }, [studyingCourseIds, completedCourseIds, allProgress]);

  const effectiveLevel = useMemo<Level>(() => {
    if (!courses) return level;
    let maxOrder = getLevelOrder(level);
    const activeIds = new Set<string>([
      ...studyingCourseIds,
      ...completedCourseIds,
      ...Object.entries(allProgress || {})
        .filter(([, p]) => p > 0)
        .map(([id]) => id),
    ]);
    for (const c of courses) {
      if (activeIds.has(c._id)) {
        const order = getLevelOrder(c.level);
        if (order > maxOrder) maxOrder = order;
      }
    }
    if (maxOrder >= 3) return "degree";
    if (maxOrder >= 2) return "diploma";
    return "foundation";
  }, [courses, level, studyingCourseIds, completedCourseIds, allProgress]);

  const isAutoPromoted = effectiveLevel !== level;

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (filter === "all") return courses;
    if (filter === "current") return courses.filter((c) => c.level === effectiveLevel);
    return courses.filter((c) => c.level === filter);
  }, [courses, filter, effectiveLevel]);

  const isDirty = useMemo(() => {
    if (level !== initialLevel) return true;
    const sameArr = (a: Id<"courses">[], b: Id<"courses">[]) =>
      a.length === b.length && a.every((id) => b.includes(id));
    if (!sameArr(studyingCourseIds, initialStudyingIds)) return true;
    if (!sameArr(completedCourseIds, initialCompletedIds)) return true;
    return false;
  }, [level, initialLevel, studyingCourseIds, initialStudyingIds, completedCourseIds, initialCompletedIds]);

  const getCourseStatus = (courseId: Id<"courses">) => {
    if (studyingCourseIds.includes(courseId)) return "studying";
    if (completedCourseIds.includes(courseId)) return "done";
    return null;
  };

  const handleCourseStatusChange = (courseId: Id<"courses">, status: "studying" | "done" | null) => {
    setStudyingCourseIds((prev) => prev.filter((id) => id !== courseId));
    setCompletedCourseIds((prev) => prev.filter((id) => id !== courseId));
    if (status === "studying") setStudyingCourseIds((prev) => [...prev, courseId]);
    if (status === "done") setCompletedCourseIds((prev) => [...prev, courseId]);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({ clerkId: user.id, level, enrolledCourseIds: studyingCourseIds });
      const toComplete = completedCourseIds.filter((courseId) => (allProgress?.[courseId] || 0) < 100);
      const toUncomplete = initialCompletedIds.filter((courseId) => !completedCourseIds.includes(courseId));
      await Promise.allSettled([
        ...toComplete.map((courseId) => markCourseComplete({ clerkId: user.id, courseId })),
        ...toUncomplete.map((courseId) => markCourseComplete({ clerkId: user.id, courseId })),
      ]);
      setInitialLevel(level);
      setInitialStudyingIds(studyingCourseIds);
      setInitialCompletedIds(completedCourseIds);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = user?.fullName || user?.firstName || user?.username || "Operator";
  const displayEmail = user?.primaryEmailAddress?.emailAddress;
  const initials = displayName
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const filterChips: { key: FilterKey; label: string }[] = [
    { key: "current", label: `My tier (${LEVEL_META[effectiveLevel].label})` },
    { key: "all", label: "All" },
    { key: "foundation", label: "Foundation" },
    { key: "diploma", label: "Diploma" },
    { key: "degree", label: "Degree" },
  ];

  return (
    <div className="px-4 py-5 pb-32">
      <header className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">{"// Operator"}</p>
        <h1 className="mt-1.5 font-display text-[1.65rem] font-black uppercase leading-none tracking-wide text-white">
          Profile
        </h1>
      </header>

      <div className="relative mb-5 overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-4">
        <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-primary" />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-primary/50 bg-primary/10 font-display text-base font-black uppercase text-primary">
            {initials || "OP"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-bold uppercase leading-tight text-white">
              {displayName}
            </p>
            {displayEmail && (
              <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-wider text-white/55">
                {displayEmail}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-block border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                {LEVEL_META[effectiveLevel].label} tier
              </span>
              {isAutoPromoted && (
                <span className="inline-block border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/55">
                  saved: {LEVEL_META[level].label}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/8 pt-3">
          <Stat icon={<BookOpen className="h-3 w-3" />} label="Studying" value={stats.studying} />
          <Stat icon={<CircleDot className="h-3 w-3" />} label="Active" value={stats.inProgress} />
          <Stat icon={<Check className="h-3 w-3" />} label="Done" value={stats.done} tone="green" />
        </div>
      </div>

      <section className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-primary/80" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Threat level</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((lvl) => {
            const active = level === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={cn(
                  "flex min-h-[60px] flex-col items-start justify-center border px-2.5 py-2 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 bg-white/[0.02] text-white/80 active:bg-white/5",
                )}
              >
                <span className="font-display text-xs font-bold uppercase tracking-wide">
                  {LEVEL_META[lvl].label}
                </span>
                <span
                  className={cn(
                    "mt-0.5 font-mono text-[9px] uppercase tracking-wider leading-tight",
                    active ? "text-primary/80" : "text-white/45",
                  )}
                >
                  {LEVEL_META[lvl].blurb}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
            Course status
          </p>
          <div className="mt-2 -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filterChips.map((chip) => {
              const active = filter === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => setFilter(chip.key)}
                  className={cn(
                    "inline-flex shrink-0 items-center border px-3.5 min-h-[36px] font-mono text-[10px] font-bold uppercase tracking-wider transition-colors",
                    active
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-white/10 bg-white/[0.02] text-white/65 active:bg-white/[0.06]",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {courses === undefined ? (
          <div className="py-10 text-center font-mono text-[11px] uppercase tracking-wider text-white/55">
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
            <p className="font-mono text-[11px] uppercase tracking-wider text-white/55">
              No courses in this filter
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredCourses.map((course) => {
              const status = getCourseStatus(course._id);
              return (
                <li
                  key={course._id}
                  className={cn(
                    "border bg-white/[0.02] p-3.5 transition-colors",
                    status === "studying"
                      ? "border-primary/40"
                      : status === "done"
                        ? "border-green-500/30"
                        : "border-white/10",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                          {course.code}
                        </span>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                          · {course.level}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                        {course.title}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        handleCourseStatusChange(course._id, status === "studying" ? null : "studying")
                      }
                      className={cn(
                        "flex min-h-[44px] items-center justify-center gap-1.5 border text-[11px] font-bold uppercase tracking-wider transition-colors",
                        status === "studying"
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/10 text-white/70 active:bg-white/5",
                      )}
                    >
                      {status === "studying" && <CircleDot className="h-3 w-3" />}
                      Studying
                    </button>
                    <button
                      onClick={() =>
                        handleCourseStatusChange(course._id, status === "done" ? null : "done")
                      }
                      className={cn(
                        "flex min-h-[44px] items-center justify-center gap-1.5 border text-[11px] font-bold uppercase tracking-wider transition-colors",
                        status === "done"
                          ? "border-green-500 bg-green-500/15 text-green-400"
                          : "border-white/10 text-white/70 active:bg-white/5",
                      )}
                    >
                      {status === "done" && <Check className="h-3 w-3" />}
                      Done
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="sticky bottom-[68px] z-30 mt-5 -mx-4 border-t border-white/10 bg-black/95 px-4 py-3 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
          <span className={isDirty ? "text-primary" : "text-white/40"}>
            {isDirty ? "Unsaved changes" : "All synced"}
          </span>
          <span className="text-white/40">
            {stats.studying} studying · {stats.done} done
          </span>
        </div>
        <Button
          onClick={handleSave}
          disabled={!user || isSaving || !isDirty}
          className="h-11 w-full font-bold uppercase tracking-widest disabled:opacity-40"
        >
          {isSaving ? "Saving..." : isDirty ? "Save Profile" : "Saved"}
        </Button>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "green";
}) {
  return (
    <div className="text-center">
      <div
        className={cn(
          "inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider",
          tone === "green" ? "text-green-400/80" : "text-white/55",
        )}
      >
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "mt-0.5 font-display text-xl font-black leading-none tabular-nums",
          tone === "green" ? "text-green-400" : "text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}
