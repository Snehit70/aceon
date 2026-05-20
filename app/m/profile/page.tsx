"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const levels = ["foundation", "diploma", "degree"] as const;

type Level = (typeof levels)[number];

const getLevelOrder = (lvl: string) => {
  if (lvl === "foundation") return 1;
  if (lvl === "diploma") return 2;
  if (lvl === "degree") return 3;
  return 0;
};

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
  const [initialCompletedIds, setInitialCompletedIds] = useState<Id<"courses">[]>([]);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setLevel(profile.level as Level);
      setStudyingCourseIds(profile.enrolledCourseIds || []);
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

  const filteredCourses = courses?.filter((course) => (showAllLevels ? true : course.level === level));

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

      toast.success("Profile updated");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-3 py-4 pb-24">
      <header className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary/80">{"// Operator"}</p>
        <h1 className="mt-1.5 font-display text-[1.65rem] font-black uppercase leading-none tracking-wide text-white">
          Profile
        </h1>
      </header>

      <div className="mb-4 border border-white/10 bg-white/5 p-3.5">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-white/60">Threat level</p>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={cn(
                "min-h-[44px] border text-xs font-bold uppercase tracking-wide",
                level === lvl ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/80",
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-white/70">Course status</p>
        <button onClick={() => setShowAllLevels((p) => !p)} className="font-mono text-xs uppercase tracking-wider text-primary">
          {showAllLevels ? "Show level only" : "Show all"}
        </button>
      </div>

      <div className="space-y-2.5">
        {filteredCourses?.map((course) => {
          const status = getCourseStatus(course._id);
          return (
            <div key={course._id} className="border border-white/10 bg-white/5 p-3.5">
              <p className="line-clamp-2 font-display text-base font-bold uppercase">{course.title}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/60">{course.code}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-none border border-white/10 p-1">
                <button
                  onClick={() => handleCourseStatusChange(course._id, status === "studying" ? null : "studying")}
                  className={cn(
                    "min-h-[44px] border text-[10px] font-bold uppercase tracking-wider",
                    status === "studying" ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-white/70",
                  )}
                >
                  Studying
                </button>
                <button
                  onClick={() => handleCourseStatusChange(course._id, status === "done" ? null : "done")}
                  className={cn(
                    "min-h-[44px] border text-[10px] font-bold uppercase tracking-wider",
                    status === "done" ? "border-green-500 bg-green-500/15 text-green-400" : "border-white/10 text-white/70",
                  )}
                >
                  Done
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-[68px] mt-4 border border-white/10 bg-black/95 p-2 backdrop-blur-sm">
        <Button onClick={handleSave} disabled={!user || isSaving} className="h-11 w-full uppercase font-bold tracking-widest">
          {isSaving ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
