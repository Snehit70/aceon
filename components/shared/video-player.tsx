"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState, useId } from "react";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import LandscapeHint from "./landscape-hint";
import { PlayerControls, PlayerOverlay, VolumeIndicator } from "./player";

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
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  destroy: () => void;
}

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unmute: () => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
  onPause?: (currentTime: number) => void;
  onProgressUpdate?: (progress: { played: number; playedSeconds: number }) => void;
  initialPosition?: number;
}

// Track if API script is loaded
let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

/**
 * Helper to load the YouTube IFrame API script.
 * Ensures the script is loaded only once and handles multiple concurrent requests.
 * 
 * @returns Promise that resolves when window.YT is available.
 */
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

/**
 * VideoPlayer - A robust YouTube player wrapper using the IFrame Player API.
 * 
 * **Context**: core component for the lecture viewing experience. It replaces standard 
 * iframe embeds to allow programmatic control, state tracking, and progress monitoring.
 * 
 * **Integrations**: 
 * - YouTube IFrame API: For playback control and state events.
 * - Convex: Progress updates are sent to backend via `onProgressUpdate` prop.
 * 
 * **State Management**:
 * - Manages its own `YT.Player` instance lifecycle.
 * - Tracks playback progress via 1s interval when playing.
 * - Handles auto-cleanup of player instance on unmount or video change.
 * - Exposes imperative handle (`seekTo`, `getCurrentTime`) for parent control.
 * 
 * **User Flow**:
 * 1. User selects a video -> `videoId` prop changes.
 * 2. Player initializes/reloads with new video.
 * 3. `initialPosition` is used to resume where user left off.
 * 4. While playing, `onProgressUpdate` fires every second.
 * 5. When finished, `onEnded` triggers completion logic.
 * 
 * @param props - Component props.
 * @param props.videoId - The YouTube video ID (e.g., "dQw4w9WgXcQ").
 * @param props.title - Video title (used for accessibility/analytics).
 * @param props.onEnded - Callback fired when video finishes.
 * @param props.onProgressUpdate - Callback fired every second with playback stats.
 * @param props.initialPosition - Start time in seconds (for resuming progress).
 * @param ref - VideoPlayerRef for imperative seeking and time retrieval.
 * @returns A responsive div containing the YouTube IFrame.
 */
const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, onEnded, onPause, onProgressUpdate, initialPosition = 0 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const internalRef = useRef<VideoPlayerRef | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const uniqueId = useId();
    const playerIdRef = useRef(`yt-player-${uniqueId.replace(/:/g, '')}`);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showPlayIndicator, setShowPlayIndicator] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeTrigger, setVolumeTrigger] = useState(0);
    const pendingSeekRef = useRef<number | null>(null);
    const pendingPlaybackRateRef = useRef<number | null>(null);
    const playIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Derived state to track initial position for the current video
    // This allows us to ignore initialPosition prop updates unless videoId changes
    const [videoState, setVideoState] = useState({ videoId, initialPosition });
    
    if (videoState.videoId !== videoId) {
      setVideoState({ videoId, initialPosition });
    }
    
    const onEndedRef = useRef(onEnded);
    const onPauseRef = useRef(onPause);
    const onProgressUpdateRef = useRef(onProgressUpdate);
    
    useEffect(() => {
      onEndedRef.current = onEnded;
    }, [onEnded]);
    
    useEffect(() => {
      onPauseRef.current = onPause;
    }, [onPause]);
    
    useEffect(() => {
      onProgressUpdateRef.current = onProgressUpdate;
    }, [onProgressUpdate]);

    // Create the imperative handle object
    const imperativeHandle: VideoPlayerRef = {
      seekTo: (seconds: number) => {
        if (isReady && playerRef.current) {
          playerRef.current.seekTo(seconds, true);
        } else {
          pendingSeekRef.current = seconds;
        }
      },
      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime() ?? 0;
      },
      getDuration: () => {
        return playerRef.current?.getDuration() ?? 0;
      },
      play: () => {
        if (isReady && playerRef.current) {
          playerRef.current.playVideo();
        }
      },
      pause: () => {
        if (isReady && playerRef.current) {
          playerRef.current.pauseVideo();
        }
      },
      isPlaying: () => {
        if (!playerRef.current) return false;
        return playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
      },
      getVolume: () => {
        return playerRef.current?.getVolume() ?? 100;
      },
      setVolume: (newVolume: number) => {
        if (isReady && playerRef.current) {
          playerRef.current.setVolume(newVolume);
          setVolume(newVolume);
          setVolumeTrigger((t) => t + 1);
        }
      },
      isMuted: () => {
        return playerRef.current?.isMuted() ?? false;
      },
      mute: () => {
        if (isReady && playerRef.current) {
          playerRef.current.mute();
          setIsMuted(true);
          setVolumeTrigger((t) => t + 1);
        }
      },
      unmute: () => {
        if (isReady && playerRef.current) {
          playerRef.current.unMute();
          setIsMuted(false);
          setVolumeTrigger((t) => t + 1);
        }
      },
      getPlaybackRate: () => {
        return playerRef.current?.getPlaybackRate() ?? 1;
      },
      setPlaybackRate: (rate: number) => {
        // Always store pending rate - apply when ready or store for later
        pendingPlaybackRateRef.current = rate;
        if (isReady && playerRef.current) {
          playerRef.current.setPlaybackRate(rate);
        }
      },
    };

    // Expose to forwarded ref
    useImperativeHandle(ref, () => imperativeHandle, [isReady]);
    
    // Sync internal ref in effect (not during render)
    useEffect(() => {
      internalRef.current = imperativeHandle;
    });

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

    /**
     * Handle click on the overlay to toggle play/pause.
     * This prevents the iframe from receiving focus while still controlling playback.
     */
    const handleOverlayClick = useCallback(() => {
      if (!isReady || !playerRef.current) return;
      
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      
      // Show brief play/pause indicator
      setShowPlayIndicator(true);
      if (playIndicatorTimeoutRef.current) {
        clearTimeout(playIndicatorTimeoutRef.current);
      }
      playIndicatorTimeoutRef.current = setTimeout(() => {
        setShowPlayIndicator(false);
      }, 500);
    }, [isReady]);

    // Cleanup play indicator timeout on unmount
    useEffect(() => {
      return () => {
        if (playIndicatorTimeoutRef.current) {
          clearTimeout(playIndicatorTimeoutRef.current);
        }
      };
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

        const container = iframeContainerRef.current;
        if (!container) return;

        container.innerHTML = `<div id="${playerIdRef.current}"></div>`;

        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
            playsinline: 1,
            start: Math.floor(videoState.initialPosition),
            disablekb: 1,
          },
          events: {
            onReady: () => {
              setIsReady(true);
              if (pendingSeekRef.current !== null && playerRef.current) {
                playerRef.current.seekTo(pendingSeekRef.current, true);
                pendingSeekRef.current = null;
              }
              if (pendingPlaybackRateRef.current !== null && playerRef.current) {
                playerRef.current.setPlaybackRate(pendingPlaybackRateRef.current);
                // Don't clear - keep as "preferred rate" for subsequent video changes
              }
            },
            onStateChange: (event) => {
              const state = event.data;

              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                startProgressTracking();
              } else {
                setIsPlaying(false);
                stopProgressTracking();
              }

              if (state === window.YT.PlayerState.PAUSED && playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                onPauseRef.current?.(currentTime);
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
        setIsReady(false);
        pendingSeekRef.current = null;
      };
    }, [videoId, startProgressTracking, stopProgressTracking, videoState.initialPosition]);

    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video max-h-[50vh] sm:max-h-none overflow-hidden bg-black transition-all duration-500 group"
      >
        {/* YouTube iframe container */}
        <div
          ref={iframeContainerRef}
          className="absolute inset-0 z-10 [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full"
        />
        
        {/* Transparent click overlay - intercepts clicks to prevent iframe focus */}
        <button
          type="button"
          onClick={handleOverlayClick}
          className="absolute inset-0 z-20 cursor-pointer bg-transparent border-none outline-none focus:outline-none"
          aria-label={isPlaying ? "Pause video" : "Play video"}
          tabIndex={-1}
        />
        
        {/* Play/Pause indicator - shows briefly on click */}
        <div
          className={cn(
            "absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-200",
            showPlayIndicator ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
            {isPlaying ? (
              <Pause className="w-10 h-10 text-white" fill="white" />
            ) : (
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            )}
          </div>
        </div>
        
        {/* Center play button overlay - shows when paused */}
        <PlayerOverlay
          isReady={isReady}
          isPlaying={isPlaying}
          showPlayButton={!showPlayIndicator}
          onPlay={() => internalRef.current?.play()}
        />
        
        {/* Custom player controls */}
        <PlayerControls
          playerRef={internalRef}
          containerRef={containerRef}
          isPlaying={isPlaying}
          isReady={isReady}
          onPlayPause={handleOverlayClick}
          videoId={videoId}
        />
        
        {/* Volume indicator overlay - shows on volume change */}
        <VolumeIndicator
          volume={volume}
          isMuted={isMuted}
          trigger={volumeTrigger}
        />
        
        <LandscapeHint isReady={isReady} />
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
