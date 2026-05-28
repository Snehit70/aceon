"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Play, Pause, Maximize, Minimize, Captions } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoPlayerRef } from "../video-player";
import ProgressBar from "./progress-bar";
import VolumeControl from "./volume-control";
import PlaybackSpeed from "./playback-speed";
import { YouTubeIcon } from "./icons";

interface PlayerControlsProps {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isReady: boolean;
  onPlayPause: () => void;
  videoId: string;
  subtitlesAvailable?: boolean;
  subtitlesEnabled?: boolean;
  onToggleSubtitles?: () => void;
}

/**
 * Format seconds to MM:SS or HH:MM:SS format
 */
function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * PlayerControls - Custom control bar for the video player.
 * 
 * Replaces YouTube's native controls with a Chainsaw Man themed UI.
 * Features: play/pause, seekable progress bar, volume, playback speed, theater mode.
 */
export default function PlayerControls({
  playerRef,
  containerRef,
  isPlaying,
  isReady,
  onPlayPause,
  videoId,
  subtitlesAvailable = false,
  subtitlesEnabled = false,
  onToggleSubtitles,
}: PlayerControlsProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Update time and playback rate every 250ms when playing
  useEffect(() => {
    if (!isReady || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
        setDuration(playerRef.current.getDuration());
        // Sync playback rate in case it was changed via keyboard shortcuts
        const currentRate = playerRef.current.getPlaybackRate();
        setPlaybackRate((prev) => (prev !== currentRate ? currentRate : prev));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isReady, isPlaying, playerRef]);

  // Get initial duration when ready
  useEffect(() => {
    if (isReady && playerRef.current) {
      setDuration(playerRef.current.getDuration());
      setVolume(playerRef.current.getVolume());
      setIsMuted(playerRef.current.isMuted());
      setPlaybackRate(playerRef.current.getPlaybackRate());
    }
  }, [isReady, playerRef]);

  // Auto-hide controls after 3s of inactivity when playing
  // Show controls immediately when paused (via derived visibility below)
  useEffect(() => {
    if (!isPlaying) {
      // When paused, clear any pending hide and let controls show
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      return;
    }

    // When playing, start hide timer (controls will auto-hide)
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isPlaying]);

  // Derive effective visibility: always show when paused, otherwise use state
  const controlsVisible = !isPlaying || showControls;

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const handlePointerMove = useCallback(() => {
    handleMouseMove();
  }, [handleMouseMove]);

  const handleSeek = useCallback(
    (time: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(time);
        setCurrentTime(time);
      }
    },
    [playerRef]
  );

  const handleVolumeChange = useCallback(
    (newVolume: number) => {
      if (playerRef.current) {
        playerRef.current.setVolume(newVolume);
        setVolume(newVolume);
        if (newVolume > 0 && isMuted) {
          playerRef.current.unmute();
          setIsMuted(false);
        }
      }
    },
    [playerRef, isMuted]
  );

  const handleMuteToggle = useCallback(() => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unmute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  }, [playerRef, isMuted]);

  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      if (playerRef.current) {
        playerRef.current.setPlaybackRate(rate);
        setPlaybackRate(rate);
      }
    },
    [playerRef]
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  const getOrientationController = ():
    | (ScreenOrientation & {
      lock?: (orientation: string) => Promise<void>;
      unlock?: () => void;
    })
    | undefined => screen.orientation;

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);

      const orientation = getOrientationController();
      if (!document.fullscreenElement && orientation?.unlock) {
        orientation.unlock();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      try {
        await container.requestFullscreen({ navigationUI: "hide" });
      } catch (error) {
        console.error(error);
        return;
      }

      const orientation = getOrientationController();
      if (orientation?.lock) {
        try {
          await orientation.lock("landscape");
        } catch (error) {
          console.debug("Orientation lock failed:", error);
        }
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.error(error);
      }
    }
  }, [containerRef]);

  return (
    <div
      ref={controlsRef}
      onMouseMove={handleMouseMove}
      onPointerMove={handlePointerMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300",
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Gradient fade for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      <div className="relative px-2 pb-2 pt-8 sm:px-3 sm:pb-3">
        {/* Progress bar */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        {/* Control buttons row */}
        <div className="flex items-center gap-1 sm:gap-2 mt-2">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={onPlayPause}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" fill="white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            )}
          </button>

          {/* Volume */}
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
          />

          {/* Time display */}
          <div className="text-white/90 text-[11px] sm:text-sm font-mono tabular-nums select-none whitespace-nowrap">
            {formatTime(currentTime)}
            <span className="hidden min-[380px]:inline"> / {formatTime(duration)}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Playback speed */}
          <PlaybackSpeed
            rate={playbackRate}
            onRateChange={handlePlaybackRateChange}
          />

          {/* Subtitles toggle */}
          {subtitlesAvailable && (
            <button
              type="button"
              onClick={onToggleSubtitles}
              className={cn(
                "min-h-[44px] min-w-[40px] sm:min-w-[44px] flex items-center justify-center rounded-sm transition-colors",
                subtitlesEnabled ? "bg-primary/20 text-primary" : "hover:bg-white/10 text-white"
              )}
              aria-label={subtitlesEnabled ? "Turn subtitles off" : "Turn subtitles on"}
              title={subtitlesEnabled ? "Subtitles on" : "Subtitles off"}
            >
              <Captions className="w-5 h-5" />
            </button>
          )}

          {/* View on YouTube */}
          <a
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${Math.floor(currentTime)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => { 
              if (isPlaying) playerRef.current?.pause(); 
            }}
            className="flex min-h-[44px] min-w-[40px] sm:min-w-[44px] items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
            aria-label="View on YouTube"
            title="View on YouTube"
          >
            <YouTubeIcon className="w-5 h-5 text-white" />
          </a>

          {/* Fullscreen toggle */}
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-white" />
            ) : (
              <Maximize className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
