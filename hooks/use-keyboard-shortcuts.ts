import { useEffect, useCallback } from "react";

interface KeyboardShortcutsConfig {
  onPlayPause?: () => void;
  onSeekForward?: (seconds: number) => void;
  onSeekBackward?: (seconds: number) => void;
  onVolumeUp?: () => void;
  onVolumeDown?: () => void;
  onMuteToggle?: () => void;
  onFullscreenToggle?: () => void;
  enabled?: boolean;
}

/**
 * Custom hook to handle keyboard shortcuts for the video player.
 * Supports standard shortcuts like Space/K for play/pause, Arrows/J/L for seeking, etc.
 * Automatically ignores shortcuts when typing in input fields.
 *
 * @param config - Configuration object for keyboard actions.
 * @param config.onPlayPause - Callback for play/pause toggle.
 * @param config.onSeekForward - Callback for seeking forward (passes seconds).
 * @param config.onSeekBackward - Callback for seeking backward (passes seconds).
 * @param config.onVolumeUp - Callback for increasing volume.
 * @param config.onVolumeDown - Callback for decreasing volume.
 * @param config.onMuteToggle - Callback for muting/unmuting.
 * @param config.onFullscreenToggle - Callback for toggling fullscreen.
 * @param config.enabled - Whether shortcuts are active (default: true).
 */
export function useKeyboardShortcuts({
  onPlayPause,
  onSeekForward,
  onSeekBackward,
  onVolumeUp,
  onVolumeDown,
  onMuteToggle,
  onFullscreenToggle,
  enabled = true,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInputFocused) return;

      switch (event.key.toLowerCase()) {
        case " ":
        case "k":
          event.preventDefault();
          onPlayPause?.();
          break;
        case "arrowleft":
          event.preventDefault();
          onSeekBackward?.(5);
          break;
        case "arrowright":
          event.preventDefault();
          onSeekForward?.(5);
          break;
        case "j":
          event.preventDefault();
          onSeekBackward?.(10);
          break;
        case "l":
          event.preventDefault();
          onSeekForward?.(10);
          break;
        case "arrowup":
          event.preventDefault();
          onVolumeUp?.();
          break;
        case "arrowdown":
          event.preventDefault();
          onVolumeDown?.();
          break;
        case "m":
          event.preventDefault();
          onMuteToggle?.();
          break;
        case "f":
          event.preventDefault();
          onFullscreenToggle?.();
          break;
      }
    },
    [
      enabled,
      onPlayPause,
      onSeekForward,
      onSeekBackward,
      onVolumeUp,
      onVolumeDown,
      onMuteToggle,
      onFullscreenToggle,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, handleKeyDown]);
}

