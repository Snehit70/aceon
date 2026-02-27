"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PlaybackSpeedProps {
  rate: number;
  onRateChange: (rate: number) => void;
}

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/**
 * PlaybackSpeed - Playback speed selector dropdown.
 * 
 * Features:
 * - Shows current speed as button
 * - Click to open dropdown
 * - Acid Green highlight on current selection
 */
export default function PlaybackSpeed({
  rate,
  onRateChange,
}: PlaybackSpeedProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleRateSelect = (newRate: number) => {
    onRateChange(newRate);
    setIsOpen(false);
  };

  const formatRate = (r: number) => {
    if (r === 1) return "1x";
    return `${r}x`;
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Speed button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "min-h-[44px] px-3 flex items-center justify-center rounded-sm",
          "hover:bg-white/10 transition-colors",
          "text-white text-sm font-medium"
        )}
        aria-label="Playback speed"
        aria-expanded={isOpen}
      >
        {formatRate(rate)}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-sm border border-white/10 rounded-sm overflow-hidden shadow-xl">
          {PLAYBACK_RATES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRateSelect(r)}
              className={cn(
                "w-full px-4 py-2 text-left text-sm transition-colors",
                r === rate
                  ? "bg-accent/20 text-accent font-medium"
                  : "text-white hover:bg-white/10"
              )}
            >
              {formatRate(r)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
