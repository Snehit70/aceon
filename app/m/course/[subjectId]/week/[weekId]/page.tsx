"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { Check, CheckCircle2, ChevronLeft, Play } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MobileWeekSkeleton } from "@/components/mobile/mobile-skeletons";
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

function CircularProgress({ percent, size = 64 }: { percent: number; size?: number }) {
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
        <span className={`font-display text-xs font-black ${done ? "text-green-400" : "text-white"}`}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

export default function MobileWeekPage() {
  const { user } = useUser();
  const params = useParams();
  const [showConfirm, setShowConfirm] = useState(false);
  const subjectId = params.subjectId as Id<"courses">;
  const weekId = params.weekId as Id<"weeks">;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  const markWeekComplete = useMutation(api.progress.markWeekComplete);
  const progressData = useQuery(
    api.progress.getCourseProgress,
    user?.id ? { clerkId: user.id, courseId: subjectId } : "skip",
  );

  if (course === undefined || content === undefined) {
    return <MobileWeekSkeleton />;
  }

  const week = content.find((item) => item._id === weekId);
  if (!course || !week) {
    return (
      <div className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider text-white/55">
        Week not found
      </div>
    );
  }

  const totalSeconds = week.videos.reduce((sum, v) => sum + (v.duration || 0), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  const durationLabel =
    totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`;
  const doneCount = week.videos.filter(
    (v) => progressData?.find((p) => p.videoId === v._id)?.completed,
  ).length;
  const percent =
    week.videos.length > 0 ? Math.round((doneCount / week.videos.length) * 100) : 0;
  const nextVideoIdx = week.videos.findIndex(
    (v) => !progressData?.find((p) => p.videoId === v._id)?.completed,
  );
  const allComplete = nextVideoIdx === -1 && week.videos.length > 0;

  const handleWeekToggle = async () => {
    if (!user) return;
    try {
      const result = await markWeekComplete({
        clerkId: user.id,
        courseId: subjectId,
        weekId,
      });
      toast.success(result.completed ? "Week marked complete" : "Week marked incomplete");
    } catch {
      toast.error("Failed to update week completion");
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="pb-6">
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="border border-white/15 bg-black text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase tracking-wide text-white">
              {allComplete ? `Mark ${week.title} as incomplete?` : `Mark ${week.title} as complete?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              {allComplete
                ? "This will unmark every lecture in this week."
                : "This will mark every lecture in this week as done."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border border-white/20 bg-transparent text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-primary text-white hover:bg-primary/90" onClick={handleWeekToggle}>
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
            className="object-cover object-[center_top] opacity-45 contrast-125"
          />
          <Image
            src="/images/bg-denji-power.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_top] opacity-85 grayscale contrast-125 transition-all duration-700"
            style={{ clipPath: `inset(0 ${Math.min(100, Math.max(0, percent))}% 0 0)` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/40 to-black" />
          <div className="absolute inset-0 bg-[url('/images/noise.svg')] opacity-30 mix-blend-overlay" />
        </div>

        <div className="relative z-10 px-4 pt-4 pb-5">
          <Link
            href={`/m/course/${subjectId}`}
            className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary/90 active:text-primary"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Course
          </Link>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="inline-block border border-primary/60 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-primary">
                {course.code}
              </span>
              <h1 className="mt-2 line-clamp-2 font-display text-[1.85rem] font-black uppercase leading-[0.95] tracking-wide text-white drop-shadow-[2px_2px_0_rgba(0,0,0,0.8)]">
                {week.title}
              </h1>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/65">
                {week.videos.length} lectures · {durationLabel}
              </p>
              {user && week.videos.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                  className="mt-2 h-7 border border-white/15 bg-white/5 px-2.5 text-[10px] font-mono uppercase tracking-wider text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                  {allComplete ? "Mark Week Incomplete" : "Mark Week Done"}
                </Button>
              )}
            </div>
            <div className="shrink-0 text-center">
              <CircularProgress percent={percent} />
              <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-white/55">
                {doneCount}/{week.videos.length} done
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="px-4 pt-5">
        <ul className="space-y-2">
          {week.videos.map((video, idx) => {
            const prog = progressData?.find((p) => p.videoId === video._id);
            const done = !!prog?.completed;
            const watchedSecs = prog?.lastPosition ?? 0;
            const watchedPct =
              !done && video.duration > 0
                ? Math.min(100, Math.round((watchedSecs / video.duration) * 100))
                : 0;
            const started = !done && watchedPct > 0;
            const isNext = idx === nextVideoIdx;
            const mins = Math.floor(video.duration / 60);
            const secs = (video.duration % 60).toString().padStart(2, "0");

            return (
              <li key={video._id}>
                <Link
                  href={`/m/course/${subjectId}/lecture/${video._id}`}
                  className={`group relative flex items-center gap-3 border p-3.5 transition-colors active:bg-primary/10 ${
                    isNext
                      ? "border-primary/60 bg-primary/[0.06]"
                      : done && !allComplete
                        ? "border-white/8 bg-black/40 opacity-70"
                        : "border-white/10 bg-black/40"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center border ${
                      done
                        ? "border-green-500/50 bg-green-500/15 text-green-400"
                        : isNext
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/15 bg-white/[0.04] text-white/70"
                    }`}
                  >
                    {done ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-white/40">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <p className="line-clamp-2 font-display text-[0.95rem] font-bold uppercase leading-tight text-white">
                        {video.title}
                      </p>
                    </div>
                    {started ? (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="relative h-1 flex-1 overflow-hidden bg-white/10">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${watchedPct}%` }}
                          />
                        </div>
                        <span className="shrink-0 font-mono text-[10px] font-bold tabular-nums text-primary">
                          {watchedPct}%
                        </span>
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-white/45">
                          {mins}:{secs}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
                        <span className="text-white/55">
                          {mins}:{secs}
                        </span>
                        <span className="text-white/20">·</span>
                        <span
                          className={
                            done
                              ? "text-green-400"
                              : isNext
                                ? "text-primary"
                                : "text-white/45"
                          }
                        >
                          {done ? "Done" : isNext ? "Next up" : "Pending"}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
