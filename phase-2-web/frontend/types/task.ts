/**
 * Task entity types for task management system.
 *
 * These types match the backend SQLModel schemas:
 * - Task: Complete task entity (database representation)
 * - TaskCreate: Task creation payload
 * - TaskUpdate: Task update payload (all fields optional)
 *
 * Feature: 003-task-crud
 */

export type TaskPriority = "low" | "medium" | "high";

/**
 * Complete Task entity (matches backend TaskRead schema).
 *
 * Includes all fields from database including auto-generated ones.
 * Used for API responses and state management.
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: TaskPriority;
  due_date: string | null;
  category_id: number | null; // Category ID (null = uncategorized)
  is_recurring: boolean;
  recurrence_pattern: string | null;
  recurrence_interval: number | null;
  recurrence_end_date: string | null;
  parent_task_id: number | null;
  sort_order: number | null; // User-defined sort position (null for tasks created before this feature)
  user_id: number;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Task creation payload (matches backend TaskCreate schema).
 *
 * Excludes auto-generated fields (id, user_id, timestamps).
 * User ID is automatically extracted from JWT token by backend.
 */
export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: number | null; // Optional category assignment
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
  sort_order?: number | null; // Optional sort position
}

/**
 * Task update payload (matches backend TaskUpdate schema).
 *
 * All fields are optional to allow partial updates.
 * At least one field should be provided.
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: TaskPriority;
  due_date?: string | null;
  category_id?: number | null; // Optional category change (null = uncategorize)
  is_recurring?: boolean;
  recurrence_pattern?: string | null;
  recurrence_interval?: number;
  recurrence_end_date?: string | null;
  sort_order?: number | null; // Optional sort order update
}

/**
 * API error response structure.
 */
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}
