/**
 * Comment type definitions for the application.
 *
 * Matches the backend Comment model structure.
 */

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
}

export interface CommentUpdate {
  content: string;
}
