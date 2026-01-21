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
  Monitor,
  Settings,
  Gauge,
  LogOut,
  PlayCircle
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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showNativeControls, setShowNativeControls] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const isTogglingRef = useRef(false);

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

  const toggleNativeControls = useCallback(() => {
    const time = (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') 
      ? playerRef.current.getCurrentTime() 
      : 0;
    setSavedTime(time);
    isTogglingRef.current = true;
    setShowNativeControls((prev) => !prev);
  }, []);

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
        case "Slash":
          if (e.shiftKey) {
            e.preventDefault();
            setShowShortcuts((prev) => !prev);
          }
          break;
        case "Escape":
          if (showShortcuts) {
            e.preventDefault();
            setShowShortcuts(false);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlePlayPause, seekRelative, toggleFullscreen, toggleMute, showShortcuts]);

  useEffect(() => {
    const handleFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  if (!mounted) {
    return <div className="w-full aspect-video bg-black animate-pulse" />;
  }

  const currentTime = duration * played;

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative w-full aspect-video overflow-hidden bg-black transition-all duration-500",
        theaterMode ? "z-50 scale-100" : "z-0"
      )}
    >
      <div 
        className="absolute inset-0 z-10" 
        onClick={showNativeControls ? undefined : handlePlayPause}
        onDoubleClick={showNativeControls ? undefined : toggleFullscreen}
        style={{ pointerEvents: showNativeControls ? 'none' : 'auto' }}
      >
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
          onProgress={(progress: any) => {
            if (!stateRef.current.seeking) {
              setPlayed(progress.played);
              if (onProgressUpdate) {
                onProgressUpdate({
                  played: progress.played,
                  playedSeconds: progress.playedSeconds
                });
              }
            }
          }}
          onDuration={(d: number) => {
            setDuration(d);
          }}
          onReady={() => {
            setIsReady(true);
            if (isTogglingRef.current) {
              if (playerRef.current) {
                playerRef.current.seekTo(savedTime, "seconds");
              }
              isTogglingRef.current = false;
            } else if (initialPosition > 0 && playerRef.current) {
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
          controls={showNativeControls}
          config={{
            youtube: {
              playerVars: { 
                controls: showNativeControls ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                fs: 0,
                disablekb: 1,
                playsinline: 1
              }
            } as any
          }}
        />
      </div>

      {!playing && isReady && !seeking && !showNativeControls && !buffer && (
        <div 
          className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          <div className="flex flex-col items-center transform transition-transform hover:scale-105 duration-300">
            <h3 className="text-white/90 font-medium text-lg mb-3 tracking-tight drop-shadow-lg text-center max-w-2xl px-4">{title}</h3>
            
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-teal-400 mb-8 uppercase tracking-widest backdrop-blur-md shadow-lg">
              Paused
            </div>

            <button 
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="group relative focus:outline-none"
            >
              <div className="absolute inset-0 bg-teal-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
              <PlayCircle className="w-24 h-24 text-white/90 group-hover:text-teal-400 fill-white/5 transition-all duration-300" strokeWidth={1} />
            </button>
          </div>
        </div>
      )}

      {showNativeControls && (
        <button
          onClick={toggleNativeControls}
          className="absolute top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-md border border-white/10 text-white hover:text-teal-400 rounded-sm transition-all shadow-xl group hover:bg-black/90"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-mono uppercase tracking-wider">Exit Native</span>
        </button>
      )}

      {buffer && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-teal-500 animate-spin drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
        </div>
      )}

      <div 
        className={cn(
          "absolute inset-0 z-30 flex flex-col justify-end transition-opacity duration-300 pointer-events-none",
          (playing && !isHovering && !seeking && !showSpeedMenu) ? "opacity-0" : "opacity-100",
          (!isReady || showNativeControls) && "opacity-0"
        )}
      >
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none" />

        <div className={cn("relative z-40 px-4 pb-4 pointer-events-auto w-full", showNativeControls && "pointer-events-none")}>
          
          <div className="w-full mb-4 group/slider">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
              value={[played]}
              max={1}
              step={0.0001}
              onValueChange={handleSeekChange}
              onValueCommit={handleSeekCommit}
            >
              <Slider.Track className="bg-white/20 relative grow h-[3px] overflow-hidden transition-all group-hover/slider:h-[5px] w-full">
                <Slider.Range className="absolute h-full bg-teal-500" />
              </Slider.Track>
              <Slider.Thumb className="block w-3 h-3 bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] opacity-0 group-hover/slider:opacity-100 transition-all scale-0 group-hover/slider:scale-100 focus:outline-none" />
            </Slider.Root>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={handlePlayPause} 
                className="text-white hover:text-teal-400 transition-colors focus:outline-none"
              >
                {playing ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-teal-400 transition-colors focus:outline-none"
                >
                  {muted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out">
                  <Slider.Root
                    className="relative flex items-center select-none touch-none w-24 h-5 cursor-pointer ml-2"
                    value={[muted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  >
                    <Slider.Track className="bg-white/20 relative grow h-1 overflow-hidden">
                      <Slider.Range className="absolute h-full bg-white group-hover/vol:bg-teal-500 transition-colors" />
                    </Slider.Track>
                    <Slider.Thumb className="block w-2.5 h-2.5 bg-white group-hover/vol:bg-teal-500 transition-colors focus:outline-none" />
                  </Slider.Root>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono text-sm tracking-tight text-white/90">
                <span className="tabular-nums w-[44px] text-right">{formatTime(currentTime)}</span>
                <span className="text-white/40">/</span>
                <span className="tabular-nums w-[44px]">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="relative">
                <button 
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)} 
                  className={cn(
                    "flex items-center gap-1 text-sm font-medium hover:text-teal-400 transition-colors focus:outline-none",
                    showSpeedMenu ? "text-teal-400" : "text-white"
                  )}
                  title="Playback Speed"
                >
                  <Gauge className="w-5 h-5 mr-1" />
                  <span>{playbackRate}x</span>
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-4 bg-black/95 backdrop-blur-md border border-white/10 overflow-hidden flex flex-col min-w-[80px] shadow-2xl z-50">
                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handlePlaybackRateChange(rate)}
                        className={cn(
                          "w-full px-4 py-2 text-sm font-medium hover:bg-teal-500/20 hover:text-teal-400 transition-colors text-left font-mono",
                          playbackRate === rate ? "text-teal-400 bg-teal-500/10" : "text-white/70"
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
                    "hover:text-teal-400 transition-colors focus:outline-none",
                    theaterMode ? "text-teal-500" : "text-white"
                  )}
                  title="Theater Mode"
                >
                  <Monitor className="w-6 h-6" />
                </button>
              )}

              <button 
                onClick={toggleNativeControls} 
                className="text-white hover:text-teal-400 transition-colors focus:outline-none" 
                title="Player Settings"
              >
                <Settings className="w-6 h-6" />
              </button>

              <button 
                onClick={toggleFullscreen} 
                className="text-white hover:text-teal-400 transition-colors focus:outline-none" 
                title="Fullscreen (F)"
              >
                {fullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShortcuts && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div 
            className="bg-zinc-900 border border-zinc-800 p-8 max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-medium text-white tracking-tight">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowShortcuts(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                <span className="font-mono text-xs uppercase tracking-widest">Close [ESC]</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-medium text-teal-500 uppercase tracking-widest mb-4">Playback</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Play/Pause</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">SPACE</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Rewind 10s</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">J</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Forward 10s</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">L</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Seek 5s</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">←</kbd>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">→</kbd>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-mono font-medium text-teal-500 uppercase tracking-widest mb-4">Audio & View</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Volume</span>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">↑</kbd>
                      <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">↓</kbd>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Mute</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">M</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Fullscreen</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">F</kbd>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 text-sm">Shortcuts</span>
                    <kbd className="px-2 py-1 bg-white/5 border border-white/10 text-white font-mono text-xs min-w-[32px] text-center">?</kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
