"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAutoplayOptions {
  onAutoplay: (nextVideoId: string) => void;
  /** Seconds to wait before playing the next video. Defaults to 10. */
  countdownSeconds?: number;
}

export interface UseAutoplayReturn {
  showCountdown: boolean;
  countdown: number;
  startCountdown: (nextVideoId: string) => void;
  cancelAutoplay: () => void;
  playNextNow: (nextVideoId: string) => void;
}

export function useAutoplay({
  onAutoplay,
  countdownSeconds = 10,
}: UseAutoplayOptions): UseAutoplayReturn {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingVideoRef = useRef<string | null>(null);

  const cancelAutoplay = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    pendingVideoRef.current = null;
    setShowCountdown(false);
    setCountdown(countdownSeconds);
  }, [setShowCountdown, setCountdown, countdownSeconds]);

  const startCountdown = useCallback(
    (nextVideoId: string) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      pendingVideoRef.current = nextVideoId;
      setShowCountdown(true);
      setCountdown(countdownSeconds);

      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            setShowCountdown(false);
            if (pendingVideoRef.current) {
              onAutoplay(pendingVideoRef.current);
              pendingVideoRef.current = null;
            }
            return countdownSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [onAutoplay, setShowCountdown, setCountdown, countdownSeconds]
  );

  const playNextNow = useCallback(
    (nextVideoId: string) => {
      cancelAutoplay();
      onAutoplay(nextVideoId);
    },
    [cancelAutoplay, onAutoplay]
  );

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  return {
    showCountdown,
    countdown,
    startCountdown,
    cancelAutoplay,
    playNextNow,
  };
}
