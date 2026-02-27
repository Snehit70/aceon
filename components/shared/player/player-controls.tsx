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
  isPlaying: boolean;
  isReady: boolean;
  theaterMode?: boolean;
  onTheaterModeChange?: (enabled: boolean) => void;
  onPlayPause: () => void;
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
  isPlaying,
  isReady,
  theaterMode = false,
  onTheaterModeChange,
  onPlayPause,
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

  const handleTheaterToggle = useCallback(() => {
    onTheaterModeChange?.(!theaterMode);
  }, [theaterMode, onTheaterModeChange]);

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

          {/* Theater mode toggle */}
          {onTheaterModeChange && (
            <button
              type="button"
              onClick={handleTheaterToggle}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-sm hover:bg-white/10 transition-colors"
              aria-label={theaterMode ? "Exit theater mode" : "Theater mode"}
            >
              {theaterMode ? (
                <Minimize className="w-5 h-5 text-white" />
              ) : (
                <Maximize className="w-5 h-5 text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
