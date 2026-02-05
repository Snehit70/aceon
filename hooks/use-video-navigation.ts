"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { VideoPlayerRef } from "@/components/shared/video-player";

type Week = {
  _id: Id<"weeks">;
  title: string;
  order: number;
  videos: Array<{
    _id: Id<"videos">;
    title: string;
    youtubeId: string;
    duration: number;
    order: number;
  }>;
};

type VideoWithWeek = {
  _id: Id<"videos">;
  title: string;
  youtubeId: string;
  duration: number;
  order: number;
  weekTitle: string;
  weekOrder: number;
};

export interface UseVideoNavigationOptions {
  content: Week[] | undefined;
  progressData: Doc<"videoProgress">[] | null | undefined;
  videoFromUrl: string | null;
  courseId: Id<"courses">;
  playerRef: React.RefObject<VideoPlayerRef | null>;
  onSaveProgress: () => void;
  onCancelAutoplay: () => void;
}

export interface UseVideoNavigationReturn {
  activeVideoId: string | null;
  currentVideo: VideoWithWeek | null;
  findNextVideo: () => string | null;
  handleVideoSelect: (id: string) => void;
  isCurrentVideoCompleted: boolean | undefined;
}

export function useVideoNavigation({
  content,
  progressData,
  videoFromUrl,
  courseId,
  playerRef,
  onSaveProgress,
  onCancelAutoplay,
}: UseVideoNavigationOptions): UseVideoNavigationReturn {
  const router = useRouter();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const videoExistsInCourse = useCallback(
    (videoId: string | null) => {
      if (!content || !videoId) return false;
      return content.some((week) => week.videos.some((v) => v._id === videoId));
    },
    [content]
  );

  let activeVideoId = selectedVideoId;
  if (!activeVideoId && content && content.length > 0) {
    if (videoFromUrl && videoExistsInCourse(videoFromUrl)) {
      activeVideoId = videoFromUrl;
    } else {
      let firstIncompleteId: string | null = null;
      let firstVideoId: string | null = null;

      for (const week of content) {
        for (const video of week.videos) {
          if (!firstVideoId) {
            firstVideoId = video._id;
          }
          const progress = progressData?.find((p) => p.videoId === video._id);
          if (!progress?.completed && !firstIncompleteId) {
            firstIncompleteId = video._id;
            break;
          }
        }
        if (firstIncompleteId) break;
      }

      activeVideoId = firstIncompleteId || firstVideoId;
    }
  }

  const isCurrentVideoCompleted = progressData?.find(
    (p) => p.videoId === activeVideoId
  )?.completed;

  const findVideo = useCallback(
    (id: string | null): VideoWithWeek | null => {
      if (!content || !id) return null;
      for (const week of content) {
        const video = week.videos.find((v) => v._id === id);
        if (video) return { ...video, weekTitle: week.title, weekOrder: week.order };
      }
      return null;
    },
    [content]
  );

  const currentVideo = findVideo(activeVideoId);

  const findNextVideo = useCallback(() => {
    if (!content || !activeVideoId) return null;

    let foundCurrent = false;
    for (const week of content) {
      for (let i = 0; i < week.videos.length; i++) {
        if (foundCurrent) {
          return week.videos[i]._id;
        }
        if (week.videos[i]._id === activeVideoId) {
          foundCurrent = true;
          if (i < week.videos.length - 1) {
            return week.videos[i + 1]._id;
          }
        }
      }
    }
    return null;
  }, [content, activeVideoId]);

  const updateUrlWithVideo = useCallback(
    (videoId: string) => {
      router.replace(`/lectures/${courseId}?v=${videoId}`, { scroll: false });
    },
    [router, courseId]
  );

  const handleVideoSelect = useCallback(
    (id: string) => {
      onSaveProgress();
      onCancelAutoplay();
      setSelectedVideoId(id);
      updateUrlWithVideo(id);

      const savedProgress = progressData?.find(
        (p: Doc<"videoProgress">) => p.videoId === id
      );
      if (savedProgress && savedProgress.lastPosition > 0) {
        setTimeout(() => {
          if (playerRef.current) {
            playerRef.current.seekTo(savedProgress.lastPosition);
          }
        }, 500);
      }
    },
    [onSaveProgress, onCancelAutoplay, updateUrlWithVideo, progressData, playerRef]
  );

  useEffect(() => {
    if (activeVideoId && activeVideoId !== videoFromUrl) {
      router.replace(`/lectures/${courseId}?v=${activeVideoId}`, { scroll: false });
    }
  }, [activeVideoId, videoFromUrl, router, courseId]);

  return {
    activeVideoId,
    currentVideo,
    findNextVideo,
    handleVideoSelect,
    isCurrentVideoCompleted,
  };
}
