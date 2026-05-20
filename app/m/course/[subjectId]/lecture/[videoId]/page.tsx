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

  return (
    <div className="px-2 py-3 pb-24">
      <MobilePageHeader
        backHref={`/m/course/${subjectId}/week/${currentVideo.weekId}`}
        backLabel={`Back to ${currentVideo.weekTitle}`}
        title={currentVideo.title}
        subtitle={`${currentVideo.weekTitle} // ${Math.floor(currentVideo.duration / 60)} min`}
      />

      <div className="overflow-hidden border border-white/10 bg-black">
        <VideoPlayer
          ref={playerRef}
          videoId={currentVideo.youtubeId}
          title={currentVideo.title}
          initialPosition={currentProgress?.lastPosition ?? 0}
          onProgressUpdate={progress.handleProgressUpdate}
          onPause={progress.handlePause}
        />
      </div>

      <div className="px-1 pb-3 pt-5">

        <Button onClick={onToggleDone} className="mt-4 h-12 w-full font-bold uppercase tracking-widest">
          {currentProgress?.completed ? "Marked Done" : "Mark As Done"}
        </Button>

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {previousVideo ? (
            <Link
              href={`/m/course/${subjectId}/lecture/${previousVideo._id}`}
              className="flex min-h-[48px] items-center justify-center border border-white/20 bg-white/5 text-xs font-bold uppercase tracking-wider text-white/90"
            >
              Previous
            </Link>
          ) : (
            <span className="flex min-h-[48px] items-center justify-center border border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/30">
              Previous
            </span>
          )}
          {nextVideo ? (
            <Link
              href={`/m/course/${subjectId}/lecture/${nextVideo._id}`}
              className="flex min-h-[48px] items-center justify-center border border-primary/40 bg-primary/12 text-xs font-bold uppercase tracking-wider text-primary"
            >
              Next
            </Link>
          ) : (
            <span className="flex min-h-[48px] items-center justify-center border border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-white/30">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
