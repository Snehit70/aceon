"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState, useId } from "react";

import LandscapeHint from "./landscape-hint";
import { PlayerControls, PlayerOverlay, VolumeIndicator } from "./player";
import { AngularPlayIcon, AngularPauseIcon } from "./player/icons";

// YouTube IFrame API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number; target: YTPlayer }) => void;
            onError?: (event: { data: number; target: YTPlayer }) => void;
            onApiChange?: (event: { target: YTPlayer }) => void;
          };
        }
      ) => YTPlayer;
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getIframe: () => HTMLIFrameElement;
  destroy: () => void;
  // Captions module methods. Undocumented by YouTube but widely used; optional
  // here and guarded with try/catch at every call site in case they disappear.
  loadModule?: (moduleName: string) => void;
  unloadModule?: (moduleName: string) => void;
  getOption?: (moduleName: string, option: string) => unknown;
}

type FullscreenCapableElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullscreenCapableDocument = Document & {
  webkitExitFullscreen?: () => Promise<void> | void;
  webkitFullscreenElement?: Element | null;
};

export interface VideoPlayerRef {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unmute: () => void;
  getPlaybackRate: () => number;
  setPlaybackRate: (rate: number) => void;
  /** Returns the new captions state, or null when the video has no captions. */
  toggleSubtitles: () => boolean | null;
  toggleFullscreen: () => Promise<boolean>;
}

interface VideoPlayerProps {
  videoId: string;
  title: string;
  transcriptUrl?: string;
  onEnded?: () => void;
  onPause?: (currentTime: number) => void;
  onProgressUpdate?: (progress: { played: number; playedSeconds: number }) => void;
  initialPosition?: number;
}

interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

function decodeHtmlEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function parseVttTimestamp(raw: string): number {
  const value = raw.trim().replace(",", ".");
  const parts = value.split(":");
  if (parts.length < 2 || parts.length > 3) return Number.NaN;
  const [hh, mm, ss] =
    parts.length === 3
      ? [parts[0], parts[1], parts[2]]
      : ["0", parts[0], parts[1]];
  const hours = Number(hh);
  const minutes = Number(mm);
  const seconds = Number(ss);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return Number.NaN;
  }
  return hours * 3600 + minutes * 60 + seconds;
}

function parseVttContent(content: string): SubtitleCue[] {
  const lines = content.replace(/\r/g, "").split("\n");
  const cues: SubtitleCue[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      i += 1;
      continue;
    }
    if (line.startsWith("WEBVTT") || line.startsWith("NOTE")) {
      i += 1;
      continue;
    }

    let timingLine = line;
    if (!timingLine.includes("-->") && i + 1 < lines.length) {
      timingLine = lines[i + 1].trim();
      i += 1;
    }
    if (!timingLine.includes("-->")) {
      i += 1;
      continue;
    }

    const [startRaw, rightSide] = timingLine.split("-->");
    const endRaw = rightSide?.trim().split(/\s+/)[0] ?? "";
    const start = parseVttTimestamp(startRaw);
    const end = parseVttTimestamp(endRaw);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      i += 1;
      continue;
    }

    i += 1;
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== "") {
      textLines.push(lines[i].trim());
      i += 1;
    }

    const rawText = textLines.join("\n").replace(/<[^>]+>/g, "");
    const text = decodeHtmlEntities(rawText).replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
    if (text) {
      cues.push({ start, end, text });
    }
  }

  return cues;
}

async function requestElementFullscreen(element: FullscreenCapableElement): Promise<boolean> {
  if (typeof element.requestFullscreen === "function") {
    await element.requestFullscreen({ navigationUI: "hide" });
    return true;
  }
  if (typeof element.webkitRequestFullscreen === "function") {
    await element.webkitRequestFullscreen();
    return true;
  }
  return false;
}

async function exitAnyFullscreen(): Promise<boolean> {
  const fullscreenDocument = document as FullscreenCapableDocument;
  if (typeof document.exitFullscreen === "function") {
    await document.exitFullscreen();
    return true;
  }
  if (typeof fullscreenDocument.webkitExitFullscreen === "function") {
    await fullscreenDocument.webkitExitFullscreen();
    return true;
  }
  return false;
}

function getFullscreenElement(): Element | null {
  const fullscreenDocument = document as FullscreenCapableDocument;
  return document.fullscreenElement ?? fullscreenDocument.webkitFullscreenElement ?? null;
}

const CAPTIONS_PREF_KEY = "aceon:captions-enabled";
// YouTube loads the captions module (and fires onApiChange) shortly after
// playback starts. If nothing arrives within this window, the video has no
// caption tracks.
const NATIVE_CAPTIONS_DETECT_MS = 5000;

function readCaptionsPreference(): boolean {
  try {
    return window.localStorage.getItem(CAPTIONS_PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

function writeCaptionsPreference(enabled: boolean) {
  try {
    window.localStorage.setItem(CAPTIONS_PREF_KEY, enabled ? "on" : "off");
  } catch {
    // Storage unavailable (private mode, blocked site data): keep in-memory state only.
  }
}

function hasNativeCaptionTracks(player: YTPlayer): boolean {
  try {
    const tracks = player.getOption?.("captions", "tracklist");
    return Array.isArray(tracks) && tracks.length > 0;
  } catch {
    return false;
  }
}

function setNativeCaptions(player: YTPlayer, enabled: boolean) {
  try {
    if (enabled) {
      player.loadModule?.("captions");
    } else {
      player.unloadModule?.("captions");
    }
  } catch (error) {
    console.warn("Failed to toggle YouTube captions", error);
  }
}

// Track if API script is loaded
let apiLoaded = false;
let apiLoading = false;
const apiReadyCallbacks: (() => void)[] = [];

/**
 * Helper to load the YouTube IFrame API script.
 * Ensures the script is loaded only once and handles multiple concurrent requests.
 * 
 * @returns Promise that resolves when window.YT is available.
 */
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded && window.YT) {
      resolve();
      return;
    }

    apiReadyCallbacks.push(resolve);

    if (apiLoading) return;
    apiLoading = true;

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      apiReadyCallbacks.forEach((cb) => cb());
      apiReadyCallbacks.length = 0;
    };
  });
}

/**
 * VideoPlayer - A robust YouTube player wrapper using the IFrame Player API.
 * 
 * **Context**: core component for the lecture viewing experience. It replaces standard 
 * iframe embeds to allow programmatic control, state tracking, and progress monitoring.
 * 
 * **Integrations**: 
 * - YouTube IFrame API: For playback control and state events.
 * - Convex: Progress updates are sent to backend via `onProgressUpdate` prop.
 * 
 * **State Management**:
 * - Manages its own `YT.Player` instance lifecycle.
 * - Tracks playback progress via 1s interval when playing.
 * - Handles auto-cleanup of player instance on unmount or video change.
 * - Exposes imperative handle (`seekTo`, `getCurrentTime`) for parent control.
 * 
 * **User Flow**:
 * 1. User selects a video -> `videoId` prop changes.
 * 2. Player initializes/reloads with new video.
 * 3. `initialPosition` is used to resume where user left off.
 * 4. While playing, `onProgressUpdate` fires every second.
 * 5. When finished, `onEnded` triggers completion logic.
 * 
 * @param props - Component props.
 * @param props.videoId - The YouTube video ID (e.g., "dQw4w9WgXcQ").
 * @param props.title - Video title (used for accessibility/analytics).
 * @param props.onEnded - Callback fired when video finishes.
 * @param props.onProgressUpdate - Callback fired every second with playback stats.
 * @param props.initialPosition - Start time in seconds (for resuming progress).
 * @param ref - VideoPlayerRef for imperative seeking and time retrieval.
 * @returns A responsive div containing the YouTube IFrame.
 */
const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ videoId, transcriptUrl, onEnded, onPause, onProgressUpdate, initialPosition = 0 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<YTPlayer | null>(null);
    const internalRef = useRef<VideoPlayerRef | null>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const uniqueId = useId();
    const playerIdRef = useRef(`yt-player-${uniqueId.replace(/:/g, '')}`);
    const [isReady, setIsReady] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showPlayIndicator, setShowPlayIndicator] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [volumeTrigger, setVolumeTrigger] = useState(0);
    const [showPlaybackHelp, setShowPlaybackHelp] = useState(false);
    const [playerErrorCode, setPlayerErrorCode] = useState<number | null>(null);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [showBrowserFixes, setShowBrowserFixes] = useState(false);
    const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
    const [hasSubtitleTrack, setHasSubtitleTrack] = useState(false);
    // User preference, shared by both caption sources. On by default; persisted
    // across lectures once the user toggles it.
    const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
    // YouTube's own caption tracks: null until detected after playback starts.
    const [nativeCaptionsAvailable, setNativeCaptionsAvailable] = useState<boolean | null>(null);
    const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
    const subtitlesEnabledRef = useRef(subtitlesEnabled);
    const hasSubtitleTrackRef = useRef(hasSubtitleTrack);
    const nativeCaptionsDetectedRef = useRef(false);
    const nativeCaptionsDetectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const pendingSeekRef = useRef<number | null>(null);
    const pendingPlaybackRateRef = useRef<number | null>(null);
    const playIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const playAttemptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Derived state to track initial position for the current video
    // This allows us to ignore initialPosition prop updates unless videoId changes
    const [videoState, setVideoState] = useState({ videoId, initialPosition });
    
    if (videoState.videoId !== videoId) {
      setVideoState({ videoId, initialPosition });
    }
    
    const onEndedRef = useRef(onEnded);
    const onPauseRef = useRef(onPause);
    const onProgressUpdateRef = useRef(onProgressUpdate);
    
    useEffect(() => {
      onEndedRef.current = onEnded;
    }, [onEnded]);
    
    useEffect(() => {
      onPauseRef.current = onPause;
    }, [onPause]);
    
    useEffect(() => {
      onProgressUpdateRef.current = onProgressUpdate;
    }, [onProgressUpdate]);

    useEffect(() => {
      let cancelled = false;

      // Reset immediately on video switch so old captions never bleed into the
      // new lecture. Intentional reset-on-dependency-change before the fetch
      // below; not a render-loop hazard.
      /* eslint-disable react-hooks/set-state-in-effect */
      setSubtitleCues([]);
      setHasSubtitleTrack(false);
      setActiveSubtitle(null);
      /* eslint-enable react-hooks/set-state-in-effect */

      const loadFromSource = async (source: string) => {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`Subtitle fetch failed: ${response.status}`);
        return response.text();
      };

      const loadSubtitles = async () => {
        const fallbackSource = `/api/subtitles?youtubeId=${encodeURIComponent(videoId)}`;
        const hasStoredTranscriptUrl = Boolean(transcriptUrl && transcriptUrl.trim().length > 0);

        try {
          let text: string;
          if (hasStoredTranscriptUrl) {
            try {
              text = await loadFromSource(transcriptUrl!);
            } catch (storedUrlError) {
              console.warn("Stored transcript URL failed, falling back to subtitle API", storedUrlError);
              text = await loadFromSource(fallbackSource);
            }
          } else {
            text = await loadFromSource(fallbackSource);
          }

          if (cancelled) return;
          const parsed = parseVttContent(text);
          setSubtitleCues(parsed);
          setHasSubtitleTrack(parsed.length > 0);
          setActiveSubtitle(null);
        } catch (error) {
          if (!cancelled) {
            // Not fatal: YouTube's own caption tracks are used instead.
            console.warn("Failed to load subtitles", error);
            setSubtitleCues([]);
            setHasSubtitleTrack(false);
            setActiveSubtitle(null);
          }
        }
      };

      loadSubtitles();
      return () => {
        cancelled = true;
      };
    }, [transcriptUrl, videoId]);

    useEffect(() => {
      if (!subtitlesEnabled || subtitleCues.length === 0 || !isReady) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional clear when captions are off/unavailable
        setActiveSubtitle(null);
        return;
      }

      const interval = window.setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime() ?? 0;
        const cue = subtitleCues.find((item) => currentTime >= item.start && currentTime <= item.end);
        setActiveSubtitle(cue?.text ?? null);
      }, 200);

      return () => window.clearInterval(interval);
    }, [isReady, subtitleCues, subtitlesEnabled]);

    useEffect(() => {
      // Read the stored preference after mount so SSR markup stays deterministic.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
      setSubtitlesEnabled(readCaptionsPreference());
    }, []);

    const updateSubtitlesEnabled = useCallback((enabled: boolean) => {
      // Update the ref synchronously so back-to-back toggles see the latest value.
      subtitlesEnabledRef.current = enabled;
      setSubtitlesEnabled(enabled);
      writeCaptionsPreference(enabled);
    }, []);

    const toggleSubtitlesEnabled = useCallback(() => {
      const next = !subtitlesEnabledRef.current;
      updateSubtitlesEnabled(next);
      return next;
    }, [updateSubtitlesEnabled]);

    /**
     * YouTube's built-in captions are the fallback when no stored VTT track
     * exists. They render inside the iframe, so they must be off whenever the
     * custom overlay is in use, or the user would see captions twice. This
     * does not wait for track detection: suppression must work even if the
     * tracklist option is unreadable.
     */
    const syncNativeCaptions = useCallback(() => {
      const player = playerRef.current;
      if (!player) return;
      setNativeCaptions(player, subtitlesEnabledRef.current && !hasSubtitleTrackRef.current);
    }, []);

    const clearNativeCaptionsDetectTimeout = useCallback(() => {
      if (nativeCaptionsDetectTimeoutRef.current) {
        clearTimeout(nativeCaptionsDetectTimeoutRef.current);
        nativeCaptionsDetectTimeoutRef.current = null;
      }
    }, []);

    /** Returns true once YouTube reports caption tracks for the current player. */
    const detectNativeCaptions = useCallback(() => {
      if (nativeCaptionsDetectedRef.current) return true;
      const player = playerRef.current;
      if (!player || !hasNativeCaptionTracks(player)) return false;
      nativeCaptionsDetectedRef.current = true;
      clearNativeCaptionsDetectTimeout();
      setNativeCaptionsAvailable(true);
      return true;
    }, [clearNativeCaptionsDetectTimeout]);

    useEffect(() => {
      subtitlesEnabledRef.current = subtitlesEnabled;
      hasSubtitleTrackRef.current = hasSubtitleTrack;
      syncNativeCaptions();
    }, [subtitlesEnabled, hasSubtitleTrack, syncNativeCaptions]);

    // Captions stay toggleable until we know the video has none at all.
    const subtitlesAvailable = hasSubtitleTrack || nativeCaptionsAvailable !== false;

    // Create the imperative handle object
    const imperativeHandle: VideoPlayerRef = {
      seekTo: (seconds: number) => {
        if (isReady && playerRef.current) {
          playerRef.current.seekTo(seconds, true);
        } else {
          pendingSeekRef.current = seconds;
        }
      },
      getCurrentTime: () => {
        return playerRef.current?.getCurrentTime() ?? 0;
      },
      getDuration: () => {
        return playerRef.current?.getDuration() ?? 0;
      },
      play: () => {
        if (isReady && playerRef.current) {
          playerRef.current.playVideo();
        }
      },
      pause: () => {
        if (isReady && playerRef.current) {
          playerRef.current.pauseVideo();
        }
      },
      isPlaying: () => {
        if (!playerRef.current) return false;
        return playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING;
      },
      getVolume: () => {
        return playerRef.current?.getVolume() ?? 100;
      },
      setVolume: (newVolume: number) => {
        if (isReady && playerRef.current) {
          playerRef.current.setVolume(newVolume);
          setVolume(newVolume);
          setVolumeTrigger((t) => t + 1);
        }
      },
      isMuted: () => {
        return playerRef.current?.isMuted() ?? false;
      },
      mute: () => {
        if (isReady && playerRef.current) {
          playerRef.current.mute();
          setIsMuted(true);
          setVolumeTrigger((t) => t + 1);
        }
      },
      unmute: () => {
        if (isReady && playerRef.current) {
          playerRef.current.unMute();
          setIsMuted(false);
          setVolumeTrigger((t) => t + 1);
        }
      },
      getPlaybackRate: () => {
        return playerRef.current?.getPlaybackRate() ?? 1;
      },
      setPlaybackRate: (rate: number) => {
        // Always store pending rate - apply when ready or store for later
        pendingPlaybackRateRef.current = rate;
        if (isReady && playerRef.current) {
          playerRef.current.setPlaybackRate(rate);
        }
      },
      toggleSubtitles: () => {
        if (!subtitlesAvailable) return null;
        return toggleSubtitlesEnabled();
      },
      toggleFullscreen: async () => {
        if (getFullscreenElement()) {
          return exitAnyFullscreen();
        }

        const container = containerRef.current;
        const iframe = playerRef.current?.getIframe?.() ?? null;

        try {
          if (container && (await requestElementFullscreen(container))) {
            return true;
          }
        } catch (error) {
          console.error(error);
        }

        if (iframe) {
          try {
            return await requestElementFullscreen(iframe);
          } catch (error) {
            console.error(error);
          }
        }

        return false;
      },
    };

    // Expose to forwarded ref
    useImperativeHandle(ref, () => imperativeHandle, [isReady, subtitlesAvailable, toggleSubtitlesEnabled]);
    
    // Sync internal ref in effect (not during render)
    useEffect(() => {
      internalRef.current = imperativeHandle;
    });

    const startProgressTracking = useCallback(() => {
      if (progressIntervalRef.current) return;

      progressIntervalRef.current = setInterval(() => {
        if (!playerRef.current || !onProgressUpdateRef.current) return;

        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();

        if (duration > 0) {
          onProgressUpdateRef.current({
            played: currentTime / duration,
            playedSeconds: currentTime,
          });
        }
      }, 1000);
    }, []);

    const stopProgressTracking = useCallback(() => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, []);

    const clearPlayAttemptTimeout = useCallback(() => {
      if (playAttemptTimeoutRef.current) {
        clearTimeout(playAttemptTimeoutRef.current);
        playAttemptTimeoutRef.current = null;
      }
    }, []);

    useEffect(() => {
      // Ensure playback-error overlays from the previous lecture do not persist
      // when the user navigates to a different video. Intentional
      // reset-on-videoId-change, not a render-loop hazard.
      clearPlayAttemptTimeout();
      /* eslint-disable react-hooks/set-state-in-effect */
      setShowPlaybackHelp(false);
      setPlayerErrorCode(null);
      setShowBrowserFixes(false);
      setNativeCaptionsAvailable(null);
      /* eslint-enable react-hooks/set-state-in-effect */
    }, [videoId, clearPlayAttemptTimeout]);

    const beginPlayAttemptCheck = useCallback(() => {
      clearPlayAttemptTimeout();
      setShowPlaybackHelp(false);
      playAttemptTimeoutRef.current = setTimeout(() => {
        const player = playerRef.current;
        if (!player || !window.YT) return;
        const isActuallyPlaying = player.getPlayerState() === window.YT.PlayerState.PLAYING;
        if (!isActuallyPlaying && player.getCurrentTime() < 1) {
          setShowPlaybackHelp(true);
        }
      }, 4500);
    }, [clearPlayAttemptTimeout]);

    /**
     * Handle click on the overlay to toggle play/pause.
     * This prevents the iframe from receiving focus while still controlling playback.
     */
    const handleOverlayClick = useCallback(() => {
      if (!isReady || !playerRef.current) return;
      
      const state = playerRef.current.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
        clearPlayAttemptTimeout();
      } else {
        beginPlayAttemptCheck();
        playerRef.current.playVideo();
      }
      
      // Show brief play/pause indicator
      setShowPlayIndicator(true);
      if (playIndicatorTimeoutRef.current) {
        clearTimeout(playIndicatorTimeoutRef.current);
      }
      playIndicatorTimeoutRef.current = setTimeout(() => {
        setShowPlayIndicator(false);
      }, 900);
    }, [beginPlayAttemptCheck, clearPlayAttemptTimeout, isReady]);

    const handlePlayFromOverlay = useCallback(() => {
      if (!isReady || !playerRef.current) return;
      beginPlayAttemptCheck();
      playerRef.current.playVideo();
    }, [beginPlayAttemptCheck, isReady]);

    const handleRetryAfterVerification = useCallback(() => {
      clearPlayAttemptTimeout();
      setShowPlaybackHelp(false);
      setPlayerErrorCode(null);
      setReloadNonce((prev) => prev + 1);
    }, [clearPlayAttemptTimeout]);

    // Cleanup play indicator timeout on unmount
    useEffect(() => {
      return () => {
        if (playIndicatorTimeoutRef.current) {
          clearTimeout(playIndicatorTimeoutRef.current);
        }
        clearPlayAttemptTimeout();
      };
    }, [clearPlayAttemptTimeout]);

    useEffect(() => {
      let mounted = true;

      const initPlayer = async () => {
        await loadYouTubeAPI();

        if (!mounted) return;

        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }

        const container = iframeContainerRef.current;
        if (!container) return;

        container.innerHTML = `<div id="${playerIdRef.current}"></div>`;
        // A new player instance (video switch or retry) starts detection over.
        nativeCaptionsDetectedRef.current = false;
        clearNativeCaptionsDetectTimeout();
        setNativeCaptionsAvailable(null);

        playerRef.current = new window.YT.Player(playerIdRef.current, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 1,
            playsinline: 1,
            start: Math.floor(videoState.initialPosition),
            disablekb: 1,
            // Always load the captions module so we can detect tracks;
            // syncNativeCaptions turns it off again when the user opted out.
            cc_load_policy: 1,
            cc_lang_pref: "en",
          },
          events: {
            onReady: () => {
              setIsReady(true);
              const iframe = playerRef.current?.getIframe?.();
              if (iframe) {
                iframe.setAttribute(
                  "allow",
                  "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                );
                iframe.setAttribute("allowfullscreen", "");
                iframe.setAttribute("webkitallowfullscreen", "");
              }
              if (pendingSeekRef.current !== null && playerRef.current) {
                playerRef.current.seekTo(pendingSeekRef.current, true);
                pendingSeekRef.current = null;
              }
              if (pendingPlaybackRateRef.current !== null && playerRef.current) {
                playerRef.current.setPlaybackRate(pendingPlaybackRateRef.current);
                // Don't clear - keep as "preferred rate" for subsequent video changes
              }
            },
            onStateChange: (event) => {
              const state = event.data;

              if (state === window.YT.PlayerState.BUFFERING) {
                setIsBuffering(true);
              } else {
                setIsBuffering(false);
              }

              if (state === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                setShowPlaybackHelp(false);
                setPlayerErrorCode(null);
                clearPlayAttemptTimeout();
                startProgressTracking();
                // YouTube re-applies captions (cc_load_policy or its own sticky
                // setting) when playback starts or restarts, so re-assert ours.
                syncNativeCaptions();
                // Probe on every PLAYING too: track metadata can become readable
                // after onApiChange, and a late hit recovers from a timed-out miss.
                if (!detectNativeCaptions() && !nativeCaptionsDetectTimeoutRef.current) {
                  nativeCaptionsDetectTimeoutRef.current = setTimeout(() => {
                    nativeCaptionsDetectTimeoutRef.current = null;
                    if (!detectNativeCaptions()) {
                      setNativeCaptionsAvailable(false);
                    }
                  }, NATIVE_CAPTIONS_DETECT_MS);
                }
              } else {
                setIsPlaying(false);
                stopProgressTracking();
              }

              if (state === window.YT.PlayerState.PAUSED && playerRef.current) {
                const currentTime = playerRef.current.getCurrentTime();
                onPauseRef.current?.(currentTime);
              }

              if (state === window.YT.PlayerState.ENDED) {
                onEndedRef.current?.();
              }
            },
            onError: (event) => {
              setPlayerErrorCode(event.data ?? null);
              setShowPlaybackHelp(true);
              clearPlayAttemptTimeout();
            },
            onApiChange: () => {
              detectNativeCaptions();
              syncNativeCaptions();
            },
          },
        });
      };

      initPlayer();

      return () => {
        mounted = false;
        stopProgressTracking();
        clearPlayAttemptTimeout();
        clearNativeCaptionsDetectTimeout();
        if (playerRef.current) {
          playerRef.current.destroy();
          playerRef.current = null;
        }
        setIsReady(false);
        pendingSeekRef.current = null;
      };
    }, [videoId, reloadNonce, clearPlayAttemptTimeout, clearNativeCaptionsDetectTimeout, detectNativeCaptions, startProgressTracking, stopProgressTracking, syncNativeCaptions, videoState.initialPosition]);

    return (
      <div
        ref={containerRef}
        className="group relative w-full aspect-video max-h-[52dvh] overflow-hidden bg-black transition-all duration-500 fullscreen:h-full fullscreen:w-full fullscreen:max-h-none fullscreen:aspect-auto sm:max-h-none"
      >
        {/* YouTube iframe container */}
        <div
          ref={iframeContainerRef}
          className={`absolute inset-0 z-10 [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full ${
            showPlaybackHelp ? "pointer-events-none opacity-20" : ""
          }`}
        />
        
        {!showPlaybackHelp && (
          <>
            {/* Transparent click overlay - intercepts clicks to prevent iframe focus */}
            <button
              type="button"
              onClick={handleOverlayClick}
              className="absolute inset-0 z-20 cursor-pointer bg-transparent border-none outline-none focus:outline-none"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              tabIndex={-1}
            />
        
            {/* Play/Pause indicator - shows briefly on click (shows the action that will happen) */}
            {showPlayIndicator && !isBuffering && (
              <div
                className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-indicator-pop"
              >
                {/* White icon - show opposite of current state = the action available */}
                {isPlaying ? (
                  <AngularPauseIcon 
                    className="w-16 h-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
                    fill="white" 
                  />
                ) : (
                  <AngularPlayIcon 
                    className="w-16 h-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" 
                    fill="white" 
                  />
                )}
              </div>
            )}
        
            {/* Center play button overlay - shows when paused */}
            <PlayerOverlay
              isReady={isReady}
              isPlaying={isPlaying}
              isBuffering={isBuffering}
              showPlayButton={!showPlayIndicator}
              onPlay={handlePlayFromOverlay}
            />
        
            {/* Custom player controls */}
        <PlayerControls
          playerRef={internalRef}
          isPlaying={isPlaying}
          isReady={isReady}
          onPlayPause={handleOverlayClick}
          videoId={videoId}
          subtitlesAvailable={subtitlesAvailable}
          subtitlesEnabled={subtitlesEnabled}
          onToggleSubtitles={toggleSubtitlesEnabled}
        />
          </>
        )}
        
        {/* Volume indicator overlay - shows on volume change */}
        <VolumeIndicator
          volume={volume}
          isMuted={isMuted}
          trigger={volumeTrigger}
        />
        
        <LandscapeHint isReady={isReady} />

        {subtitlesEnabled && activeSubtitle && (
          <div className="pointer-events-none absolute inset-x-4 bottom-20 z-40 flex justify-center sm:bottom-24">
            <div className="max-w-[90%] border border-white/30 bg-black/75 px-3 py-2 text-center text-sm font-semibold leading-relaxed text-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:text-base">
              {activeSubtitle}
            </div>
          </div>
        )}

        {showPlaybackHelp && (
          <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/85 p-4">
            <div className="w-full max-w-lg border border-white/20 bg-black/90 p-4 text-white shadow-lg backdrop-blur-sm">
            <p className="font-display text-sm font-bold uppercase tracking-wide">
              Playback blocked by YouTube
            </p>
            <p className="mt-1 text-xs text-white/75">
              This can happen due to YouTube bot checks, sign-in requirements, VPN/proxy filtering, or network/IP reputation.
              {playerErrorCode !== null ? ` (Error code: ${playerErrorCode})` : ""}
            </p>
            <p className="mt-2 text-xs text-amber-300/90">
              If YouTube opens fine in another tab but this embed still fails, your browser is likely blocking third-party cookies or cross-site storage for embedded YouTube.
            </p>
            <ol className="mt-2 space-y-1 text-[11px] text-white/75">
              <li>1. Open YouTube and complete sign-in/verification in this browser profile.</li>
              <li>2. Allow third-party cookie exceptions for YouTube/Google domains.</li>
              <li>3. Return to Aceon and click retry.</li>
            </ol>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[36px] items-center justify-center border border-primary/60 bg-primary/20 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary/30"
              >
                Verify on YouTube
              </a>
              <button
                type="button"
                onClick={handleRetryAfterVerification}
                className="inline-flex min-h-[36px] items-center justify-center border border-white/30 bg-white/10 px-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/20"
              >
                I verified, retry
              </button>
              <button
                type="button"
                onClick={() => setShowBrowserFixes((prev) => !prev)}
                className="inline-flex min-h-[36px] items-center justify-center border border-white/20 px-3 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white"
              >
                {showBrowserFixes ? "Hide browser fixes" : "Show browser fixes"}
              </button>
              <button
                type="button"
                onClick={() => setShowPlaybackHelp(false)}
                className="inline-flex min-h-[36px] items-center justify-center border border-white/20 px-3 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white"
              >
                Dismiss
              </button>
            </div>
            {showBrowserFixes && (
              <div className="mt-3 border border-white/15 bg-white/5 p-3 text-[11px] text-white/75">
                <p className="font-bold uppercase tracking-wide text-white/85">Browser Fixes</p>
                <ul className="mt-2 space-y-1">
                  <li>Chrome/Chromium: Settings → Privacy and security → Third-party cookies → Sites allowed to use third-party cookies. Add: [*.]youtube.com, [*.]google.com, [*.]ytimg.com, [*.]googlevideo.com.</li>
                  <li>Brave: Click the lion icon → Shields down for this site (or Cookies: Allow all cookies), then reload this page.</li>
                  <li>Firefox: Click the shield icon in address bar → Turn off Enhanced Tracking Protection for this site, then reload.</li>
                  <li>Safari (macOS): Safari → Settings → Privacy → temporarily uncheck “Prevent cross-site tracking”, reload, then retry.</li>
                  <li>Any browser: disable VPN/proxy/ad-block for this page and retry.</li>
                </ul>
                <p className="mt-2 text-white/65">
                  Important: avoid accidental trailing spaces in domain entries (for example `%20`), or the exception will not match.
                </p>
                <p className="mt-1 text-white/65">
                  If restrictions are enforced by your organization/device policy, continue via “Verify on YouTube”.
                </p>
              </div>
            )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

export default VideoPlayer;
