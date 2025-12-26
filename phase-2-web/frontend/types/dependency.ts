/**
 * Task dependency type definitions.
 *
 * Represents relationships between tasks where one task depends on another.
 */

export interface TaskDependency {
  id: number;
  task_id: number; // The task that has the dependency
  depends_on_task_id: number; // The task that must be completed first
  created_at: string;
}

export interface TaskDependencyCreate {
  task_id: number;
  depends_on_task_id: number;
}

export interface TaskWithDependencies {
  task_id: number;
  title: string;
  completed: boolean;
  dependencies: {
    id: number;
    depends_on_task_id: number;
    depends_on_title: string;
    depends_on_completed: boolean;
  }[];
  dependent_tasks: {
    id: number;
    task_id: number;
    task_title: string;
    task_completed: boolean;
  }[];
}
