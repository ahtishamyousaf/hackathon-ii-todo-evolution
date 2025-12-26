/**
 * Date helper utilities for smart date selection.
 *
 * Feature: 005-quick-wins-ux (US2: Smart Due Date Selection)
 */

import { format, addDays, addWeeks, addMonths, startOfDay } from 'date-fns';

/**
 * Get today's date at start of day.
 */
export function getToday(): Date {
  return startOfDay(new Date());
}

/**
 * Get tomorrow's date.
 */
export function getTomorrow(): Date {
  return addDays(getToday(), 1);
}

/**
 * Get date 7 days from now (next week).
 */
export function getNextWeek(): Date {
  return addDays(getToday(), 7);
}

/**
 * Get date 30 days from now (next month).
 */
export function getNextMonth(): Date {
  return addDays(getToday(), 30);
}

/**
 * Format date for display (e.g., "Dec 26, 2025").
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'MMM d, yyyy');
}

/**
 * Format date for input value (YYYY-MM-DD).
 */
export function formatInputDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string to Date object.
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}
