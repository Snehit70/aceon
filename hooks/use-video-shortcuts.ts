"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  enabled?: boolean;
}

// Playback rates: 1x to 2x range for lecture content
// +/= increases rate (clamped at 2x), -/_ decreases rate (clamped at 1x)
// Intentionally starts at 1x - this is the default for new videos
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

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  );
}

export function useVideoShortcuts({ playerRef, containerRef, enabled = true }: UseVideoShortcutsOptions) {
  const spaceHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spaceIsDownRef = useRef(false);
  const spaceDidBoostRef = useRef(false);
  const spacePrevRateRef = useRef(1);
  const SPACE_HOLD_MS = 180;

  useEffect(() => {
    const playerRefCopy = playerRef;
    const containerRefCopy = containerRef;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enabled) return;

      if (isTypingTarget(e.target)) {
        return;
      }

      const player = playerRefCopy.current;
      const container = containerRefCopy?.current;

      switch (e.key) {
        case " ": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          if (e.repeat) return;

          spaceIsDownRef.current = true;
          spaceDidBoostRef.current = false;

          if (spaceHoldTimerRef.current) {
            clearTimeout(spaceHoldTimerRef.current);
          }

          spaceHoldTimerRef.current = setTimeout(() => {
            const activePlayer = playerRefCopy.current;
            if (!activePlayer || !spaceIsDownRef.current) return;
            const currentRate = activePlayer.getPlaybackRate();
            spacePrevRateRef.current = currentRate;
            if (currentRate !== 2) {
              activePlayer.setPlaybackRate(2);
            }
            spaceDidBoostRef.current = true;
          }, SPACE_HOLD_MS);
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
          if (player?.toggleFullscreen) {
            player.toggleFullscreen().catch(console.error);
            break;
          }
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
        case "c":
        case "C": {
          e.preventDefault();
          e.stopPropagation();
          if (!player) return;
          const captionsOn = player.toggleSubtitles();
          if (captionsOn === null) {
            toast("No captions available for this video", { duration: 1500 });
          } else {
            toast.success(`Captions ${captionsOn ? "on" : "off"}`, { duration: 1500 });
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

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!enabled) return;
      if (e.key !== " ") return;
      if (isTypingTarget(e.target)) return;

      const player = playerRefCopy.current;
      if (!player) return;

      e.preventDefault();
      e.stopPropagation();

      spaceIsDownRef.current = false;
      if (spaceHoldTimerRef.current) {
        clearTimeout(spaceHoldTimerRef.current);
        spaceHoldTimerRef.current = null;
      }

      if (spaceDidBoostRef.current) {
        const restoreRate = spacePrevRateRef.current;
        if (player.getPlaybackRate() !== restoreRate) {
          player.setPlaybackRate(restoreRate);
        }
        spaceDidBoostRef.current = false;
      } else {
        if (player.isPlaying()) {
          player.pause();
        } else {
          player.play();
        }
      }
    };

    // Use capture phase to intercept events before any iframe can steal them
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("keyup", handleKeyUp, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      window.removeEventListener("keyup", handleKeyUp, { capture: true });
      if (spaceHoldTimerRef.current) {
        clearTimeout(spaceHoldTimerRef.current);
        spaceHoldTimerRef.current = null;
      }
    };
  }, [playerRef, containerRef, enabled]);
}
