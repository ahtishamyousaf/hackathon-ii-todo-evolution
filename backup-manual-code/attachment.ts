/**
 * Attachment type definitions for the application.
 *
 * Matches the backend Attachment model structure.
 */

export interface Attachment {
  id: number;
  task_id: number;
  user_id: number;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}
