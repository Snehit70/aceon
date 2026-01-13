import { describe, test, expect } from "bun:test";

describe("Quiz Scoring Logic", () => {
  const calculateScore = (answers: number[], questions: { correctOption: number }[]) => {
    let correctCount = 0;
    questions.forEach((q, index) => {
        if (answers[index] === q.correctOption) {
            correctCount++;
        }
    });
    return (correctCount / questions.length) * 100;
  };

  test("calculates perfect score correctly", () => {
    const questions = [{ correctOption: 1 }, { correctOption: 0 }];
    const answers = [1, 0];
    expect(calculateScore(answers, questions)).toBe(100);
  });

  test("calculates partial score correctly", () => {
    const questions = [{ correctOption: 1 }, { correctOption: 0 }];
    const answers = [1, 2]; // One wrong
    expect(calculateScore(answers, questions)).toBe(50);
  });

  test("handles skipped questions (invalid option)", () => {
    const questions = [{ correctOption: 1 }, { correctOption: 0 }];
    const answers = [1, -1]; // One skipped
    expect(calculateScore(answers, questions)).toBe(50);
  });

  test("handles zero correct answers", () => {
    const questions = [{ correctOption: 1 }, { correctOption: 0 }];
    const answers = [0, 1]; // All wrong
    expect(calculateScore(answers, questions)).toBe(0);
  });
});
