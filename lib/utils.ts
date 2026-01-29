import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges class names using `clsx` and `tailwind-merge`.
 * Useful for combining conditional classes and overriding Tailwind styles.
 *
 * @param inputs - List of class values (strings, objects, arrays, etc.).
 * @returns A merged string of class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans a course title by removing term prefixes (e.g., "Jan 2025 - ").
 *
 * @param title - The raw course title.
 * @returns The cleaned title.
 */
export function cleanCourseTitle(title: string): string {
  // Removes "Jan 2025 - ", "Jan 2025-", "Jan 2025 ", etc.
  return title.replace(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[\s\t]+\d{4}(?:[\s\t]*[-–—][\s\t]*|[\s\t]+)/i, "").trim();
}

