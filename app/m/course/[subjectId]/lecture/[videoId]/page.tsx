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

  return (
    <div className="px-2 py-3">
      <Link href={`/m/course/${subjectId}/week/${currentVideo.weekId}`} className="px-1 font-mono text-xs uppercase tracking-wider text-primary">
        Back to {currentVideo.weekTitle}
      </Link>

      <div className="mt-3 overflow-hidden border border-white/10 bg-black">
        <VideoPlayer
          ref={playerRef}
          videoId={currentVideo.youtubeId}
          title={currentVideo.title}
          initialPosition={currentProgress?.lastPosition ?? 0}
          onProgressUpdate={progress.handleProgressUpdate}
          onPause={progress.handlePause}
        />
      </div>

      <div className="px-1 pb-3 pt-4">
        <h1 className="font-display text-3xl font-black uppercase leading-none">{currentVideo.title}</h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-white/70">
          {currentVideo.weekTitle} {"//"} {Math.floor(currentVideo.duration / 60)} min
        </p>

        <Button onClick={onToggleDone} className="mt-4 h-11 w-full font-bold uppercase tracking-widest">
          {currentProgress?.completed ? "Marked Done" : "Mark As Done"}
        </Button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {previousVideo ? (
            <Link
              href={`/m/course/${subjectId}/lecture/${previousVideo._id}`}
              className="flex min-h-[44px] items-center justify-center border border-white/20 text-xs font-bold uppercase tracking-wider text-white/80"
            >
              Prev
            </Link>
          ) : (
            <span className="flex min-h-[44px] items-center justify-center border border-white/10 text-xs font-bold uppercase tracking-wider text-white/30">
              Prev
            </span>
          )}
          {nextVideo ? (
            <Link
              href={`/m/course/${subjectId}/lecture/${nextVideo._id}`}
              className="flex min-h-[44px] items-center justify-center border border-primary/40 bg-primary/10 text-xs font-bold uppercase tracking-wider text-primary"
            >
              Next
            </Link>
          ) : (
            <span className="flex min-h-[44px] items-center justify-center border border-white/10 text-xs font-bold uppercase tracking-wider text-white/30">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
