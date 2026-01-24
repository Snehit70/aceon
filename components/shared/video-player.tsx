import { useEffect, useState, useRef, forwardRef, useImperativeHandle, ComponentType } from "react";
import ReactPlayer from "react-player";
import { cn } from "@/lib/utils";

// 1. Define the ReactPlayer instance interface
interface ReactPlayerInstance {
  seekTo(amount: number, type: "seconds" | "fraction"): void;
  getCurrentTime(): number;
}

// 2. Define ReactPlayer component props (minimal set we use)
interface ReactPlayerProps {
  ref?: React.Ref<ReactPlayerInstance>;
  src: string;
  width: string | number;
  height: string | number;
  style?: React.CSSProperties;
  controls?: boolean;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onDuration?: (duration: number) => void;
  onReady?: () => void;
  onEnded?: () => void;
  config?: {
    youtube?: {
      playerVars?: Record<string, number>;
    };
  };
}

// 3. Your public API (what consumers of this component can call)
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
  const [seeking] = useState(false);

  // 4. Type the ref with your custom interface
  const playerRef = useRef<ReactPlayerInstance>(null);
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

  // 5. Hydration: Set mounted flag after first render to prevent SSR mismatch
  // This is a necessary pattern for client-side hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    stateRef.current = { seeking };
  }, [seeking]);

  if (!mounted) {
    return <div className="w-full aspect-video bg-black animate-pulse" />;
  }

  // 6. Cast ReactPlayer with proper props interface
  const Player = ReactPlayer as unknown as ComponentType<ReactPlayerProps>;

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
          ref={(player: ReactPlayerInstance | null) => {
            if (player) {
              playerRef.current = player;
            }
          }}
          src={`https://www.youtube.com/watch?v=${videoId}`}
          width="100%"
          height="100%"
          style={{ width: "100%", height: "100%" }}
          onProgress={(progress: { played: number; playedSeconds: number }) => {
            if (!stateRef.current.seeking) {
              if (onProgressUpdate) {
                onProgressUpdate({
                  played: progress.played,
                  playedSeconds: progress.playedSeconds
                });
              }
            }
          }}
          onDuration={() => {
            // Duration is tracked by react-player internally
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
