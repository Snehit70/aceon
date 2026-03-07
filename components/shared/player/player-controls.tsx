"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Play, Pause, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoPlayerRef } from "../video-player";
import ProgressBar from "./progress-bar";
import VolumeControl from "./volume-control";
import PlaybackSpeed from "./playback-speed";

interface PlayerControlsProps {
  playerRef: React.RefObject<VideoPlayerRef | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPlaying: boolean;
  isReady: boolean;
  onPlayPause: () => void;
  videoId: string;
}

/**
 * YouTube icon SVG component.
 * Used for "View on YouTube" button to open video in native YouTube player.
 */
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
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

  // Track fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, [containerRef]);

  return (
    <div
      ref={controlsRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={cn(
        "absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300",
        controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Gradient fade for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

      <div className="relative px-3 pb-3 pt-8">
        {/* Progress bar */}
        <ProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
        />

        {/* Control buttons row */}
        <div className="flex items-center gap-2 mt-2">
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
          <div className="text-white/90 text-sm font-mono tabular-nums select-none">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Playback speed */}
          <PlaybackSpeed
            rate={playbackRate}
            onRateChange={handlePlaybackRateChange}
          />

          {/* View on YouTube */}
          <a
            href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${Math.floor(currentTime)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
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
