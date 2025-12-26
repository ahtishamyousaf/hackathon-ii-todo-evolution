/**
 * Advanced search filter parser
 * Supports syntax like:
 * - priority:high, priority:medium, priority:low
 * - is:completed, is:active
 * - due:today, due:tomorrow, due:overdue, due:thisweek
 * - category:name
 */

export interface ParsedFilters {
  text: string; // Remaining text after extracting filters
  priority?: "high" | "medium" | "low";
  status?: "completed" | "active";
  dueDate?: "today" | "tomorrow" | "overdue" | "thisweek";
  category?: string; // Category name to match
}

/**
 * Parse search query and extract filter syntax
 */
export function parseSearchQuery(query: string): ParsedFilters {
  const filters: ParsedFilters = {
    text: query,
  };

  // Extract priority filter
  const priorityMatch = query.match(/priority:(high|medium|low)/i);
  if (priorityMatch) {
    filters.priority = priorityMatch[1].toLowerCase() as "high" | "medium" | "low";
    filters.text = filters.text.replace(priorityMatch[0], "").trim();
  }

  // Extract status filter
  const statusMatch = query.match(/is:(completed|active)/i);
  if (statusMatch) {
    filters.status = statusMatch[1].toLowerCase() as "completed" | "active";
    filters.text = filters.text.replace(statusMatch[0], "").trim();
  }

  // Extract due date filter
  const dueMatch = query.match(/due:(today|tomorrow|overdue|thisweek)/i);
  if (dueMatch) {
    filters.dueDate = dueMatch[1].toLowerCase() as "today" | "tomorrow" | "overdue" | "thisweek";
    filters.text = filters.text.replace(dueMatch[0], "").trim();
  }

  // Extract category filter (match everything after category: until space or end)
  const categoryMatch = query.match(/category:([^\s]+)/i);
  if (categoryMatch) {
    filters.category = categoryMatch[1];
    filters.text = filters.text.replace(categoryMatch[0], "").trim();
  }

  // Clean up extra spaces
  filters.text = filters.text.replace(/\s+/g, " ").trim();

  return filters;
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if a date is this week
 */
export function isThisWeek(date: Date): boolean {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Check if a date is overdue (in the past and not today)
 */
export function isOverdue(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

/**
 * Get display text for active filters (for filter chips)
 */
export function getFilterDisplayText(filters: ParsedFilters): string[] {
  const displayTexts: string[] = [];

  if (filters.priority) {
    displayTexts.push(`Priority: ${filters.priority}`);
  }

  if (filters.status) {
    displayTexts.push(
      filters.status === "completed" ? "Completed tasks" : "Active tasks"
    );
  }

  if (filters.dueDate) {
    const dueTexts = {
      today: "Due today",
      tomorrow: "Due tomorrow",
      overdue: "Overdue tasks",
      thisweek: "Due this week",
    };
    displayTexts.push(dueTexts[filters.dueDate]);
  }

  if (filters.category) {
    displayTexts.push(`Category: ${filters.category}`);
  }

  if (filters.text) {
    displayTexts.push(`Search: "${filters.text}"`);
  }

  return displayTexts;
}
