"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MobileCourseSkeleton } from "@/components/mobile/mobile-skeletons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmAction =
  | { type: "course"; markAsComplete: boolean }
  | { type: "week"; weekId: Id<"weeks">; weekTitle: string; markAsComplete: boolean };

function CircularProgress({ percent, size = 72 }: { percent: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  const done = percent >= 100;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/15"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={`${done ? "text-green-400" : "text-primary"} transition-all duration-700`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-display text-sm font-black ${done ? "text-green-400" : "text-white"}`}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function MobileCoursePage() {
  const { user } = useUser();
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  const markWeekComplete = useMutation(api.progress.markWeekComplete);
  const markCourseComplete = useMutation(api.progress.markCourseComplete);
  const progressData = useQuery(
    api.progress.getCourseProgress,
    user?.id ? { clerkId: user.id, courseId: subjectId } : "skip",
  );

  if (course === undefined || content === undefined) {
    return <MobileCourseSkeleton />;
  }

  if (!course) {
    return (
      <div className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider text-white/55">
        Course not found
      </div>
    );
  }

  const totalVideos = content.reduce((acc, week) => acc + week.videos.length, 0);
  const totalSeconds = content.reduce(
    (acc, week) => acc + week.videos.reduce((sum, v) => sum + (v.duration || 0), 0),
    0,
  );
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  const durationLabel =
    totalHours >= 10
      ? `${totalHours}h`
      : totalHours > 0
        ? `${totalHours}h ${totalMins}m`
        : `${totalMins}m`;
  const completed = progressData?.filter((p) => p.completed).length || 0;
  const percent = totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0;

  const weekStats = content.map((week) => {
    const total = week.videos.length;
    const done = week.videos.filter(
      (v) => progressData?.find((p) => p.videoId === v._id)?.completed,
    ).length;
    return { total, done, complete: total > 0 && done === total };
  });
  const nextWeekIdx = weekStats.findIndex((w) => !w.complete && w.total > 0);
  const allComplete = nextWeekIdx === -1;
  const isCourseComplete = totalVideos > 0 && completed === totalVideos;

  const handleConfirmAction = async () => {
    if (!user || !confirmAction) return;
    try {
      if (confirmAction.type === "course") {
        const result = await markCourseComplete({
          clerkId: user.id,
          courseId: subjectId,
        });
        toast.success(result.completed ? "Course marked complete" : "Course marked incomplete");
      } else {
        const result = await markWeekComplete({
          clerkId: user.id,
          courseId: subjectId,
          weekId: confirmAction.weekId,
        });
        toast.success(result.completed ? "Week marked complete" : "Week marked incomplete");
      }
    } catch {
      toast.error("Failed to update completion status");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="pb-6">
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="border border-white/15 bg-black text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-wide text-white">
              {!confirmAction
                ? ""
                : confirmAction.type === "course"
                ? confirmAction.markAsComplete
                  ? "Mark full course as complete?"
                  : "Mark full course as incomplete?"
                : confirmAction.markAsComplete
                  ? `Mark ${confirmAction.weekTitle} as complete?`
                  : `Mark ${confirmAction.weekTitle} as incomplete?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {!confirmAction
                ? ""
                : confirmAction.type === "course"
                ? confirmAction.markAsComplete
                  ? "This marks every lecture in this course as done."
                  : "This unmarks every lecture in this course."
                : confirmAction.markAsComplete
                  ? "This marks every lecture in this week as done."
                  : "This unmarks every lecture in this week."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-white/20 bg-transparent text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-primary text-white hover:bg-primary/90" onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/bg-denji-power.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_top] opacity-60 contrast-125"
          />
          <Image
            src="/images/bg-denji-power.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_top] opacity-60 grayscale contrast-125 transition-all duration-700"
            style={{ clipPath: `inset(0 ${Math.min(100, Math.max(0, percent))}% 0 0)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/40 to-black" />
          <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-30 mix-blend-overlay" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-5">
          <Link
            href="/m/lectures?tab=enrolled"
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary/90 active:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Missions
          </Link>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-block border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                {course.code}
              </span>
              <h1 className="mt-2 font-display text-[1.85rem] font-black uppercase leading-[0.95] tracking-wide text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                {course.title}
              </h1>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/65">
                {totalVideos} lectures · {durationLabel}
              </p>
              {user && totalVideos > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmAction({ type: "course", markAsComplete: !isCourseComplete })}
                  className="mt-2 h-7 border border-white/15 bg-white/5 px-2.5 text-[10px] font-mono uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  {isCourseComplete ? "Mark Course Incomplete" : "Mark Course Done"}
                </Button>
              )}
            </div>
            <div className="shrink-0 text-center">
              <CircularProgress percent={percent} />
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-white/55">
                {completed}/{totalVideos} done
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pt-5">
        <ul className="space-y-2">
          {content.map((week, idx) => {
            const stats = weekStats[idx];
            const isNext = idx === nextWeekIdx;
            const isDone = stats.complete;

            return (
              <li key={week._id}>
                <Link
                  href={`/m/course/${subjectId}/week/${week._id}`}
                  className={`group relative flex items-center gap-3 border p-3.5 transition-colors active:bg-primary/10 ${
                    isNext
                      ? "border-primary/60 bg-primary/[0.06]"
                      : isDone && !allComplete
                        ? "border-white/8 bg-black/40 opacity-70"
                        : "border-white/10 bg-black/40"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border font-mono text-[11px] font-black ${
                      isDone
                        ? "border-green-500/50 bg-green-500/15 text-green-400"
                        : isNext
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/15 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                        {week.title}
                      </p>
                      {isNext && (
                        <span className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-wider text-primary">
                          {"// Next"}
                        </span>
                      )}
                    </div>

                    {stats.total > 0 ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex flex-1 items-center gap-[3px]">
                          {Array.from({ length: stats.total }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 flex-1 ${
                                i < stats.done
                                  ? isDone
                                    ? "bg-green-400"
                                    : "bg-primary"
                                  : "bg-white/12"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`shrink-0 font-mono text-[10px] tabular-nums ${
                            isDone ? "text-green-400" : "text-white/55"
                          }`}
                        >
                          {stats.done}/{stats.total}
                        </span>
                      </div>
                    ) : (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/40">
                        No lectures
                      </p>
                    )}
                  </div>

                  <ChevronRight
                    className={`h-4 w-4 shrink-0 ${isNext ? "text-primary" : "text-white/30"}`}
                  />
                </Link>
                {user && stats.total > 0 && (
                  <div className="mt-1.5 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setConfirmAction({
                          type: "week",
                          weekId: week._id as Id<"weeks">,
                          weekTitle: week.title,
                          markAsComplete: !stats.complete,
                        })
                      }
                      className="h-7 border border-white/10 px-2 text-[10px] font-mono uppercase tracking-wider text-white/70 hover:bg-white/10 hover:text-white"
                    >
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                      {stats.complete ? "Mark Incomplete" : "Mark Week Done"}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
