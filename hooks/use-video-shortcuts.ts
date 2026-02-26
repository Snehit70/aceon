"use client";

import { useEffect, useState } from "react";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function useVideoShortcuts({ playerRef, containerRef }: UseVideoShortcutsOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const playerRefCopy = playerRef;
  const containerRefCopy = containerRef;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      const player = playerRefCopy.current;
      const container = containerRefCopy?.current;

      switch (e.key) {
        case " ": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          if (player.isPlaying()) {
            player.pause();
            setIsPlaying(false);
          } else {
            player.play();
            setIsPlaying(true);
          }
          break;
        }
        case "ArrowLeft": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          const currentTime = player.getCurrentTime();
          player.seekTo(Math.max(0, currentTime - 10));
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          player.seekTo(player.getCurrentTime() + 10);
          break;
        }
        case "f":
        case "F": {
          e.preventDefault();
          e.stopPropagation();
          if (!container) return;
          if (!document.fullscreenElement) {
            container.requestFullscreen().catch(console.error);
          } else {
            document.exitFullscreen().catch(console.error);
          }
          break;
        }
        case "m":
        case "M": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          if (player.isMuted()) {
            player.unmute();
            setIsMuted(false);
          } else {
            player.mute();
            setIsMuted(true);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerRefCopy, containerRefCopy]);

  useEffect(() => {
    if (!playerRef.current) return;
    setIsPlaying(playerRef.current.isPlaying());
    setIsMuted(playerRef.current.isMuted());
  }, [playerRef]);

  return {
    isPlaying,
    isMuted,
  };
}
