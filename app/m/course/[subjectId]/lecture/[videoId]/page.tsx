"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import VideoPlayer, { VideoPlayerRef } from "@/components/shared/video-player";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronLeft, RotateCcw } from "lucide-react";
import { MobileLectureSkeleton } from "@/components/mobile/mobile-skeletons";

export default function MobileLecturePage() {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const subjectId = params.subjectId as Id<"courses">;
  const videoId = params.videoId as string;

  const course = useQuery(api.courses.get, { id: subjectId });
  const content = useQuery(api.courses.getCourseContent, { courseId: subjectId });
  const progressData = useQuery(
    api.progress.getCourseProgress,
    user?.id ? { clerkId: user.id, courseId: subjectId } : "skip",
  );
  const markComplete = useMutation(api.progress.markComplete);

  const playerRef = useRef<VideoPlayerRef>(null);

  const flatVideos = useMemo(() => {
    if (!content) return [];
    return content.flatMap((week) =>
      week.videos.map((video) => ({ ...video, weekId: week._id, weekTitle: week.title })),
    );
  }, [content]);

  const currentIndex = flatVideos.findIndex((video) => video._id === videoId);
  const currentVideo = currentIndex >= 0 ? flatVideos[currentIndex] : null;
  const previousVideo = currentIndex > 0 ? flatVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < flatVideos.length - 1 ? flatVideos[currentIndex + 1] : null;

  const progress = useVideoProgress({
    userId: user?.id,
    videoId: currentVideo?._id || null,
    courseId: subjectId,
    videoDuration: currentVideo?.duration || 0,
    playerRef,
  });

  if (course === undefined || content === undefined) {
    return <MobileLectureSkeleton />;
  }

  if (!course || !currentVideo) {
    return (
      <div className="px-4 py-10 text-center font-mono text-xs uppercase tracking-wider text-white/55">
        Lecture not found
      </div>
    );
  }

  const currentProgress = progressData?.find((p) => p.videoId === currentVideo._id);

  const onToggleDone = async () => {
    if (!user) return;
    try {
      await markComplete({
        clerkId: user.id,
        courseId: subjectId,
        videoId: currentVideo._id as Id<"videos">,
      });
    } catch {
      toast.error("Failed to update lecture status");
    }
  };

  const onPrimaryAction = async () => {
    if (!user) return;
    try {
      if (!isDone) {
        await markComplete({
          clerkId: user.id,
          courseId: subjectId,
          videoId: currentVideo._id as Id<"videos">,
        });
      }
      if (nextVideo) {
        router.push(`/m/course/${subjectId}/lecture/${nextVideo._id}`);
      }
    } catch {
      toast.error("Failed to update lecture status");
    }
  };

  const isDone = !!currentProgress?.completed;
  const watchedSecs = currentProgress?.lastPosition ?? 0;
  const totalSecs = currentVideo.duration || 0;
  const watchedPct =
    !isDone && totalSecs > 0
      ? Math.min(100, Math.round((watchedSecs / totalSecs) * 100))
      : 0;
  const remainSecs = Math.max(0, totalSecs - watchedSecs);
  const remainMins = Math.floor(remainSecs / 60);
  const remainSecsLeft = (remainSecs % 60).toString().padStart(2, "0");
  const showResume = !isDone && watchedPct > 0;

  const mins = Math.floor(currentVideo.duration / 60);
  const secs = (currentVideo.duration % 60).toString().padStart(2, "0");

  const currentWeek = content.find((w) => w._id === currentVideo.weekId);
  const weekLectureIdx = currentWeek
    ? currentWeek.videos.findIndex((v) => v._id === currentVideo._id)
    : -1;
  const weekTotal = currentWeek?.videos.length ?? 0;

  return (
    <div className="px-4 py-3 pb-6">
      <div className="mb-3">
        <Link
          href={`/m/course/${subjectId}/week/${currentVideo.weekId}`}
          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-wider text-primary/90 active:text-primary"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {currentVideo.weekTitle}
        </Link>
        <h1 className="mt-1.5 line-clamp-2 font-display text-[1.05rem] font-bold uppercase leading-[1.1] tracking-wide text-white">
          {currentVideo.title}
        </h1>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-white/50">
          {currentVideo.weekTitle} · {mins}:{secs}
        </p>
      </div>

      <div className="-mx-1 overflow-hidden border border-white/10 bg-black">
        <VideoPlayer
          ref={playerRef}
          videoId={currentVideo.youtubeId}
          title={currentVideo.title}
          initialPosition={currentProgress?.lastPosition ?? 0}
          onProgressUpdate={progress.handleProgressUpdate}
          onPause={progress.handlePause}
        />
      </div>

      {showResume && (
        <div className="mt-3 border border-primary/30 bg-primary/[0.04] px-3 py-2">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider">
            <span className="text-primary/80">
              Resumed from {watchedPct}%
            </span>
            <span className="text-white/55">
              {remainMins}:{remainSecsLeft} left
            </span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden bg-white/8">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${watchedPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPrimaryAction}
            className="h-12 flex-1 gap-2 font-bold uppercase tracking-widest"
          >
            {isDone && !nextVideo && <Check className="h-4 w-4" />}
            <span className="truncate">
              {!isDone && nextVideo
                ? "Mark Done & Continue"
                : !isDone && !nextVideo
                  ? "Mark As Done"
                  : isDone && nextVideo
                    ? "Next Lecture"
                    : "Marked Done"}
            </span>
            {nextVideo && <ArrowRight className="h-4 w-4 shrink-0" />}
          </Button>
          {isDone && (
            <Button
              onClick={onToggleDone}
              variant="ghost"
              className="h-12 shrink-0 gap-1.5 border border-white/15 px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-white/65 hover:text-white"
              title="Mark as incomplete"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        {previousVideo && (
          <Link
            href={`/m/course/${subjectId}/lecture/${previousVideo._id}`}
            className="group flex min-h-[52px] items-center gap-2 border border-white/15 bg-white/[0.03] px-3 py-2 text-left transition-colors active:bg-white/[0.06]"
          >
            <ChevronLeft className="h-4 w-4 shrink-0 text-white/60 group-active:text-white" />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-wider text-white/45">Prev</p>
              <p className="line-clamp-1 font-display text-[11px] font-bold uppercase leading-tight text-white/85">
                {previousVideo.title}
              </p>
            </div>
          </Link>
        )}

        {weekLectureIdx >= 0 && weekTotal > 0 && (
          <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-wider text-white/40">
            {course.code} · {currentVideo.weekTitle} · Lecture {String(weekLectureIdx + 1).padStart(2, "0")} / {String(weekTotal).padStart(2, "0")}
          </p>
        )}
      </div>
    </div>
  );
}
