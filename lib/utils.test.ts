import { describe, expect, it } from "vitest";
import { cleanCourseTitle, cn } from "./utils";

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
