/**
 * Dashboard type definitions for the application.
 *
 * Matches the backend Dashboard response structure.
 */

export interface TasksByPriority {
  high: number;
  medium: number;
  low: number;
}

export interface TasksByCategory {
  category_id: number | null;
  category_name: string;
  count: number;
}

export interface CompletionTrend {
  date: string;
  completed: number;
  created: number;
}

export interface DashboardStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_subtasks: number;
  completed_subtasks: number;
  total_comments: number;
  tasks_by_priority: TasksByPriority;
  tasks_by_category: TasksByCategory[];
  completion_trends: CompletionTrend[];
}
