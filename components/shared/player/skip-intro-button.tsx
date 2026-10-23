"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SkipForward } from "lucide-react";
import { introSkipTarget, isInIntro, shouldAutoSkipIntro } from "@/lib/skip-intro";
import { cn } from "@/lib/utils";

export interface SkipIntroPlayer {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface SkipIntroButtonProps {
  playerRef: React.RefObject<SkipIntroPlayer | null>;
  isReady: boolean;
  introSeconds: number;
  autoSkip: boolean;
  videoId: string;
}

/**
 * SkipIntroButton - Netflix-style skip overlay for the IITM lecture bumper.
 *
 * Visible while playback is inside the configured intro window.
 * Auto skip seeks once per lecture load when the setting is on.
 * Rewinding back into the intro shows the button again without auto-skipping.
 */
export default function SkipIntroButton({
  playerRef,
  isReady,
  introSeconds,
  autoSkip,
  videoId,
}: SkipIntroButtonProps) {
  const [visible, setVisible] = useState(false);
  const didAutoSkipRef = useRef(false);
  const hideUntilLeftIntroRef = useRef(false);

  useEffect(() => {
    didAutoSkipRef.current = false;
    hideUntilLeftIntroRef.current = false;
  }, [videoId]);

  const skip = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    hideUntilLeftIntroRef.current = true;
    player.seekTo(introSkipTarget(introSeconds, player.getDuration()));
    setVisible(false);
  }, [introSeconds, playerRef]);

  useEffect(() => {
    if (!isReady) return;

    const tick = () => {
      const player = playerRef.current;
      if (!player) return;
      const currentTime = player.getCurrentTime();
      const duration = player.getDuration();
      const inIntro = isInIntro(currentTime, introSeconds, duration);

      if (!inIntro) {
        hideUntilLeftIntroRef.current = false;
        setVisible(false);
        return;
      }

      if (
        shouldAutoSkipIntro({
          autoSkip,
          alreadyAutoSkipped: didAutoSkipRef.current,
          currentTime,
          introSeconds,
          duration,
        })
      ) {
        didAutoSkipRef.current = true;
        skip();
        return;
      }

      setVisible(!hideUntilLeftIntroRef.current);
    };

    const timeoutId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 250);
    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [autoSkip, introSeconds, isReady, playerRef, skip, videoId]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        skip();
      }}
      className={cn(
        "absolute right-3 bottom-24 z-50 inline-flex min-h-[44px] items-center gap-2 border-2 border-primary/70 bg-black/70 px-4 sm:bottom-28",
        "font-display text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm",
        "shadow-[3px_3px_0_0_rgba(230,46,45,0.45)]",
        "transition-[border-color,background-color,box-shadow,transform] duration-150",
        "hover:border-primary hover:bg-black/90 hover:shadow-[4px_4px_0_0_#E62E2D]",
        "active:scale-[0.96]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
      aria-label="Skip intro"
    >
      <SkipForward className="h-4 w-4" aria-hidden />
      Skip intro
    </button>
  );
}
