import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from "react";
import ReactPlayer from "react-player";
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

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({ 
  videoId,
  onEnded,
  onProgressUpdate,
  initialPosition = 0,
  theaterMode = false,
}, ref) => {
  const [mounted, setMounted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seeking] = useState(false);

  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, "seconds");
      }
    },
    getCurrentTime: () => {
      return playerRef.current ? playerRef.current.getCurrentTime() : 0;
    }
  }));

  const stateRef = useRef({
    seeking
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    stateRef.current = { seeking };
  }, [seeking]);

  if (!mounted) {
    return <div className="w-full aspect-video bg-black animate-pulse" />;
  }

  const Player = ReactPlayer as any;

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-video overflow-hidden bg-black transition-all duration-500",
        theaterMode ? "z-50 scale-100" : "z-0"
      )}
    >
      <div className="absolute inset-0 z-10">
        <Player
          ref={(player: any) => {
            if (player) {
              playerRef.current = player;
            }
          }}
          src={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
          onProgress={(progress: any) => {
            if (!stateRef.current.seeking) {
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
            if (initialPosition > 0 && playerRef.current) {
              playerRef.current.seekTo(initialPosition, "seconds");
            }
          }}
          onEnded={() => {
            onEnded?.();
          }}
          controls={true}
          config={{
            youtube: {
              playerVars: { 
                controls: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
                fs: 1,
                disablekb: 0,
                playsinline: 1
              }
            }
          }}
        />
      </div>
    </div>
  );
});

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
