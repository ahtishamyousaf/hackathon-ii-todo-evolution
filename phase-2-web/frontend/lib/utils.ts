/**
 * Utility functions for the application.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence.
 *
 * Uses clsx to handle conditional classes and twMerge to
 * resolve Tailwind class conflicts.
 *
 * @example
 * cn("px-4 py-2", "bg-blue-500") // "px-4 py-2 bg-blue-500"
 * cn("px-4", "px-6") // "px-6" (later value wins)
 * cn("px-4", condition && "py-2") // "px-4 py-2" or "px-4"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a human-readable format.
 *
 * @example
 * formatDate("2025-01-15T10:30:00") // "Jan 15, 2025"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string to a relative time format.
 *
 * @example
 * formatRelativeTime("2025-01-15T10:30:00") // "2 hours ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  return formatDate(d);
}

/**
 * Truncate a string to a maximum length.
 *
 * @example
 * truncate("Hello World", 8) // "Hello..."
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Debounce a function call.
 *
 * @example
 * const debouncedSearch = debounce((query) => search(query), 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
