"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function useVideoShortcuts({ playerRef, containerRef }: UseVideoShortcutsOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isFullscreenRef = useRef(false);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [playerRef, isPlaying]);

  const seekBackward = useCallback((seconds: number = 10) => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, currentTime - seconds));
  }, [playerRef]);

  const seekForward = useCallback((seconds: number = 10) => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + seconds);
  }, [playerRef]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef?.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        isFullscreenRef.current = true;
      } else {
        await document.exitFullscreen();
        isFullscreenRef.current = false;
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  }, [containerRef]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          e.stopPropagation();
          togglePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          seekBackward();
          break;
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          seekForward();
          break;
        case "f":
        case "F":
          e.preventDefault();
          e.stopPropagation();
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, seekBackward, seekForward, toggleFullscreen]);

  // Sync isPlaying state from player
  useEffect(() => {
    if (!playerRef.current) return;
    setIsPlaying(playerRef.current.isPlaying());
  }, [playerRef]);

  return {
    isPlaying,
    togglePlayPause,
    seekBackward,
    seekForward,
    toggleFullscreen,
  };
}
