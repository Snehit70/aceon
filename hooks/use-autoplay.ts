"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "./use-settings";

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
  const { autoplayEnabled, autoplayDelay } = useSettings();
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState<number>(autoplayDelay);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pendingVideoRef = useRef<string | null>(null);

  const cancelAutoplay = useCallback(() => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    pendingVideoRef.current = null;
    setShowCountdown(false);
    setCountdown(autoplayDelay);
  }, [autoplayDelay, setShowCountdown, setCountdown]);

  const startCountdown = useCallback(
    (nextVideoId: string) => {
      // Don't start if autoplay is disabled
      if (!autoplayEnabled) {
        onAutoplay(nextVideoId);
        return;
      }

      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      pendingVideoRef.current = nextVideoId;
      setShowCountdown(true);
      setCountdown(autoplayDelay);

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
            return autoplayDelay;
          }
          return prev - 1;
        });
      }, 1000);
    },
    [onAutoplay, autoplayEnabled, autoplayDelay, setShowCountdown, setCountdown]
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