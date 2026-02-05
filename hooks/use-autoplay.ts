"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAutoplayOptions {
  onAutoplay: (nextVideoId: string) => void;
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
}: UseAutoplayOptions): UseAutoplayReturn {
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingVideoRef = useRef<string | null>(null);

  const cancelAutoplay = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    pendingVideoRef.current = null;
    setShowCountdown(false);
    setCountdown(10);
  }, [setShowCountdown, setCountdown]);

  const startCountdown = useCallback(
    (nextVideoId: string) => {
      pendingVideoRef.current = nextVideoId;
      setShowCountdown(true);
      setCountdown(10);

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
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [onAutoplay, setShowCountdown, setCountdown]
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
