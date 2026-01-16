"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactPlayer from "react-player";
import * as Slider from "@radix-ui/react-slider";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
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

export default function VideoPlayer({ videoId, title, onEnded }: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [played, setPlayed] = useState(0); // 0 to 1
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [buffer, setBuffer] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ReactPlayerAny = ReactPlayer as any;

  useEffect(() => setMounted(true), []);

  const handlePlayPause = () => setPlaying(!playing);
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0) setMuted(false);
  };

  const toggleMute = () => setMuted(!muted);

  const handleProgress = (state: any) => {
    if (!seeking) {
      setPlayed(state.played);
    }
  };

  const handleSeekChange = (value: number[]) => {
    setSeeking(true);
    setPlayed(value[0]);
  };

  const handleSeekCommit = (value: number[]) => {
    setSeeking(false);
    playerRef.current?.seekTo(value[0]);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Sync fullscreen state listener
  useEffect(() => {
    const handleFSChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  if (!mounted) return <div className="w-full aspect-video bg-slate-900 rounded-xl animate-pulse" />;

  const currentTime = duration * played;

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group bg-black"
    >
      {/* Ambient Glow */}
      <div className="absolute -inset-4 bg-primary/40 blur-3xl opacity-20 pointer-events-none animate-pulse" />
      
      {/* Player Wrapper */}
      <div className="absolute inset-0 z-10" onClick={handlePlayPause}>
        <ReactPlayerAny
          ref={playerRef}
          url={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          playing={playing}
          volume={volume}
          muted={muted}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={onEnded}
          onBuffer={() => setBuffer(true)}
          onBufferEnd={() => setBuffer(false)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          config={{
            youtube: {
              playerVars: { showinfo: 0, controls: 0, modestbranding: 1, rel: 0, playsinline: 1 }
            }
          }}
        />
      </div>

      {/* Buffer Spinner */}
      {buffer && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 z-30 flex flex-col justify-between p-6 bg-gradient-to-t from-black/90 via-black/20 to-black/60 transition-opacity duration-300 pointer-events-none",
          (playing && !seeking) ? "opacity-0 group-hover:opacity-100" : "opacity-100"
        )}
      >
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
          <h3 className="text-white/90 font-medium text-lg drop-shadow-md tracking-tight">{title}</h3>
        </div>

        {/* Center Play Button (Big) */}
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

        {/* Bottom Controls */}
        <div className="flex flex-col gap-4 pointer-events-auto">
          {/* Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-white/80 w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5 cursor-pointer group/slider"
              value={[played]}
              max={1}
              step={0.001}
              onValueChange={handleSeekChange}
              onValueCommit={handleSeekCommit}
            >
              <Slider.Track className="bg-white/20 relative grow rounded-full h-1.5 overflow-hidden transition-all group-hover/slider:h-2">
                <Slider.Range className="absolute h-full bg-primary shadow-[0_0_15px_var(--primary)]" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/slider:opacity-100 transition-transform scale-0 group-hover/slider:scale-100 focus:outline-none" />
            </Slider.Root>
            <span className="text-xs font-medium text-white/80 w-10 tabular-nums">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-6">
              <button onClick={handlePlayPause} className="text-white/80 hover:text-white transition-all hover:scale-110">
                {playing ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>
              
              <div className="flex items-center gap-3 group/vol">
                <button onClick={toggleMute} className="text-white/80 hover:text-white transition-all hover:scale-110">
                  {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-24">
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

            <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-all hover:scale-110">
              {fullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
