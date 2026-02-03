"use client";

import { Button } from "@/components/ui/button";

interface AutoplayOverlayProps {
  secondsRemaining: number;
  nextVideoTitle: string | undefined;
  onCancel: () => void;
  onPlayNow: () => void;
}

/**
 * AutoplayOverlay - Countdown overlay for auto-advancing to next video.
 * 
 * **Context**: Appears when a video ends, giving users 10 seconds to cancel before
 * automatically playing the next lecture in the sequence.
 * 
 * **User Flow**:
 * 1. Video ends -> Overlay appears with 10s countdown.
 * 2. User can "Cancel" to stay on current video, or "Play Now" to skip countdown.
 * 3. If countdown reaches 0, next video auto-plays.
 * 
 * **Visual**: Dark overlay with circular countdown timer and next video title preview.
 * 
 * @param props - Component props.
 * @param props.secondsRemaining - Current countdown value (0-10).
 * @param props.nextVideoTitle - Title of the upcoming video.
 * @param props.onCancel - Callback to cancel autoplay.
 * @param props.onPlayNow - Callback to immediately play next video.
 * @returns A centered overlay with countdown controls.
 */
export function AutoplayOverlay({ 
  secondsRemaining, 
  nextVideoTitle, 
  onCancel, 
  onPlayNow 
}: AutoplayOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-xl">
      <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Next Lecture</h3>
            <p className="text-white/60 text-sm">Playing in {secondsRemaining} seconds</p>
          </div>

          <div className="relative w-24 h-24 mx-auto">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-primary transition-all duration-1000"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - secondsRemaining / 10)}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{secondsRemaining}</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-white/80 text-sm font-medium line-clamp-2">
              {nextVideoTitle || "Loading..."}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button
              onClick={onPlayNow}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Play Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
