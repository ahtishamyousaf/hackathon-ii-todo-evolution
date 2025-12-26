/**
 * Task type definitions for the application.
 *
 * Matches the backend Task model structure.
 */

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  category_id: number | null;
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  parent_task_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: number | null;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: number | null;
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
}
