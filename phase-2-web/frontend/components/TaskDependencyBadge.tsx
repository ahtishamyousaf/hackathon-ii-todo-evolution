"use client";

import { Link2, Lock } from "lucide-react";

interface DependencyInfo {
  total: number;
  completed: number;
}

interface TaskDependencyBadgeProps {
  dependencies?: DependencyInfo;
  dependentTasks?: number; // Number of tasks depending on this one
  isBlocked?: boolean;
}

export default function TaskDependencyBadge({
  dependencies,
  dependentTasks,
  isBlocked = false,
}: TaskDependencyBadgeProps) {
  if (!dependencies && !dependentTasks) return null;

  const hasDependencies = dependencies && dependencies.total > 0;
  const hasUncompletedDeps =
    hasDependencies && dependencies.completed < dependencies.total;

  return (
    <div className="flex items-center gap-2">
      {/* Dependencies (tasks this task depends on) */}
      {hasDependencies && (
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
            hasUncompletedDeps
              ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
              : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
          }`}
          title={
            hasUncompletedDeps
              ? `Blocked by ${dependencies.total - dependencies.completed} task(s)`
              : "All dependencies completed"
          }
        >
          {isBlocked ? (
            <Lock className="w-3 h-3" />
          ) : (
            <Link2 className="w-3 h-3" />
          )}
          <span>
            {dependencies.completed}/{dependencies.total}
          </span>
        </div>
      )}

      {/* Dependent Tasks (tasks that depend on this task) */}
      {dependentTasks && dependentTasks > 0 && (
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
          title={`${dependentTasks} task(s) depend on this`}
        >
          <Link2 className="w-3 h-3 transform rotate-180" />
          <span>{dependentTasks}</span>
        </div>
      )}
    </div>
  );
}
