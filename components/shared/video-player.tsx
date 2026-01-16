"use client";

import { MediaPlayer, MediaProvider } from "@vidstack/react";
import { DefaultVideoLayout, defaultLayoutIcons } from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ videoId, title, onEnded }: VideoPlayerProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
      {/* Ambient Glow */}
      <div className="absolute -inset-4 bg-primary/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-1000 z-0" />
      
      <MediaPlayer 
        src={`youtube/${videoId}`} 
        title={title}
        className="relative z-10 w-full h-full bg-black/90 text-white"
        onEnd={onEnded}
        playsInline
      >
        <MediaProvider />
        <DefaultVideoLayout 
          icons={defaultLayoutIcons}
          colorScheme="purple" 
        />
      </MediaPlayer>
    </div>
  );
}
