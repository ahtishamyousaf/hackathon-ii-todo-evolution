/**
 * Subtask type definitions for the application.
 *
 * Matches the backend Subtask model structure.
 */

export interface Subtask {
  id: number;
  task_id: number;
  title: string;
  completed: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface SubtaskCreate {
  title: string;
  completed?: boolean;
  order?: number;
}

export interface SubtaskUpdate {
  title?: string;
  completed?: boolean;
  order?: number;
}
