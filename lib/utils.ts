import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanCourseTitle(title: string): string {
  // Removes "Jan 2025 - ", "Jan 2025-", "Jan 2025 ", etc.
  return title.replace(/^(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*[\s\t]+\d{4}(?:[\s\t]*[-–—][\s\t]*|[\s\t]+)/i, "").trim();
}
