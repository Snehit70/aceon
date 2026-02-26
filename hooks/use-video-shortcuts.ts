"use client";

import { useEffect, useState, useRef } from "react";
import type { VideoPlayerRef } from "@/components/shared/video-player";

interface UseVideoShortcutsOptions {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

export function useVideoShortcuts({ playerRef, containerRef }: UseVideoShortcutsOptions) {
  // Note: These state variables track keyboard-initiated actions only.
  // They are not required for functionality but may be used by callers for UI feedback.
  // We don't sync with YouTube's player state because:
  // 1. YouTube already shows playback rate in its UI
  // 2. Users can change rate via YouTube's gear menu - we don't need to track that
  // 3. Our +/- keys cycle through a known set of rates starting from 1
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  
  const currentRateIndexRef = useRef(0);

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
            setIsMuted(false);
          } else {
            player.mute();
            setIsMuted(true);
          }
          break;
        }
        case "+":
        case "=": {
          e.preventDefault();
          e.stopPropagation();
          // Cycle playback rate up
          currentRateIndexRef.current = (currentRateIndexRef.current + 1) % PLAYBACK_RATES.length;
          const newRateUp = PLAYBACK_RATES[currentRateIndexRef.current];
          if (player?.setPlaybackRate) {
            player.setPlaybackRate(newRateUp);
          }
          setPlaybackRateState(newRateUp);
          break;
        }
        case "-":
        case "_": {
          e.preventDefault();
          e.stopPropagation();
          // Cycle playback rate down
          currentRateIndexRef.current = (currentRateIndexRef.current - 1 + PLAYBACK_RATES.length) % PLAYBACK_RATES.length;
          const newRateDown = PLAYBACK_RATES[currentRateIndexRef.current];
          if (player?.setPlaybackRate) {
            player.setPlaybackRate(newRateDown);
          }
          setPlaybackRateState(newRateDown);
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playerRef, containerRef]);

  useEffect(() => {
    if (!playerRef.current) return;
    setIsPlaying(playerRef.current.isPlaying());
    setIsMuted(playerRef.current.isMuted());
  }, [playerRef]);

  return {
    isPlaying,
    isMuted,
    playbackRate,
  };
}
