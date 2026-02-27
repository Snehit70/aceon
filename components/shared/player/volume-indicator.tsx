"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, useRef } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface VolumeIndicatorProps {
  volume: number;
  isMuted: boolean;
  /** Trigger to show the indicator - change this value to show */
  trigger: number;
}

/**
 * VolumeIndicator - Modal overlay showing current volume level.
 * 
 * Displays briefly when volume changes (keyboard shortcuts, slider).
 * Shows volume icon + percentage + visual bar.
 */
export default function VolumeIndicator({
  volume,
  isMuted,
  trigger,
}: VolumeIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMountRef = useRef(true);

  // Track trigger changes and show/hide indicator
  useEffect(() => {
    // Skip initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // Show indicator
    setIsVisible(true);

    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Schedule hide
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [trigger]);

  const effectiveVolume = isMuted ? 0 : volume;
  
  const VolumeIcon = isMuted || effectiveVolume === 0
    ? VolumeX
    : effectiveVolume < 50
      ? Volume1
      : Volume2;

  return (
    <div
      className={cn(
        "absolute top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 pointer-events-none",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-black/80 backdrop-blur-sm rounded-lg shadow-xl">
        <VolumeIcon className="w-6 h-6 text-white" />
        
        {/* Volume bar */}
        <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-100 rounded-full"
            style={{ width: `${effectiveVolume}%` }}
          />
        </div>
        
        {/* Percentage */}
        <span className="text-white text-sm font-mono w-10 text-right">
          {Math.round(effectiveVolume)}%
        </span>
      </div>
    </div>
  );
}
