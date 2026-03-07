"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AngularPlayIcon } from "./icons";

interface PlayerOverlayProps {
  isReady: boolean;
  isPlaying: boolean;
  isBuffering?: boolean;
  showPlayButton?: boolean;
  onPlay: () => void;
}

/**
 * PlayerOverlay - Center play button and loading state overlay.
 * 
 * Shows:
 * - Loading spinner when video is buffering
 * - Large play button when video is paused and ready
 * - Angular brutal-style icons matching Chainsaw Man theme
 */
export default function PlayerOverlay({
  isReady,
  isPlaying,
  isBuffering = false,
  showPlayButton = true,
  onPlay,
}: PlayerOverlayProps) {
  if (!isReady || isBuffering) {
    return (
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 pointer-events-none">
        <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-[#E62E2D]/30">
          <Loader2 className="w-8 h-8 text-[#E62E2D] animate-spin" />
        </div>
      </div>
    );
  }

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
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
            "bg-black/60 border-2 border-[#E62E2D]/50 backdrop-blur-sm",
            "group-hover:scale-110 group-hover:border-[#E62E2D] group-hover:bg-black/80",
            "shadow-[0_0_20px_rgba(230,46,45,0.3)] group-hover:shadow-[0_0_30px_rgba(230,46,45,0.5)]"
          )}
        >
          <AngularPlayIcon className="w-10 h-10" fill="#E62E2D" />
        </div>
      </button>
    );
  }

  return null;
}
