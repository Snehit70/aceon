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
 * - Angular brutal-style design matching Chainsaw Man theme
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
      <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 pointer-events-none">
        {/* Angular loading indicator - skewed rectangle with play icon */}
        <div className="relative animate-pulse">
          <div className="w-14 h-12 sm:w-24 sm:h-20 bg-neutral-900 border-2 border-[#E62E2D]/50 -skew-x-6 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(230,46,45,0.3)] sm:shadow-[4px_4px_0px_0px_rgba(230,46,45,0.3)]">
            <Loader2 className="w-6 h-6 sm:w-10 sm:h-10 text-[#E62E2D] animate-spin skew-x-6" />
          </div>
          {/* Corner accent */}
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#E62E2D]/50" />
          <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E62E2D]/30" />
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
        {/* Angular play button - brutal skewed rectangle, not circle */}
        <div className="relative transition-transform duration-300 group-hover:scale-110">
          <div
            className={cn(
              "w-14 h-12 sm:w-24 sm:h-20 flex items-center justify-center",
              "bg-black/70 backdrop-blur-sm -skew-x-6",
              "border-2 border-[#E62E2D]/50 group-hover:border-[#E62E2D]",
              "transition-[border-color,background-color,box-shadow] duration-300",
              "group-hover:bg-black/90",
              "shadow-[2px_2px_0px_0px_rgba(230,46,45,0.4)] sm:shadow-[4px_4px_0px_0px_rgba(230,46,45,0.4)]",
              "group-hover:shadow-[4px_4px_0px_0px_#E62E2D] sm:group-hover:shadow-[6px_6px_0px_0px_#E62E2D]"
            )}
          >
            <AngularPlayIcon className="w-7 h-7 sm:w-12 sm:h-12 skew-x-6" fill="white" />
          </div>
          {/* Corner accent */}
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 bg-[#E62E2D] transition-all duration-300 group-hover:w-2.5 group-hover:h-2.5 sm:group-hover:w-4 sm:group-hover:h-4" />
          <div className="absolute -bottom-0.5 -left-0.5 sm:-bottom-1 sm:-left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#E62E2D]/50" />
        </div>
      </button>
    );
  }

  return null;
}
