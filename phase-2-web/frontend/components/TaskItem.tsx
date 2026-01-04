"use client";

/**
 * TaskItem component for displaying a single task.
 *
 * Features:
 * - Checkbox to toggle completion status
 * - Visual indication for completed tasks (strikethrough)
 * - Edit and Delete buttons
 * - Timestamps display
 * - Optimistic UI updates
 *
 * User Stories: US-002 (View), US-004 (Toggle), US-005 (Delete)
 * Feature: 003-task-crud
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";

interface TaskItemProps {
  /** Task to display */
  task: Task;
  /** Callback when task is updated */
  onUpdate?: (task: Task) => void;
  /** Callback when task is deleted */
  onDelete?: (taskId: number) => void;
  /** Callback when edit is requested */
  onEdit?: (task: Task) => void;
  /** Whether this task is selected (for bulk operations) */
  isSelected?: boolean;
  /** Callback when selection is toggled (shiftKey indicates range selection) */
  onToggleSelection?: (shiftKey: boolean) => void;
  /** Whether this task is currently focused (for keyboard navigation) */
  isFocused?: boolean;
}

export default function TaskItem({
  task,
  onUpdate,
  onDelete,
  onEdit,
  isSelected,
  onToggleSelection,
  isFocused,
}: TaskItemProps) {
  const { addNotification } = useNotifications();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories to display category name/color
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Find the category for this task
  const taskCategory = task.category_id
    ? categories.find((c) => c.id === task.category_id)
    : null;

  // Handle completion toggle
  const handleToggleComplete = async () => {
    setIsToggling(true);
    try {
      const updatedTask = await api.toggleTaskComplete(task.id);
      if (updatedTask.completed) {
        toast.success(`✓ Task Completed: "${updatedTask.title}"`, { duration: 3000 });
        addNotification({
          type: "success",
          title: "Task Completed",
          message: `"${updatedTask.title}" marked as complete`,
        });
      } else {
        toast.success(`↩️ Task Reopened: "${updatedTask.title}"`, { duration: 3000 });
        addNotification({
          type: "info",
          title: "Task Reopened",
          message: `"${updatedTask.title}" marked as incomplete`,
        });
      }
      if (onUpdate) {
        onUpdate(updatedTask);
      }
    } catch (err) {
      console.error("Failed to toggle task:", err);
      toast.error("Failed to update task. Please try again.", { duration: 4000 });
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update task. Please try again.",
      });
    } finally {
      setIsToggling(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async () => {
    // Show confirmation dialog (SC-007: requires confirmation)
    const confirmed = window.confirm(
      `Are you sure you want to delete "${task.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteTask(task.id);
      toast.success(`🗑️ Task Deleted: "${task.title}"`, { duration: 4000 });
      addNotification({
        type: "success",
        title: "Task Deleted",
        message: `"${task.title}" has been deleted`,
      });
      if (onDelete) {
        onDelete(task.id);
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task. Please try again.", { duration: 4000 });
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete task. Please try again.",
      });
      setIsDeleting(false);
    }
  };

  // Handle edit click
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${
        isDeleting ? "opacity-50" : ""
      } ${
        isSelected
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
          : isFocused
          ? "border-yellow-400 dark:border-yellow-500 ring-2 ring-yellow-200 dark:ring-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Selection Checkbox - SQUARE with blue border */}
        {onToggleSelection && (
          <div className="flex-shrink-0 pt-1 relative group/select">
            <div className="flex flex-col items-center gap-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection((e.nativeEvent as MouseEvent).shiftKey);
                }}
                className="w-5 h-5 text-blue-600 dark:text-blue-500 border-2 border-blue-400 dark:border-blue-500 rounded-sm focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label={`Select "${task.title}" for bulk operations`}
              />
              <span className="text-[9px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Select
              </span>
            </div>
          </div>
        )}

        {/* Completion Checkbox - CIRCLE with green border */}
        <div className="flex-shrink-0 pt-1">
          <div className="flex flex-col items-center gap-1">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
              disabled={isToggling || isDeleting}
              className="w-5 h-5 text-green-600 dark:text-green-500 border-2 border-green-400 dark:border-green-500 rounded-full focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              aria-label={`Mark "${task.title}" as ${
                task.completed ? "incomplete" : "complete"
              }`}
            />
            <span className="text-[9px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">
              Done
            </span>
          </div>
        </div>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3
            className={`text-lg font-medium ${
              task.completed
                ? "line-through text-gray-500"
                : "text-gray-900"
            }`}
          >
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p
              className={`mt-1 text-sm ${
                task.completed ? "text-gray-400" : "text-gray-600"
              } whitespace-pre-wrap`}
            >
              {task.description}
            </p>
          )}

          {/* Category badge */}
          {taskCategory ? (
            <div className="mt-2 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: taskCategory.color }}
              >
                <div
                  className="w-2 h-2 rounded-full bg-white/30"
                  aria-hidden="true"
                />
                {taskCategory.name}
              </span>
            </div>
          ) : (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                Uncategorized
              </span>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span>Updated: {formatDate(task.updated_at)}</span>
            )}
            {task.completed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                ✓ Completed
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex gap-2">
          {onEdit && (
            <button
              onClick={handleEdit}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Edit "${task.title}"`}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-1.5 text-sm font-medium text-red-700 bg-white border border-red-300 rounded hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={`Delete "${task.title}"`}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
