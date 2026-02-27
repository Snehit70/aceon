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

  const handleSliderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      const newVolume = getVolumeFromPosition(e.clientX);
      onVolumeChange(newVolume);
    },
    [getVolumeFromPosition, onVolumeChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const newVolume = getVolumeFromPosition(e.clientX);
        onVolumeChange(newVolume);
      }
    },
    [isDragging, getVolumeFromPosition, onVolumeChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setIsHovered(false);
    }
  }, [isDragging]);

  // Global mouse handlers for dragging
  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newVolume = getVolumeFromPosition(e.clientX);
        onVolumeChange(newVolume);
      }
    },
    [isDragging, getVolumeFromPosition, onVolumeChange]
  );

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global listeners when dragging
  useEffect(() => {
    if (!isDragging) return;
    
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

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
          isHovered || isDragging ? "w-20 opacity-100" : "w-0 opacity-0"
        )}
      >
        <div
          ref={sliderRef}
          onMouseDown={handleSliderMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="relative h-1.5 bg-white/20 cursor-pointer rounded-full"
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
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg"
            style={{ left: `calc(${effectiveVolume}% - 6px)` }}
          />
        </div>
      </div>
    </div>
  );
}
