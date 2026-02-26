"use client";

import { useEffect, useRef } from "react";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

export function useVideoShortcuts({ playerRef, containerRef }: UseVideoShortcutsOptions) {
  const currentRateIndexRef = useRef(0);
  const hasInitializedRateRef = useRef(false);

  useEffect(() => {
    const playerRefCopy = playerRef;
    const containerRefCopy = containerRef;

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
          // Sync with actual player rate on first press
          if (!hasInitializedRateRef.current && player?.getPlaybackRate) {
            const rate = player.getPlaybackRate();
            const index = PLAYBACK_RATES.indexOf(rate);
            if (index !== -1) {
              currentRateIndexRef.current = index;
            }
            hasInitializedRateRef.current = true;
          }
          currentRateIndexRef.current = (currentRateIndexRef.current + 1) % PLAYBACK_RATES.length;
          const newRateUp = PLAYBACK_RATES[currentRateIndexRef.current];
          if (player?.setPlaybackRate) {
            player.setPlaybackRate(newRateUp);
          }
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          e.stopPropagation();
          // Sync with actual player rate on first press
          if (!hasInitializedRateRef.current && player?.getPlaybackRate) {
            const rate = player.getPlaybackRate();
            const index = PLAYBACK_RATES.indexOf(rate);
            if (index !== -1) {
              currentRateIndexRef.current = index;
            }
            hasInitializedRateRef.current = true;
          }
          currentRateIndexRef.current = (currentRateIndexRef.current - 1 + PLAYBACK_RATES.length) % PLAYBACK_RATES.length;
          const newRateDown = PLAYBACK_RATES[currentRateIndexRef.current];
          if (player?.setPlaybackRate) {
            player.setPlaybackRate(newRateDown);
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerRef, containerRef]);

  return {};
}
