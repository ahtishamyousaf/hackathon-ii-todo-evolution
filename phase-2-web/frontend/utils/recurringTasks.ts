import type { Task, TaskCreate } from "@/types/task";

/**
 * Calculate the next occurrence date for a recurring task
 */
export function calculateNextOccurrence(
  currentDate: Date,
  pattern: "daily" | "weekly" | "monthly" | "yearly",
  interval: number
): Date {
  const nextDate = new Date(currentDate);

  switch (pattern) {
    case "daily":
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case "weekly":
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;
    case "monthly":
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case "yearly":
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
  }

  return nextDate;
}

/**
 * Check if a recurring task should generate a new instance
 */
export function shouldGenerateNextInstance(task: Task): boolean {
  // Must be recurring and completed
  if (!task.is_recurring || !task.completed) {
    return false;
  }

  // Must have valid recurrence settings
  if (
    !task.recurrence_pattern ||
    !task.recurrence_interval ||
    task.recurrence_interval < 1
  ) {
    return false;
  }

  // Check if end date has passed
  if (task.recurrence_end_date) {
    const endDate = new Date(task.recurrence_end_date);
    const now = new Date();
    if (now > endDate) {
      return false;
    }
  }

  return true;
}

/**
 * Generate a new task instance from a completed recurring task
 */
export function generateNextInstance(task: Task): TaskCreate {
  if (!task.recurrence_pattern || !task.recurrence_interval) {
    throw new Error("Invalid recurrence settings");
  }

  // Validate pattern type
  const validPatterns = ["daily", "weekly", "monthly", "yearly"] as const;
  if (!validPatterns.includes(task.recurrence_pattern as any)) {
    throw new Error("Invalid recurrence pattern");
  }

  // Calculate next due date
  const currentDueDate = task.due_date ? new Date(task.due_date) : new Date();
  const nextDueDate = calculateNextOccurrence(
    currentDueDate,
    task.recurrence_pattern as "daily" | "weekly" | "monthly" | "yearly",
    task.recurrence_interval
  );

  // Check if next occurrence is beyond end date
  if (task.recurrence_end_date) {
    const endDate = new Date(task.recurrence_end_date);
    if (nextDueDate > endDate) {
      throw new Error("Next occurrence is beyond recurrence end date");
    }
  }

  // Create new task with same properties but not completed
  const newTask: TaskCreate = {
    title: task.title,
    description: task.description || undefined,
    priority: task.priority,
    category_id: task.category_id || undefined,
    due_date: nextDueDate.toISOString().split("T")[0],
    is_recurring: true,
    recurrence_pattern: task.recurrence_pattern,
    recurrence_interval: task.recurrence_interval,
    recurrence_end_date: task.recurrence_end_date || undefined,
    completed: false,
  };

  return newTask;
}

/**
 * Process all tasks and generate new instances for completed recurring tasks
 */
export function processRecurringTasks(tasks: Task[]): TaskCreate[] {
  const newInstances: TaskCreate[] = [];

  for (const task of tasks) {
    if (shouldGenerateNextInstance(task)) {
      try {
        const newInstance = generateNextInstance(task);
        newInstances.push(newInstance);
      } catch (err) {
        console.error(`Failed to generate next instance for task ${task.id}:`, err);
      }
    }
  }

  return newInstances;
}

/**
 * Get human-readable recurrence description
 */
export function getRecurrenceDescription(
  pattern: string | null,
  interval: number | null
): string {
  if (!pattern || !interval) return "";

  const intervalText = interval > 1 ? `every ${interval}` : "every";

  switch (pattern) {
    case "daily":
      return `Repeats ${intervalText} ${interval > 1 ? "days" : "day"}`;
    case "weekly":
      return `Repeats ${intervalText} ${interval > 1 ? "weeks" : "week"}`;
    case "monthly":
      return `Repeats ${intervalText} ${interval > 1 ? "months" : "month"}`;
    case "yearly":
      return `Repeats ${intervalText} ${interval > 1 ? "years" : "year"}`;
    default:
      return "";
  }
}

/**
 * Hook to auto-process recurring tasks
 * Call this periodically or when tasks are updated
 */
export async function autoGenerateRecurringTasks(
  tasks: Task[],
  createTask: (task: TaskCreate) => Promise<Task>
): Promise<Task[]> {
  const newInstances = processRecurringTasks(tasks);
  const createdTasks: Task[] = [];

  for (const instance of newInstances) {
    try {
      const created = await createTask(instance);
      createdTasks.push(created);
    } catch (err) {
      console.error("Failed to create recurring task instance:", err);
    }
  }

  return createdTasks;
}
