export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  related_task_id: number | null;
  related_user_id: number | null;
  read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'task_assigned'
  | 'task_due'
  | 'comment_added'
  | 'task_completed'
  | 'task_updated';
