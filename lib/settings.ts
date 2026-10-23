/**
 * User preferences for the lecture experience.
 *
 * Stored per browser (localStorage). Defaults match the behaviour Aceon had before
 * settings existed, so nothing changes for a user who never opens the settings page.
 */

/** Playback rates offered in the player menu, the +/- shortcuts, and settings. */
export const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2] as const;

export const SEEK_STEP_OPTIONS = [5, 10, 15, 30] as const;
export const CONTROLS_HIDE_OPTIONS = [2, 3, 5, 0] as const;
export const AUTOPLAY_COUNTDOWN_OPTIONS = [3, 5, 10, 15] as const;
export const HOLD_BOOST_OPTIONS = [1.5, 1.75, 2] as const;

export interface Settings {
  /** Speed applied when a lecture loads. */
  defaultPlaybackRate: number;
  /** Speed while Space is held; the previous speed is restored on release. */
  holdBoostRate: number;
  /** Seconds skipped by the left/right arrow keys. */
  seekStepSeconds: number;
  /** Turn captions on automatically when a lecture has a track. */
  captionsDefault: boolean;
  /** Seconds of inactivity before the player controls hide. 0 keeps them visible. */
  controlsHideSeconds: number;
  /** Start lectures from where you last stopped. */
  resumePlayback: boolean;
  /** Offer the next lecture when one ends. */
  autoplayNext: boolean;
  /** Seconds to wait before the next lecture starts. */
  autoplayCountdownSeconds: number;
  /** Ask before marking a whole week or course complete or incomplete. */
  confirmBulkActions: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultPlaybackRate: 1,
  holdBoostRate: 2,
  seekStepSeconds: 10,
  captionsDefault: true,
  controlsHideSeconds: 3,
  resumePlayback: true,
  autoplayNext: true,
  autoplayCountdownSeconds: 10,
  confirmBulkActions: true,
};

export const SETTINGS_STORAGE_KEY = "aceon_settings";

function pickOption<T extends number>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "number" && (options as readonly number[]).includes(value)
    ? (value as T)
    : fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/**
 * Coerces untrusted stored data into a valid Settings object.
 * Unknown keys are dropped and invalid values fall back to their defaults,
 * so a stale or hand-edited entry can never put the player in a bad state.
 */
export function sanitizeSettings(raw: unknown): Settings {
  const input = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    defaultPlaybackRate: pickOption(input.defaultPlaybackRate, PLAYBACK_RATES, d.defaultPlaybackRate),
    holdBoostRate: pickOption(input.holdBoostRate, HOLD_BOOST_OPTIONS, d.holdBoostRate),
    seekStepSeconds: pickOption(input.seekStepSeconds, SEEK_STEP_OPTIONS, d.seekStepSeconds),
    captionsDefault: pickBoolean(input.captionsDefault, d.captionsDefault),
    controlsHideSeconds: pickOption(input.controlsHideSeconds, CONTROLS_HIDE_OPTIONS, d.controlsHideSeconds),
    resumePlayback: pickBoolean(input.resumePlayback, d.resumePlayback),
    autoplayNext: pickBoolean(input.autoplayNext, d.autoplayNext),
    autoplayCountdownSeconds: pickOption(
      input.autoplayCountdownSeconds,
      AUTOPLAY_COUNTDOWN_OPTIONS,
      d.autoplayCountdownSeconds,
    ),
    confirmBulkActions: pickBoolean(input.confirmBulkActions, d.confirmBulkActions),
  };
}

/** Parses a raw localStorage string; null or malformed JSON yields the defaults. */
export function parseSettings(raw: string | null): Settings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Index of the rate closest to `rate`, for stepping through PLAYBACK_RATES. */
export function closestRateIndex(rate: number): number {
  let best = 0;
  for (let i = 1; i < PLAYBACK_RATES.length; i++) {
    if (Math.abs(PLAYBACK_RATES[i] - rate) < Math.abs(PLAYBACK_RATES[best] - rate)) best = i;
  }
  return best;
}
