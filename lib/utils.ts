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


/**
 * Formats a total runtime in seconds as a compact label, e.g. "2h 14m", "2h", "45m".
 * Sub-minute runtimes round up to "1m" so a non-empty group never reads as "0m".
 *
 * @param totalSeconds - Runtime in seconds.
 * @returns A short human-readable duration.
 */
export function formatTotalDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "0m";
  const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
