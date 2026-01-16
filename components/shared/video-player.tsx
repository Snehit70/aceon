"use client";

import { useEffect, useState } from "react";
import { MediaPlayer, MediaProvider, Controls, PlayButton, TimeSlider, VolumeSlider, FullscreenButton, MuteButton, Gesture } from "@vidstack/react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import "@vidstack/react/player/styles/base.css";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ videoId, title, onEnded }: VideoPlayerProps) {
  // Ensure client-side rendering only to prevent hydration mismatches
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-full aspect-video bg-slate-900 rounded-xl animate-pulse" />;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
      {/* Ambient Glow */}
      <div className="absolute -inset-4 bg-primary/40 blur-3xl opacity-20 pointer-events-none animate-pulse" />
      
      <MediaPlayer 
        src={`youtube/${videoId}`} 
        title={title}
        className="relative z-10 w-full h-full bg-black shadow-2xl"
        onEnd={onEnded}
        playsInline
      >
        <MediaProvider />

        {/* Click to Play/Pause Gesture */}
        <Gesture className="absolute inset-0 z-0 block h-full w-full" event="pointerup" action="toggle:paused" />
        
        {/* Custom Controls Overlay */}
        <Controls.Root className="absolute inset-0 z-20 flex flex-col justify-between p-6 bg-gradient-to-t from-black/90 via-black/20 to-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 data-[paused]:opacity-100 pointer-events-none group-hover:pointer-events-auto data-[paused]:pointer-events-auto">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start pointer-events-auto">
            <h3 className="text-white/90 font-medium text-lg drop-shadow-md tracking-tight">{title}</h3>
          </div>

          {/* Center Play Button (Big) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <PlayButton className="group w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 pointer-events-auto ring-1 ring-white/20 shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <Play className="w-8 h-8 fill-white ml-1 hidden group-data-[paused]:block" />
              <Pause className="w-8 h-8 fill-white block group-data-[paused]:hidden" />
            </PlayButton>
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            <TimeSlider.Root className="group/slider relative h-6 w-full cursor-pointer touch-none select-none flex items-center">
              <TimeSlider.Track className="relative h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
                <TimeSlider.TrackFill className="absolute h-full rounded-full bg-primary shadow-[0_0_15px_var(--primary)] will-change-[width]" />
                <TimeSlider.Progress className="absolute h-full rounded-full bg-white/40 will-change-[width]" />
              </TimeSlider.Track>
              <TimeSlider.Thumb className="absolute h-4 w-4 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] opacity-0 group-hover/slider:opacity-100 transition-all duration-200 scale-0 group-hover/slider:scale-100" />
            </TimeSlider.Root>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-6">
                <PlayButton className="group text-white/80 hover:text-white transition-all hover:scale-110">
                  <Play className="w-6 h-6 fill-current hidden group-data-[paused]:block" />
                  <Pause className="w-6 h-6 fill-current block group-data-[paused]:hidden" />
                </PlayButton>
                
                <div className="flex items-center gap-3 group/vol">
                  <MuteButton className="group text-white/80 hover:text-white transition-all hover:scale-110">
                    <Volume2 className="w-6 h-6 hidden group-data-[volume=high]:block" />
                    <Volume2 className="w-6 h-6 hidden group-data-[volume=low]:block" />
                    <VolumeX className="w-6 h-6 hidden group-data-[muted]:block" />
                    {/* Fallback for normal state if data attributes lag */}
                    <Volume2 className="w-6 h-6 block group-data-[muted]:hidden group-data-[volume=high]:hidden group-data-[volume=low]:hidden" />
                  </MuteButton>
                  <VolumeSlider.Root className="relative w-24 h-6 flex items-center cursor-pointer touch-none select-none">
                     <VolumeSlider.Track className="relative h-1 w-full rounded-full bg-white/20 overflow-hidden">
                        <VolumeSlider.TrackFill className="absolute h-full rounded-full bg-white will-change-[width]" />
                     </VolumeSlider.Track>
                     <VolumeSlider.Thumb className="absolute h-3 w-3 rounded-full bg-white opacity-0 group-hover/vol:opacity-100 transition-opacity" />
                  </VolumeSlider.Root>
                </div>
              </div>

              <FullscreenButton className="group text-white/80 hover:text-white transition-all hover:scale-110">
                <Maximize className="w-6 h-6 hidden group-data-[fullscreen]:block" />
                <Minimize className="w-6 h-6 block group-data-[fullscreen]:hidden" />
                {/* Fix logic: Vidstack adds data-fullscreen to the button when active? Or media? 
                    Usually the button itself reflects state via data attributes. 
                    Let's use simple logic: Maximize usually shows when NOT fullscreen.
                */}
                <Maximize className="w-6 h-6 block group-data-[active]:hidden" />
                <Minimize className="w-6 h-6 hidden group-data-[active]:block" />
              </FullscreenButton>
            </div>
          </div>
        </Controls.Root>
      </MediaPlayer>
    </div>
  );
}
