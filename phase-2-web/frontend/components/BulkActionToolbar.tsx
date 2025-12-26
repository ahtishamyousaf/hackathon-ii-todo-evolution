"use client";

/**
 * BulkActionToolbar component for performing actions on multiple selected tasks.
 *
 * Features:
 * - Bulk complete/incomplete tasks
 * - Bulk delete with confirmation dialog
 * - Bulk priority change
 * - Bulk category assignment
 * - Bulk due date setting
 * - Visual feedback for selected count
 *
 * Usage:
 * <BulkActionToolbar
 *   selectedTaskIds={[1, 2, 3]}
 *   onBulkComplete={handleComplete}
 *   onBulkDelete={handleDelete}
 *   onBulkPriorityChange={handlePriority}
 *   onBulkCategoryChange={handleCategory}
 *   onBulkDueDateChange={handleDueDate}
 * />
 */

import { useState } from "react";
import { Trash2, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types/task";
import type { Category } from "@/types/category";

interface BulkActionToolbarProps {
  /** IDs of selected tasks */
  selectedTaskIds: number[];
  /** Categories for dropdown */
  categories: Category[];
  /** Called when bulk complete action is triggered */
  onBulkComplete?: (taskIds: number[], completed: boolean) => Promise<void>;
  /** Called when bulk delete is confirmed */
  onBulkDelete?: (taskIds: number[]) => Promise<void>;
  /** Called when bulk priority change is triggered */
  onBulkPriorityChange?: (taskIds: number[], priority: TaskPriority) => Promise<void>;
  /** Called when bulk category change is triggered */
  onBulkCategoryChange?: (taskIds: number[], categoryId: number | null) => Promise<void>;
  /** Called when bulk due date change is triggered */
  onBulkDueDateChange?: (taskIds: number[], dueDate: string | null) => Promise<void>;
  /** Called when toolbar is closed */
  onClose?: () => void;
}

export default function BulkActionToolbar({
  selectedTaskIds,
  categories,
  onBulkComplete,
  onBulkDelete,
  onBulkPriorityChange,
  onBulkCategoryChange,
  onBulkDueDateChange,
  onClose,
}: BulkActionToolbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "">("");
  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedDueDate, setSelectedDueDate] = useState<string>("");

  const selectedCount = selectedTaskIds.length;
  const hasSelection = selectedCount > 0;

  const handleBulkComplete = async (completed: boolean) => {
    if (!onBulkComplete || !hasSelection) return;
    setIsLoading(true);
    try {
      await onBulkComplete(selectedTaskIds, completed);
    } catch (err) {
      console.error("Failed to update tasks:", err);
      alert("Failed to update tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (!onBulkDelete || !hasSelection) return;
    setIsLoading(true);
    try {
      await onBulkDelete(selectedTaskIds);
      setShowDeleteConfirm(false);
      onClose?.();
    } catch (err) {
      console.error("Failed to delete tasks:", err);
      alert("Failed to delete tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    if (!onBulkPriorityChange || !hasSelection) return;
    setIsLoading(true);
    try {
      await onBulkPriorityChange(selectedTaskIds, priority);
      setSelectedPriority("");
    } catch (err) {
      console.error("Failed to update priority:", err);
      alert("Failed to update priority. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId: number | null) => {
    if (!onBulkCategoryChange || !hasSelection) return;
    setIsLoading(true);
    try {
      await onBulkCategoryChange(selectedTaskIds, categoryId);
      setSelectedCategory("");
    } catch (err) {
      console.error("Failed to update category:", err);
      alert("Failed to update category. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDueDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dueDate = e.target.value;
    setSelectedDueDate(dueDate);

    if (!onBulkDueDateChange || !hasSelection || !dueDate) return;
    setIsLoading(true);
    try {
      await onBulkDueDateChange(selectedTaskIds, dueDate);
      setSelectedDueDate("");
    } catch (err) {
      console.error("Failed to update due date:", err);
      alert("Failed to update due date. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSelection) {
    return null;
  }

  return (
    <>
      {/* Toolbar */}
      <div
        className={cn(
          "sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800",
          "border-t border-gray-200 dark:border-gray-700",
          "shadow-lg dark:shadow-xl",
          "p-4 z-40"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Selection info */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium text-sm">
              {selectedCount} selected
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount === 1 ? "1 task" : `${selectedCount} tasks`} selected
            </p>
          </div>

          {/* Center: Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mark Complete */}
            {onBulkComplete && (
              <button
                onClick={() => handleBulkComplete(true)}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium",
                  "rounded-lg border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
                title="Mark selected tasks as complete"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Complete</span>
              </button>
            )}

            {/* Mark Incomplete */}
            {onBulkComplete && (
              <button
                onClick={() => handleBulkComplete(false)}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium",
                  "rounded-lg border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
                title="Mark selected tasks as incomplete"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="hidden sm:inline">Incomplete</span>
              </button>
            )}

            {/* Priority Dropdown */}
            {onBulkPriorityChange && (
              <select
                value={selectedPriority}
                onChange={(e) => {
                  if (e.target.value) {
                    handlePriorityChange(e.target.value as TaskPriority);
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                <option value="">Set Priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            )}

            {/* Category Dropdown */}
            {onBulkCategoryChange && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "null") {
                    handleCategoryChange(null);
                  } else if (value) {
                    handleCategoryChange(parseInt(value));
                  }
                }}
                disabled={isLoading}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                <option value="">Set Category...</option>
                <option value="null">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Due Date Input */}
            {onBulkDueDateChange && (
              <input
                type="date"
                value={selectedDueDate}
                onChange={handleDueDateChange}
                disabled={isLoading}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors",
                  "max-w-xs"
                )}
                title="Set due date for selected tasks"
              />
            )}
          </div>

          {/* Right: Close and Delete buttons */}
          <div className="flex items-center gap-2">
            {onBulkDelete && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium",
                  "rounded-lg",
                  "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400",
                  "border border-red-300 dark:border-red-700",
                  "hover:bg-red-100 dark:hover:bg-red-900/30",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
                title="Delete selected tasks"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                disabled={isLoading}
                className={cn(
                  "inline-flex items-center px-3 py-2 text-sm font-medium",
                  "rounded-lg border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
                title="Close toolbar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Delete {selectedCount} task{selectedCount === 1 ? "" : "s"}?
              </h2>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete {selectedCount} selected task{selectedCount === 1 ? "" : "s"}?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "border border-gray-300 dark:border-gray-600",
                  "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300",
                  "hover:bg-gray-50 dark:hover:bg-gray-600",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={isLoading}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg",
                  "bg-red-600 hover:bg-red-700 text-white",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "transition-colors"
                )}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
