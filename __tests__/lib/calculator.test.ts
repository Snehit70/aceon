import { describe, test, expect } from "bun:test";

describe("Grade Calculation Logic", () => {
  const GRADE_POINTS: Record<string, number> = {
    S: 10,
    A: 9,
    B: 8,
    C: 7,
    D: 6,
    E: 4,
    U: 0,
  };

  const calculateSGPA = (courses: { grade: string; credits: number }[]) => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      const points = GRADE_POINTS[course.grade] || 0;
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2));
  };

  test("calculates SGPA correctly for a perfect semester", () => {
    const courses = [
      { grade: "S", credits: 4 },
      { grade: "S", credits: 4 },
    ];
    expect(calculateSGPA(courses)).toBe(10);
  });

  test("calculates SGPA correctly for mixed grades", () => {
    const courses = [
      { grade: "S", credits: 4 }, // 10 * 4 = 40
      { grade: "B", credits: 4 }, // 8 * 4 = 32
    ];
    // Total Points: 72, Total Credits: 8 -> SGPA: 9.0
    expect(calculateSGPA(courses)).toBe(9.0);
  });

  test("handles zero credits gracefully", () => {
      const courses: { grade: string; credits: number }[] = [];
      expect(calculateSGPA(courses)).toBe(0);
  });
});
