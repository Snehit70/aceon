"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { VideoPlayerRef } from "@/components/shared/video-player";

/**
 * useVideoProgress - Handles video progress tracking with multiple save strategies.
 *
 * **Save Strategies**:
 * 1. **Throttled (5s)**: During playback, saves every 5 seconds via `onProgressUpdate`
 * 2. **Immediate**: On pause/seek, saves instantly via `onPause`
 * 3. **Beacon**: On page hide/visibility change, uses sendBeacon API for reliability
 *
 * **Why multiple strategies?**
 * - Throttled saves reduce server load during normal playback
 * - Immediate saves catch seek positions that would be missed by throttling
 * - Beacon saves ensure position is captured even on tab close/navigation
 *
 * @param options - Configuration for progress tracking
 * @returns Progress handlers and current time state
 */
export interface UseVideoProgressOptions {
  /** Clerk user ID (undefined if not logged in) */
  userId: string | undefined;
  /** Current video ID (null if no video selected) */
  videoId: string | null;
  /** Convex course ID */
  courseId: Id<"courses">;
  /** Duration of current video in seconds */
  videoDuration: number;
  /** Ref to VideoPlayer for getting current time */
  playerRef: React.RefObject<VideoPlayerRef | null>;
}

export interface UseVideoProgressReturn {
  /** Handler for progress updates during playback (throttled to 5s) */
  handleProgressUpdate: (progress: { played: number; playedSeconds: number }) => void;
  /** Handler for pause events (saves immediately) */
  handlePause: (currentTime: number) => void;
  /** Current playback time in seconds */
  currentTime: number;
  /** Save current position immediately (for use before video switch) */
  saveCurrentPosition: () => void;
}

export function useVideoProgress({
  userId,
  videoId,
  courseId,
  videoDuration,
  playerRef,
}: UseVideoProgressOptions): UseVideoProgressReturn {
  const [currentTime, setCurrentTime] = useState(0);
  const lastProgressUpdate = useRef<number>(0);
  const updateProgress = useMutation(api.progress.updateProgress);

  /**
   * Throttled progress update - called during playback every ~250ms by player,
   * but only saves to server every 5 seconds.
   */
  const handleProgressUpdate = useCallback(
    (progress: { played: number; playedSeconds: number }) => {
      const played =
        typeof progress.played === "number" && !isNaN(progress.played)
          ? progress.played
          : 0;
      const playedSeconds =
        typeof progress.playedSeconds === "number" && !isNaN(progress.playedSeconds)
          ? progress.playedSeconds
          : 0;

      setCurrentTime(playedSeconds);

      if (!userId || !videoId) return;

      const now = Date.now();
      if (now - lastProgressUpdate.current >= 5000) {
        lastProgressUpdate.current = now;

        updateProgress({
          clerkId: userId,
          videoId: videoId as Id<"videos">,
          courseId: courseId,
          progress: played,
          watchedSeconds: Math.floor(playedSeconds),
          lastPosition: playedSeconds,
        }).catch(console.error);
      }
    },
    [userId, videoId, courseId, updateProgress]
  );

  /**
   * Immediate save on pause - catches seek positions that throttling would miss.
   */
  const handlePause = useCallback(
    (pauseTime: number) => {
      if (!userId || !videoId) return;

      updateProgress({
        clerkId: userId,
        videoId: videoId as Id<"videos">,
        courseId: courseId,
        progress: videoDuration > 0 ? pauseTime / videoDuration : 0,
        watchedSeconds: Math.floor(pauseTime),
        lastPosition: pauseTime,
      }).catch(console.error);
    },
    [userId, videoId, courseId, videoDuration, updateProgress]
  );

  /**
   * Save current position immediately - used before switching videos.
   */
  const saveCurrentPosition = useCallback(() => {
    if (!userId || !videoId || !playerRef.current) return;

    const time = playerRef.current.getCurrentTime();
    if (time > 0) {
      updateProgress({
        clerkId: userId,
        videoId: videoId as Id<"videos">,
        courseId: courseId,
        progress: videoDuration > 0 ? time / videoDuration : 0,
        watchedSeconds: Math.floor(time),
        lastPosition: time,
      }).catch(console.error);
    }
  }, [userId, videoId, courseId, videoDuration, playerRef, updateProgress]);

  /**
   * Beacon-based save for page unload/visibility change.
   * Uses sendBeacon API which is more reliable than fetch during unload.
   */
  useEffect(() => {
    const saveViaBeacon = () => {
      if (!userId || !videoId || !playerRef.current) return;

      const time = playerRef.current.getCurrentTime();
      if (time > 0) {
        const blob = new Blob(
          [
            JSON.stringify({
              clerkId: userId,
              videoId: videoId,
              courseId: courseId,
              lastPosition: time,
            }),
          ],
          { type: "application/json" }
        );
        navigator.sendBeacon("/api/save-progress", blob);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        saveViaBeacon();
      }
    };

    const handlePageHide = () => {
      saveViaBeacon();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [userId, videoId, courseId, playerRef]);

  return {
    handleProgressUpdate,
    handlePause,
    currentTime,
    saveCurrentPosition,
  };
}
