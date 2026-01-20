"use client";

import { useEffect, useState, useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import ReactPlayer from "react-player";
import * as Slider from "@radix-ui/react-slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Loader2, 
  RotateCcw, 
  RotateCw,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
  onProgressUpdate?: (progress: { played: number; playedSeconds: number }) => void;
  onSeek?: (seconds: number) => void;
  initialPosition?: number;
  theaterMode?: boolean;
  onTheaterModeChange?: (enabled: boolean) => void;
}

interface PlayerRef {
  getCurrentTime: () => number;
  seekTo: (amount: number, type?: "seconds" | "fraction") => void;
  getDuration: () => number;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ 
  videoId, 
  title, 
  onEnded,
  onProgressUpdate,
  onSeek,
  initialPosition = 0,
  theaterMode = false,
  onTheaterModeChange
}, ref) => {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [buffer, setBuffer] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const playerRef = useRef<PlayerRef | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, "seconds");
        if (duration > 0) {
          setPlayed(seconds / duration);
        }
      }
    },
    getCurrentTime: () => {
      return playerRef.current ? playerRef.current.getCurrentTime() : 0;
    }
  }));

  const stateRef = useRef({
    playing,
    volume,
    muted,
    duration,
    played,
    seeking
  });

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    stateRef.current = { playing, volume, muted, duration, played, seeking };
  }, [playing, volume, muted, duration, played, seeking]);

  const handlePlayPause = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0) setMuted(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const handleSeekChange = useCallback((value: number[]) => {
    setSeeking(true);
    setPlayed(value[0]);
  }, []);

  const handleSeekCommit = useCallback((value: number[]) => {
    setSeeking(false);
    const newPlayed = value[0];
    setPlayed(newPlayed);
    if (playerRef.current) {
      playerRef.current.seekTo(newPlayed, "fraction");
    }
    if (onSeek) {
      onSeek(newPlayed * duration);
    }
  }, [duration, onSeek]);

  const seekRelative = useCallback((seconds: number) => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const dur = playerRef.current.getDuration();
      const newTime = Math.max(0, Math.min(dur, currentTime + seconds));
      playerRef.current.seekTo(newTime, "seconds");
    }
  }, []);

  const handleRewind = useCallback(() => seekRelative(-10), [seekRelative]);
  const handleFastForward = useCallback(() => seekRelative(10), [seekRelative]);

  const handlePlaybackRateChange = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  const toggleTheater = useCallback(() => {
    if (onTheaterModeChange) {
      onTheaterModeChange(!theaterMode);
    }
  }, [onTheaterModeChange, theaterMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const { volume: vol } = stateRef.current;

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekRelative(5);
          break;
        case "KeyJ":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "KeyL":
          e.preventDefault();
          seekRelative(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, vol + 0.1));
          setMuted(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, vol - 0.1));
          setMuted(false);
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, seekRelative, toggleFullscreen, toggleMute]);

  useEffect(() => {
    const handleFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  if (!mounted) {
    return <div className="w-full aspect-video bg-slate-900 rounded-xl animate-pulse" />;
  }

  const currentTime = duration * played;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group bg-black transition-all duration-500",
        theaterMode ? "z-50 scale-[1.02]" : "z-0"
      )}
    >
      <div className="absolute -inset-4 bg-primary/40 blur-3xl opacity-20 pointer-events-none animate-pulse" />
      
      <div className="absolute inset-0 z-10" onClick={handlePlayPause}>
        <ReactPlayer
          ref={(player) => {
            if (player) {
              playerRef.current = player as unknown as PlayerRef;
            }
          }}
          src={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
          playing={playing}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          onTimeUpdate={(e) => {
            const video = e.currentTarget;
            if (!stateRef.current.seeking && video.duration > 0) {
              const playedFraction = video.currentTime / video.duration;
              setPlayed(playedFraction);
              if (onProgressUpdate) {
                onProgressUpdate({
                  played: playedFraction,
                  playedSeconds: video.currentTime
                });
              }
            }
          }}
          onDurationChange={(e) => {
            const video = e.currentTarget;
            if (video.duration && !isNaN(video.duration)) {
              setDuration(video.duration);
            }
          }}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setDuration(video.duration);
          }}
          onReady={() => {
            setIsReady(true);
            if (initialPosition > 0 && playerRef.current) {
              playerRef.current.seekTo(initialPosition, "seconds");
            }
          }}
          onEnded={() => {
            setPlaying(false);
            onEnded?.();
          }}
          onWaiting={() => setBuffer(true)}
          onPlaying={() => {
            setBuffer(false);
            setPlaying(true);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          controls={false}
          config={{
            youtube: {
              color: "white"
            }
          }}
        />
      </div>

      {buffer && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary animate-spin drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
        </div>
      )}

      <div 
        className={cn(
          "absolute inset-0 z-30 flex flex-col justify-between p-6 bg-gradient-to-t from-black/90 via-black/20 to-black/60 transition-opacity duration-300",
          (playing && !seeking && !showSpeedMenu) ? "opacity-0 group-hover:opacity-100" : "opacity-100",
          !isReady && "opacity-0"
        )}
      >
        <div className="flex justify-between items-start pointer-events-auto">
          <h3 className="text-white/90 font-medium text-lg drop-shadow-md tracking-tight truncate max-w-[80%]">{title}</h3>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button 
            onClick={handlePlayPause}
            className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 pointer-events-auto ring-1 ring-white/20 shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {playing ? (
              <Pause className="w-8 h-8 fill-white" />
            ) : (
              <Play className="w-8 h-8 fill-white ml-1" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-4 pointer-events-auto bg-black/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/80 w-12 text-right tabular-nums font-mono">{formatTime(currentTime)}</span>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer group/slider"
              value={[played]}
              max={1}
              step={0.0001}
              onValueChange={handleSeekChange}
              onValueCommit={handleSeekCommit}
            >
              <Slider.Track className="bg-white/20 relative grow rounded-full h-1.5 overflow-hidden transition-all group-hover/slider:h-2">
                <Slider.Range className="absolute h-full bg-primary shadow-[0_0_15px_var(--primary)]" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/slider:opacity-100 transition-all scale-0 group-hover/slider:scale-100 focus:outline-none ring-2 ring-primary/50" />
            </Slider.Root>
            <span className="text-xs font-medium text-white/80 w-12 tabular-nums font-mono">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-4">
              <button onClick={handlePlayPause} className="text-white/80 hover:text-white transition-all hover:scale-110">
                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={handleRewind} className="text-white/80 hover:text-white transition-all hover:scale-110" title="Rewind 10s (J)">
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button onClick={handleFastForward} className="text-white/80 hover:text-white transition-all hover:scale-110" title="Forward 10s (L)">
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3 group/vol">
                <button onClick={toggleMute} className="text-white/80 hover:text-white transition-all hover:scale-110" title="Mute (M)">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-24 transition-all duration-300 opacity-60 group-hover/vol:opacity-100">
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer"
                    value={[muted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  >
                    <Slider.Track className="bg-white/20 relative grow rounded-full h-1.5 overflow-hidden">
                      <Slider.Range className="absolute h-full bg-white" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-3 h-3 bg-white rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity" />
                  </Slider.Root>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                  className="flex items-center gap-1 text-white/80 hover:text-white transition-all hover:scale-110"
                  title="Playback Speed"
                >
                  <span className="text-sm font-bold w-8 text-center bg-white/10 rounded px-1">{playbackRate}x</span>
                </button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden py-1 flex flex-col items-center min-w-[60px] shadow-xl z-50">
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={cn(
                          "w-full px-3 py-1.5 text-xs font-medium hover:bg-white/20 transition-colors",
                          playbackRate === rate ? "text-primary bg-white/10" : "text-white/80"
                        )}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onTheaterModeChange && (
                <button 
                  onClick={toggleTheater}
                  className={cn(
                    "text-white/80 hover:text-white transition-all hover:scale-110",
                    theaterMode && "text-primary"
                  )}
                  title="Theater Mode"
                >
                  <Monitor className="w-6 h-6" />
                </button>
              )}

              <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-all hover:scale-110" title="Fullscreen (F)">
                {fullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
