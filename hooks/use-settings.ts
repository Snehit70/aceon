"use client";

import { useState, useCallback } from "react";

export type PlaybackSpeed = 1 | 1.25 | 1.5 | 1.75 | 2;
export type SeekInterval = 5 | 10 | 15 | 30;
export type AutoplayDelay = 3 | 5 | 10 | 15;

export interface UserSettings {
  defaultPlaybackSpeed: PlaybackSpeed;
  autoplayEnabled: boolean;
  autoplayDelay: AutoplayDelay;
  seekInterval: SeekInterval;
  rememberVolume: boolean;
  defaultVolume: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultPlaybackSpeed: 1,
  autoplayEnabled: true,
  autoplayDelay: 10,
  seekInterval: 10,
  rememberVolume: true,
  defaultVolume: 100,
};

const STORAGE_KEY = "aceon-settings";

function getStoredSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn("Failed to load settings", e);
  }
  return DEFAULT_SETTINGS;
}

function storeSettings(settings: UserSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save settings", e);
  }
}

export function useSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(() => getStoredSettings());

  const setSettings = useCallback((updater: (prev: UserSettings) => UserSettings) => {
    setSettingsState((prev) => {
      const next = updater(prev);
      storeSettings(next);
      return next;
    });
  }, []);

  const setDefaultPlaybackSpeed = useCallback((speed: PlaybackSpeed) => {
    setSettings((prev) => ({ ...prev, defaultPlaybackSpeed: speed }));
  }, [setSettings]);

  const setAutoplayEnabled = useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, autoplayEnabled: enabled }));
  }, [setSettings]);

  const setAutoplayDelay = useCallback((delay: AutoplayDelay) => {
    setSettings((prev) => ({ ...prev, autoplayDelay: delay }));
  }, [setSettings]);

  const setSeekInterval = useCallback((interval: SeekInterval) => {
    setSettings((prev) => ({ ...prev, seekInterval: interval }));
  }, [setSettings]);

  const setRememberVolume = useCallback((remember: boolean) => {
    setSettings((prev) => ({ ...prev, rememberVolume: remember }));
  }, [setSettings]);

  const setDefaultVolume = useCallback((volume: number) => {
    setSettings((prev) => ({ ...prev, defaultVolume: volume }));
  }, [setSettings]);

  const resetToDefaults = useCallback(() => {
    setSettings(() => DEFAULT_SETTINGS);
  }, [setSettings]);

  return {
    settings,
    defaultPlaybackSpeed: settings.defaultPlaybackSpeed,
    autoplayEnabled: settings.autoplayEnabled,
    autoplayDelay: settings.autoplayDelay,
    seekInterval: settings.seekInterval,
    rememberVolume: settings.rememberVolume,
    defaultVolume: settings.defaultVolume,
    setDefaultPlaybackSpeed,
    setAutoplayEnabled,
    setAutoplayDelay,
    setSeekInterval,
    setRememberVolume,
    setDefaultVolume,
    resetToDefaults,
  };
}

export const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 1.25, 1.5, 1.75, 2];
export const SEEK_INTERVALS: SeekInterval[] = [5, 10, 15, 30];
export const AUTOPLAY_DELAYS: AutoplayDelay[] = [3, 5, 10, 15];