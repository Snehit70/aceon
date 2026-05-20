"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import VideoPlayer, { VideoPlayerRef } from "@/components/shared/video-player";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { MobilePageHeader } from "@/components/mobile/mobile-page-header";

export default function MobileLecturePage() {
  const { user } = useUser();
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
    return <div className="p-4 text-sm text-white/70">Loading lecture...</div>;
  }

  if (!course || !currentVideo) {
    return <div className="p-4 text-sm text-white/70">Lecture not found.</div>;
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

  const isDone = !!currentProgress?.completed;
  const mins = Math.floor(currentVideo.duration / 60);
  const secs = (currentVideo.duration % 60).toString().padStart(2, "0");

  return (
    <div className="px-4 py-4 pb-28">
      <MobilePageHeader
        backHref={`/m/course/${subjectId}/week/${currentVideo.weekId}`}
        backLabel={currentVideo.weekTitle}
        title={currentVideo.title}
        subtitle={`${currentVideo.weekTitle} · ${mins}:${secs}`}
      />

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

      <div className="mt-5 space-y-3">
        <Button
          onClick={onToggleDone}
          className={`h-12 w-full gap-2 font-bold uppercase tracking-widest ${isDone ? "bg-green-500/15 text-green-400 hover:bg-green-500/20 border border-green-500/40" : ""}`}
        >
          {isDone && <Check className="h-4 w-4" />}
          {isDone ? "Marked Done" : "Mark As Done"}
        </Button>

        <div className="grid grid-cols-2 gap-2.5">
          {previousVideo ? (
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
          ) : (
            <span className="flex min-h-[52px] items-center justify-center border border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/25">
              Start of course
            </span>
          )}
          {nextVideo ? (
            <Link
              href={`/m/course/${subjectId}/lecture/${nextVideo._id}`}
              className="group flex min-h-[52px] items-center gap-2 border border-primary/40 bg-primary/10 px-3 py-2 text-right transition-colors active:bg-primary/20"
            >
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-wider text-primary/70">Next</p>
                <p className="line-clamp-1 font-display text-[11px] font-bold uppercase leading-tight text-primary">
                  {nextVideo.title}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          ) : (
            <span className="flex min-h-[52px] items-center justify-center border border-white/10 bg-white/[0.02] font-mono text-[10px] uppercase tracking-wider text-white/25">
              End of course
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
