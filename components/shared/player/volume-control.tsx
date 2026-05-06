"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
}

/**
 * VolumeControl - Volume slider with mute toggle.
 * 
 * Features:
 * - Hover to expand slider
 * - Click icon to mute/unmute
 * - Blood Red slider fill
 */
export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
}: VolumeControlProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const effectiveVolume = isMuted ? 0 : volume;

  const getVolumeFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return 0;
    const rect = sliderRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
  }, []);

  const handleSliderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      const newVolume = getVolumeFromPosition(e.clientX);
      onVolumeChange(newVolume);
    },
    [getVolumeFromPosition, onVolumeChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isDragging) {
        const newVolume = getVolumeFromPosition(e.clientX);
        onVolumeChange(newVolume);
      }
    },
    [isDragging, getVolumeFromPosition, onVolumeChange]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setIsHovered(false);
    }
  }, [isDragging]);

  // Global pointer handlers for dragging
  const handleGlobalPointerMove = useCallback(
    (e: PointerEvent) => {
      if (isDragging) {
        const newVolume = getVolumeFromPosition(e.clientX);
        onVolumeChange(newVolume);
      }
    },
    [isDragging, getVolumeFromPosition, onVolumeChange]
  );

  const handleGlobalPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global listeners when dragging
  useEffect(() => {
    if (!isDragging) return;
    
    document.addEventListener("pointermove", handleGlobalPointerMove);
    document.addEventListener("pointerup", handleGlobalPointerUp);
    document.addEventListener("pointercancel", handleGlobalPointerUp);

    return () => {
      document.removeEventListener("pointermove", handleGlobalPointerMove);
      document.removeEventListener("pointerup", handleGlobalPointerUp);
      document.removeEventListener("pointercancel", handleGlobalPointerUp);
    };
  }, [isDragging, handleGlobalPointerMove, handleGlobalPointerUp]);

  const VolumeIcon = isMuted || effectiveVolume === 0 
    ? VolumeX 
    : effectiveVolume < 50 
      ? Volume1 
      : Volume2;

  return (
    <div
      className="flex items-center gap-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Mute toggle button */}
      <button
        type="button"
        onClick={onMuteToggle}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        <VolumeIcon className="w-5 h-5 text-white" />
      </button>

      {/* Volume slider - expands on hover */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isHovered || isDragging ? "w-16 sm:w-20 opacity-100" : "w-0 opacity-0"
        )}
      >
        <div
          ref={sliderRef}
          onPointerDown={handleSliderPointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative h-2 sm:h-1.5 bg-white/20 cursor-pointer rounded-full touch-none"
          role="slider"
          aria-label="Volume"
          aria-valuenow={effectiveVolume}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Volume fill - Blood Red */}
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full"
            style={{ width: `${effectiveVolume}%` }}
          />

          {/* Scrubber handle */}
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-3 sm:h-3 rounded-full bg-white shadow-lg"
            style={{ left: `${effectiveVolume}%` }}
          />
        </div>
      </div>
    </div>
  );
}
