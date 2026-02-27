"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  enabled?: boolean;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

/**
 * Find the index of the current rate in PLAYBACK_RATES array.
 * If rate is not in array (e.g., user set via YouTube UI), find closest.
 */
function findRateIndex(rate: number): number {
  const exactIndex = PLAYBACK_RATES.indexOf(rate);
  if (exactIndex !== -1) return exactIndex;
  
  // Find closest rate
  let closestIndex = 0;
  let closestDiff = Math.abs(PLAYBACK_RATES[0] - rate);
  for (let i = 1; i < PLAYBACK_RATES.length; i++) {
    const diff = Math.abs(PLAYBACK_RATES[i] - rate);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

export function useVideoShortcuts({ playerRef, containerRef, enabled = true }: UseVideoShortcutsOptions) {

  useEffect(() => {
    const playerRefCopy = playerRef;
    const containerRefCopy = containerRef;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;

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
          } else {
            player.play();
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
        case "ArrowUp": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          const volUp = Math.min(100, player.getVolume() + 10);
          player.setVolume(volUp);
          break;
        }
        case "ArrowDown": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          const volDown = Math.max(0, player.getVolume() - 10);
          player.setVolume(volDown);
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
          } else {
            player.mute();
          }
          break;
        }
        case "+":
        case "=": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          
          // Always read actual rate from player (handles YouTube UI changes, video switches)
          const currentRate = player.getPlaybackRate();
          const currentIndex = findRateIndex(currentRate);
          const nextIndex = Math.min(currentIndex + 1, PLAYBACK_RATES.length - 1);
          const newRate = PLAYBACK_RATES[nextIndex];
          
          if (newRate !== currentRate) {
            player.setPlaybackRate(newRate);
            toast.success(`Playback speed: ${newRate}x`, { duration: 1500 });
          }
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          
          // Always read actual rate from player (handles YouTube UI changes, video switches)
          const currentRate = player.getPlaybackRate();
          const currentIndex = findRateIndex(currentRate);
          const nextIndex = Math.max(currentIndex - 1, 0);
          const newRate = PLAYBACK_RATES[nextIndex];
          
          if (newRate !== currentRate) {
            player.setPlaybackRate(newRate);
            toast.success(`Playback speed: ${newRate}x`, { duration: 1500 });
          }
          break;
        }
      }
    };

    // Use capture phase to intercept events before any iframe can steal them
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [playerRef, containerRef, enabled]);
}
