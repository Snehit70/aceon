"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import LandscapeHint from "./landscape-hint";

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
  onProgressUpdate?: (progress: { played: number; playedSeconds: number }) => void;
  initialPosition?: number;
  theaterMode?: boolean;
  onTheaterModeChange?: (enabled: boolean) => void;
}

// Track if API script is loaded
let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT) {
      resolve();
      return;
    }

    apiReadyCallbacks.push(resolve);

    if (apiLoading) return;
    apiLoading = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };
  });
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onEnded, onProgressUpdate, initialPosition = 0, theaterMode = false }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const playerIdRef = useRef(`yt-player-${Math.random().toString(36).slice(2, 9)}`);
    const [isReady, setIsReady] = useState(false);
    
    const onEndedRef = useRef(onEnded);
    const onProgressUpdateRef = useRef(onProgressUpdate);
    
    useEffect(() => {
      onEndedRef.current = onEnded;
    }, [onEnded]);
    
    useEffect(() => {
      onProgressUpdateRef.current = onProgressUpdate;
    }, [onProgressUpdate]);

    useImperativeHandle(ref, () => ({
      seekTo: (seconds: number) => {
        playerRef.current?.seekTo(seconds, true);
      },
      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime() ?? 0;
      },
    }));

    const startProgressTracking = useCallback(() => {
      if (progressIntervalRef.current) return;

      progressIntervalRef.current = setInterval(() => {
        if (!playerRef.current || !onProgressUpdateRef.current) return;

        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        if (duration > 0) {
          onProgressUpdateRef.current({
            played: currentTime / duration,
            playedSeconds: currentTime,
          });
        }
      }, 1000);
    }, []);

    const stopProgressTracking = useCallback(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, []);

    useEffect(() => {
      let mounted = true;

      const initPlayer = async () => {
        await loadYouTubeAPI();

        if (!mounted) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = `<div id="${playerIdRef.current}"></div>`;

        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
            playsinline: 1,
            start: Math.floor(initialPosition),
          },
          events: {
            onReady: () => {
              setIsReady(true);
            },
            onStateChange: (event) => {
              const state = event.data;

              if (state === window.YT.PlayerState.PLAYING) {
                startProgressTracking();
              } else {
                stopProgressTracking();
              }

              if (state === window.YT.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
            },
          },
        });
      };

      initPlayer();

      return () => {
        mounted = false;
        stopProgressTracking();
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
      };
    }, [videoId, initialPosition, startProgressTracking, stopProgressTracking]);

    return (
      <div
        className={cn(
          "relative w-full aspect-video max-h-[50vh] sm:max-h-none overflow-hidden bg-black transition-all duration-500",
          theaterMode ? "z-50 scale-100" : "z-0"
        )}
      >
        <div
          ref={containerRef}
          className="absolute inset-0 z-10 [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full"
        />
        <LandscapeHint isReady={isReady} />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
