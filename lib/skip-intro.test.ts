import { describe, expect, it } from "vitest";
import { introSkipTarget, isInIntro, shouldAutoSkipIntro } from "./skip-intro";

describe("isInIntro", () => {
  it("is true only before the intro duration on a long lecture", () => {
    expect(isInIntro(0, 10, 1800)).toBe(true);
    expect(isInIntro(9.9, 10, 1800)).toBe(true);
    expect(isInIntro(10, 10, 1800)).toBe(false);
    expect(isInIntro(40, 10, 1800)).toBe(false);
  });

  it("rejects short clips that are not longer than the intro", () => {
    expect(isInIntro(0, 10, 8)).toBe(false);
    expect(isInIntro(0, 10, 11)).toBe(false);
    expect(isInIntro(0, 10, 12)).toBe(true);
  });

  it("treats unknown duration as a normal lecture", () => {
    expect(isInIntro(2, 10, 0)).toBe(true);
    expect(isInIntro(12, 10, 0)).toBe(false);
  });

  it("rejects invalid numbers", () => {
    expect(isInIntro(Number.NaN, 10, 100)).toBe(false);
    expect(isInIntro(0, 0, 100)).toBe(false);
    expect(isInIntro(-1, 10, 100)).toBe(false);
  });
});

describe("introSkipTarget", () => {
  it("lands on the intro duration", () => {
    expect(introSkipTarget(10, 1800)).toBe(10);
  });

  it("stays inside a known duration", () => {
    expect(introSkipTarget(30, 20)).toBe(19);
  });
});

describe("shouldAutoSkipIntro", () => {
  it("skips once at the start when the setting is on", () => {
    expect(
      shouldAutoSkipIntro({
        autoSkip: true,
        alreadyAutoSkipped: false,
        currentTime: 0,
        introSeconds: 10,
        duration: 1800,
      }),
    ).toBe(true);
  });

  it("does not skip when the setting is off, after a skip, or past the intro", () => {
    const base = {
      autoSkip: true,
      alreadyAutoSkipped: false,
      currentTime: 0,
      introSeconds: 10,
      duration: 1800,
    };
    expect(shouldAutoSkipIntro({ ...base, autoSkip: false })).toBe(false);
    expect(shouldAutoSkipIntro({ ...base, alreadyAutoSkipped: true })).toBe(false);
    expect(shouldAutoSkipIntro({ ...base, currentTime: 25 })).toBe(false);
  });
});
