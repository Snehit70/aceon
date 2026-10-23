"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  parseSettings,
  sanitizeSettings,
  type Settings,
} from "@/lib/settings";

// Module-level cache so every consumer shares one parsed snapshot. useSyncExternalStore
// requires getSnapshot to return the same reference until the data actually changes.
let cachedRaw: string | null | undefined;
let cachedSettings: Settings = DEFAULT_SETTINGS;
// Holds the latest value when localStorage is unavailable, so toggles still work this session.
let memoryFallback: Settings | null = null;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  } catch {
    // Storage can throw in private windows or with site data blocked.
    return null;
  }
}

function getSnapshot(): Settings {
  if (memoryFallback) return memoryFallback;
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSettings = parseSettings(raw);
  }
  return cachedSettings;
}

function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // The `storage` event fires in other tabs, so changes made on the settings page
  // reach an open lecture tab without a reload.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === SETTINGS_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function write(next: Settings) {
  try {
    const raw = JSON.stringify(next);
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, raw);
    cachedRaw = raw;
    cachedSettings = next;
    memoryFallback = null;
  } catch {
    memoryFallback = next;
  }
  emit();
}

/**
 * useSettings - Reads and updates the user's lecture preferences.
 *
 * Settings are per browser and apply immediately everywhere via a shared store.
 * Server render and first paint use the defaults, then the stored values take over.
 */
export function useSettings() {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    write(sanitizeSettings({ ...getSnapshot(), ...patch }));
  }, []);

  const resetSettings = useCallback(() => {
    write(DEFAULT_SETTINGS);
  }, []);

  return { settings, updateSettings, resetSettings };
}
