"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

/**
 * Format seconds to MM:SS format for tooltip
 */
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * ProgressBar - Seekable progress bar with hover preview.
 * 
 * Features:
 * - Blood Red (#E62E2D) progress fill
 * - Acid Green (#2BFF00) hover indicator
 * - Time tooltip on hover
 * - Click and drag to seek
 */
export default function ProgressBar({
  currentTime,
  duration,
  onSeek,
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration === 0) return 0;
      const rect = barRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return position * duration;
    },
    [duration]
  );

  const updateHoverPosition = useCallback(
    (clientX: number) => {
      if (!barRef.current || duration === 0) return;
      const rect = barRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      setHoverTime(position * duration);
      setHoverPosition(position * 100);
    },
    [duration]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      updateHoverPosition(e.clientX);
    },
    [updateHoverPosition]
  );

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setHoverTime(null);
    }
  }, [isDragging]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      const time = getTimeFromPosition(e.clientX);
      onSeek(time);
    },
    [getTimeFromPosition, onSeek]
  );

  // Handle dragging - seek only on pointerup for performance
  // Visual preview updates during drag, actual seek happens on release
  // This prevents overwhelming the YouTube API with rapid seek calls
  const dragTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const time = getTimeFromPosition(e.clientX);
      dragTimeRef.current = time; // Store for mouseup, don't seek yet
      updateHoverPosition(e.clientX);
    };

    const handleGlobalPointerUp = () => {
      // Seek to final position only on mouse release
      if (dragTimeRef.current !== null) {
        onSeek(dragTimeRef.current);
        dragTimeRef.current = null;
      }
      setIsDragging(false);
      setHoverTime(null);
    };

    document.addEventListener("pointermove", handleGlobalPointerMove);
    document.addEventListener("pointerup", handleGlobalPointerUp);
    document.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
      document.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [isDragging, getTimeFromPosition, onSeek, updateHoverPosition]);

  return (
    <div
      ref={barRef}
      onPointerMove={handlePointerMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      className="relative h-2 sm:h-1.5 bg-white/20 cursor-pointer group touch-none"
      role="slider"
      aria-label="Video progress"
      aria-valuenow={currentTime}
      aria-valuemin={0}
      aria-valuemax={duration}
    >
      {/* Progress fill - Blood Red */}
      <div
        className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-75"
        style={{ width: `${progress}%` }}
      />

      {/* Hover preview - Acid Green */}
      {hoverTime !== null && (
        <div
          className="absolute inset-y-0 left-0 bg-accent/30"
          style={{ width: `${hoverPosition}%` }}
        />
      )}

      {/* Scrubber handle */}
      <div
        className={cn(
          "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-primary shadow-lg transition-transform",
          "opacity-100 scale-100 sm:opacity-0 sm:group-hover:opacity-100 sm:scale-0 sm:group-hover:scale-100",
          isDragging && "opacity-100 scale-100"
        )}
        style={{ left: `${progress}%` }}
      />

      {/* Time tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute -top-8 px-2 py-1 bg-black/90 text-white text-xs font-mono rounded transform -translate-x-1/2 pointer-events-none"
          style={{ left: `${hoverPosition}%` }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
}
