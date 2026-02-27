"use client";

import { Play, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerOverlayProps {
  isReady: boolean;
  isPlaying: boolean;
  showPlayButton?: boolean;
  onPlay: () => void;
}

/**
 * PlayerOverlay - Center play button and loading state overlay.
 * 
 * Shows:
 * - Loading spinner when video is buffering
 * - Large play button when video is paused and ready
 */
export default function PlayerOverlay({
  isReady,
  isPlaying,
  showPlayButton = true,
  onPlay,
}: PlayerOverlayProps) {
  // Show loading state when not ready
  if (!isReady) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
    );
  }

  // Show play button when paused
  if (!isPlaying && showPlayButton) {
    return (
      <button
        type="button"
        onClick={onPlay}
        className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 group cursor-pointer"
        aria-label="Play video"
      >
        <div
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all",
            "bg-primary/90 group-hover:bg-primary group-hover:scale-110",
            "shadow-lg shadow-primary/30"
          )}
        >
          <Play className="w-10 h-10 text-white ml-1" fill="white" />
        </div>
      </button>
    );
  }

  return null;
}
