import { describe, expect, it } from "vitest";
import { cleanCourseTitle, cn, formatTotalDuration } from "./utils";

describe("cleanCourseTitle", () => {
  it("removes known month-year prefixes", () => {
    expect(cleanCourseTitle("Jan 2025 - Mathematics for Data Science")).toBe("Mathematics for Data Science");
    expect(cleanCourseTitle("September 2024  Intro to Java")).toBe("Intro to Java");
  });

  it("keeps titles without date prefix unchanged", () => {
    expect(cleanCourseTitle("Programming in Java")).toBe("Programming in Java");
  });
});

describe("cn", () => {
  it("merges class names and resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4", "text-white", { hidden: false, block: true })).toBe("px-4 text-white block");
  });
});

describe("formatTotalDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatTotalDuration(2 * 3600 + 14 * 60)).toBe("2h 14m");
    expect(formatTotalDuration(3 * 3600)).toBe("3h");
  });

  it("formats sub-hour runtimes in minutes", () => {
    expect(formatTotalDuration(45 * 60)).toBe("45m");
    expect(formatTotalDuration(20)).toBe("1m");
  });

  it("returns 0m for empty or invalid input", () => {
    expect(formatTotalDuration(0)).toBe("0m");
    expect(formatTotalDuration(Number.NaN)).toBe("0m");
  });
});
