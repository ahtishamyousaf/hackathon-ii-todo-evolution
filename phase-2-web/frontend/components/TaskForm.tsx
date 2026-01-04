"use client";

/**
 * TaskForm component for creating and editing tasks.
 *
 * Features:
 * - Create mode: Empty form to create new task
 * - Edit mode: Pre-populated form to update existing task
 * - Validation: Title required (1-200 chars), description optional (max 1000 chars)
 * - Error handling: Shows validation and API errors
 * - Loading states: Disables form during submission
 *
 * User Stories: US-001 (Create), US-003 (Update)
 * Feature: 003-task-crud
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Task, TaskCreate, TaskUpdate } from "@/types/task";
import type { Category } from "@/types/category";

interface TaskFormProps {
  /** Existing task to edit (if in edit mode) */
  task?: Task;
  /** Callback when task is created/updated successfully */
  onSuccess?: (task: Task) => void;
  /** Callback when form is cancelled */
  onCancel?: () => void;
  /** Form mode: create or edit */
  mode?: "create" | "edit";
}

export default function TaskForm({
  task,
  onSuccess,
  onCancel,
  mode = "create",
}: TaskFormProps) {
  // Form state
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [categoryId, setCategoryId] = useState<number | null>(task?.category_id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await api.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Update form when task prop changes (for edit mode)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategoryId(task.category_id ?? null);
    }
  }, [task]);

  // Validation
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return "Title is required";
    }
    if (title.length > 200) {
      return "Title must be 200 characters or less";
    }
    if (description.length > 1000) {
      return "Description must be 1000 characters or less";
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      let savedTask: Task;

      if (mode === "edit" && task) {
        // Update existing task
        const updateData: TaskUpdate = {
          title: title.trim(),
          description: description.trim(),
          category_id: categoryId,
        };
        savedTask = await api.updateTask(task.id, updateData);
        toast.success(`✏️ Task Updated: "${savedTask.title}"`, { duration: 4000 });
      } else {
        // Create new task
        const createData: TaskCreate = {
          title: title.trim(),
          description: description.trim(),
          completed: false,
          category_id: categoryId,
        };
        savedTask = await api.createTask(createData);
        toast.success(`✅ Task Created: "${savedTask.title}"`, { duration: 4000 });
      }

      // Reset form on successful create
      if (mode === "create") {
        setTitle("");
        setDescription("");
        setCategoryId(null);
      }

      // Notify parent component
      if (onSuccess) {
        onSuccess(savedTask);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save task";
      setError(errorMessage);
      console.error("Task save error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setTitle(task?.title || "");
    setDescription(task?.description || "");
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Title field */}
      <div>
        <label
          htmlFor="task-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Buy groceries"
          maxLength={200}
          required
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500 mt-1">
          {title.length}/200 characters
        </p>
      </div>

      {/* Description field */}
      <div>
        <label
          htmlFor="task-description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more details about this task..."
          maxLength={1000}
          rows={4}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {description.length}/1000 characters
        </p>
      </div>

      {/* Category field */}
      <div>
        <label
          htmlFor="task-category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category <span className="text-gray-400">(optional)</span>
        </label>
        <select
          id="task-category"
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          disabled={loading || loadingCategories}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {loadingCategories && (
          <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
        )}
      </div>

      {/* Form actions */}
      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === "create" ? "Creating..." : "Saving..."}
            </span>
          ) : mode === "create" ? (
            "Create Task"
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  );
}
