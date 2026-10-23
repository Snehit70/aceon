import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  PLAYBACK_RATES,
  closestRateIndex,
  parseSettings,
  sanitizeSettings,
} from "./settings";

describe("sanitizeSettings", () => {
  it("returns defaults for empty or non-object input", () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings("nope")).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps valid values and drops unknown keys", () => {
    const result = sanitizeSettings({ defaultPlaybackRate: 1.5, seekStepSeconds: 5, extra: true });
    expect(result.defaultPlaybackRate).toBe(1.5);
    expect(result.seekStepSeconds).toBe(5);
    expect(result).not.toHaveProperty("extra");
  });

  it("falls back per field when a value is out of range or the wrong type", () => {
    const result = sanitizeSettings({
      defaultPlaybackRate: 9,
      autoplayCountdownSeconds: "10",
      resumePlayback: "yes",
      captionsDefault: true,
    });
    expect(result.defaultPlaybackRate).toBe(DEFAULT_SETTINGS.defaultPlaybackRate);
    expect(result.autoplayCountdownSeconds).toBe(DEFAULT_SETTINGS.autoplayCountdownSeconds);
    expect(result.resumePlayback).toBe(DEFAULT_SETTINGS.resumePlayback);
    expect(result.captionsDefault).toBe(true);
  });

  it("allows 0 for controlsHideSeconds (never hide)", () => {
    expect(sanitizeSettings({ controlsHideSeconds: 0 }).controlsHideSeconds).toBe(0);
  });
});

describe("parseSettings", () => {
  it("returns defaults for null and malformed JSON", () => {
    expect(parseSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(parseSettings("{not json")).toEqual(DEFAULT_SETTINGS);
  });

  it("parses stored JSON", () => {
    expect(parseSettings(JSON.stringify({ autoplayNext: false })).autoplayNext).toBe(false);
  });
});

describe("closestRateIndex", () => {
  it("finds exact and nearest rates", () => {
    expect(PLAYBACK_RATES[closestRateIndex(1.5)]).toBe(1.5);
    expect(PLAYBACK_RATES[closestRateIndex(1.1)]).toBe(1);
    expect(PLAYBACK_RATES[closestRateIndex(3)]).toBe(2);
  });
});
