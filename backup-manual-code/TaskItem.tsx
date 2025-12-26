"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Task, TaskUpdate, TaskPriority } from "@/types/task";
import type { Category } from "@/types/category";
import { api } from "@/lib/api";
import { useNotifications } from "@/contexts/NotificationContext";
import TaskForm from "./TaskForm";
import SubtaskList from "./SubtaskList";
import CommentList from "./CommentList";
import AttachmentList from "./AttachmentList";
import TaskDependencyManager from "./TaskDependencyManager";
import RecurringTaskEditor, { type RecurringTaskSettings } from "./RecurringTaskEditor";

// Priority badge color mapping
const priorityColors: Record<TaskPriority, string> = {
  low: "bg-green-100 text-green-800 border-green-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-red-100 text-red-800 border-red-300",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low Priority",
  medium: "Medium Priority",
  high: "High Priority",
};

// Helper function to get due date status
const getDueDateStatus = (dueDate: string | null): { text: string; color: string } | null => {
  if (!dueDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Overdue ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`,
      color: "bg-red-100 text-red-800 border-red-300"
    };
  } else if (diffDays === 0) {
    return {
      text: "Due today",
      color: "bg-orange-100 text-orange-800 border-orange-300"
    };
  } else if (diffDays <= 3) {
    return {
      text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      color: "bg-yellow-100 text-yellow-800 border-yellow-300"
    };
  } else {
    return {
      text: `Due ${due.toLocaleDateString()}`,
      color: "bg-blue-100 text-blue-800 border-blue-300"
    };
  }
};

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: number, completed: boolean) => Promise<void>;
  onUpdate: (taskId: number, task: TaskUpdate) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

export default function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showDependencies, setShowDependencies] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const taskCategory = task.category_id
    ? categories.find((c) => c.id === task.category_id)
    : null;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task.id, !task.completed);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleUpdate = async (updates: TaskUpdate) => {
    await onUpdate(task.id, updates);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      setIsDeleting(false);
    }
  };

  const fetchAllTasks = async () => {
    try {
      const tasks = await api.getTasks();
      setAllTasks(tasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    }
  };

  const handleSaveDependencies = async (dependencyTaskIds: number[]) => {
    try {
      // Fetch current dependencies first
      const currentDeps = await api.getTaskDependencies(task.id);
      const currentDepIds = currentDeps.dependencies?.map((d: any) => d.depends_on_task_id) || [];

      // Find dependencies to add (new ones not in current)
      const toAdd = dependencyTaskIds.filter(id => !currentDepIds.includes(id));

      // Find dependencies to remove (current ones not in new list)
      const toRemove = currentDeps.dependencies?.filter((d: any) =>
        !dependencyTaskIds.includes(d.depends_on_task_id)
      ) || [];

      // Remove old dependencies
      for (const dep of toRemove) {
        try {
          await api.deleteTaskDependency(dep.id);
        } catch (err) {
          console.error("Failed to delete dependency:", err);
        }
      }

      // Add new dependencies
      for (const depId of toAdd) {
        try {
          await api.createTaskDependency(task.id, depId);
        } catch (err: any) {
          // Handle specific errors
          if (err.message?.includes("circular dependency")) {
            addNotification({
              type: "error",
              title: "Circular Dependency",
              message: "Cannot create this dependency as it would create a circular reference.",
            });
            return; // Stop processing
          }
          throw err; // Re-throw other errors
        }
      }

      addNotification({
        type: "success",
        title: "Dependencies Updated",
        message: "Task dependencies have been saved successfully.",
      });

      setShowDependencies(false);

      // Refresh the page to show updated dependencies
      window.location.reload();
    } catch (err: any) {
      console.error("Failed to save dependencies:", err);
      addNotification({
        type: "error",
        title: "Save Failed",
        message: err.message || "Failed to save task dependencies. Please try again.",
      });
    }
  };

  const handleSaveRecurring = async (settings: RecurringTaskSettings) => {
    try {
      await onUpdate(task.id, {
        is_recurring: settings.is_recurring,
        recurrence_pattern: settings.recurrence_pattern,
        recurrence_interval: settings.recurrence_interval,
        recurrence_end_date: settings.recurrence_end_date,
      });

      addNotification({
        type: "success",
        title: "Recurrence Updated",
        message: "Task recurrence settings have been saved successfully.",
      });

      setShowRecurring(false);
    } catch (err) {
      console.error("Failed to save recurring settings:", err);
      addNotification({
        type: "error",
        title: "Save Failed",
        message: "Failed to save recurrence settings. Please try again.",
      });
    }
  };

  const handleOpenDependencies = () => {
    fetchAllTasks();
    setShowDependencies(true);
  };

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Edit Task</h4>
        <TaskForm
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          initialValues={{
            title: task.title,
            description: task.description || undefined,
            priority: task.priority,
            due_date: task.due_date || undefined,
            category_id: task.category_id || undefined,
          }}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 transition-all ${
        isDeleting ? "opacity-50" : ""
      } ${task.completed ? "border-green-200 bg-green-50" : "border-gray-200"}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          disabled={isToggling || isDeleting}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            task.completed
              ? "bg-green-500 border-green-500"
              : "border-gray-300 hover:border-green-500"
          } ${isToggling ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {task.completed && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-lg font-medium ${
                task.completed
                  ? "text-gray-500 line-through"
                  : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {taskCategory && (
                <span
                  className="px-2 py-1 text-xs font-medium rounded border"
                  style={{
                    backgroundColor: taskCategory.color + "20",
                    borderColor: taskCategory.color,
                    color: taskCategory.color,
                  }}
                >
                  {taskCategory.name}
                </span>
              )}
              <span
                className={`px-2 py-1 text-xs font-medium rounded border ${
                  priorityColors[task.priority]
                }`}
              >
                {task.priority.toUpperCase()}
              </span>
              {(() => {
                const dueDateStatus = getDueDateStatus(task.due_date);
                return dueDateStatus ? (
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded border ${dueDateStatus.color}`}
                  >
                    {dueDateStatus.text}
                  </span>
                ) : null;
              })()}
              <Badge variant={task.completed ? "success" : "default"}>
                {task.completed ? "Completed" : "Pending"}
              </Badge>
              {task.is_recurring && (
                <span className="px-2 py-1 text-xs font-medium rounded border bg-purple-100 text-purple-800 border-purple-300 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Recurring ({task.recurrence_pattern})
                </span>
              )}
            </div>
          </div>

          {task.description && (
            <p
              className={`mt-2 text-sm ${
                task.completed ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
            <span>Created: {formatDate(task.created_at)}</span>
            {task.updated_at !== task.created_at && (
              <span>Updated: {formatDate(task.updated_at)}</span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSubtasks(!showSubtasks)}
              disabled={isDeleting}
            >
              {showSubtasks ? "Hide" : "Show"} Checklist
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowComments(!showComments)}
              disabled={isDeleting}
            >
              {showComments ? "Hide" : "Show"} Comments
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={isDeleting}
            >
              {showAttachments ? "Hide" : "Show"} Attachments
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenDependencies}
              disabled={isDeleting}
            >
              Dependencies
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowRecurring(true)}
              disabled={isDeleting}
            >
              Recurring
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              disabled={isDeleting}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>

          {/* Subtasks Section */}
          {showSubtasks && <SubtaskList taskId={task.id} />}

          {/* Comments Section */}
          {showComments && <CommentList taskId={task.id} />}

          {/* Attachments Section */}
          {showAttachments && <AttachmentList taskId={task.id} />}
        </div>
      </div>

      {/* Dependency Manager Modal */}
      {showDependencies && (
        <TaskDependencyManager
          task={task}
          allTasks={allTasks}
          onSave={handleSaveDependencies}
          onClose={() => setShowDependencies(false)}
        />
      )}

      {/* Recurring Task Editor Modal */}
      {showRecurring && (
        <RecurringTaskEditor
          initialSettings={{
            is_recurring: task.is_recurring,
            recurrence_pattern: task.recurrence_pattern as any,
            recurrence_interval: task.recurrence_interval || 1,
            recurrence_end_date: task.recurrence_end_date || null,
          }}
          onSave={handleSaveRecurring}
          onClose={() => setShowRecurring(false)}
        />
      )}
    </div>
  );
}
