"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type { TaskCreate, TaskPriority } from "@/types/task";
import type { Category } from "@/types/category";
import { api } from "@/lib/api";

interface TaskFormProps {
  onSubmit: (task: TaskCreate) => Promise<void>;
  onCancel?: () => void;
  initialValues?: TaskCreate;
  submitLabel?: string;
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialValues,
  submitLabel = "Add Task",
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || ""
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues?.priority || "medium"
  );
  const [dueDate, setDueDate] = useState(initialValues?.due_date || "");
  const [categoryId, setCategoryId] = useState<number | null>(
    initialValues?.category_id || null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [isRecurring, setIsRecurring] = useState(
    initialValues?.is_recurring || false
  );
  const [recurrencePattern, setRecurrencePattern] = useState<string>(
    initialValues?.recurrence_pattern || "daily"
  );
  const [recurrenceInterval, setRecurrenceInterval] = useState<number>(
    initialValues?.recurrence_interval || 1
  );
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(
    initialValues?.recurrence_end_date || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority: priority,
        due_date: dueDate || null,
        category_id: categoryId,
        is_recurring: isRecurring,
        recurrence_pattern: isRecurring ? recurrencePattern : null,
        recurrence_interval: isRecurring ? recurrenceInterval : undefined,
        recurrence_end_date: isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
      });

      // Reset form after successful submission
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setCategoryId(null);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message :
                          typeof err === 'string' ? err :
                          "Failed to save task";
      setError(errorMessage);
      console.error("Task submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title *
        </label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title"
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          disabled={isSubmitting}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label
          htmlFor="priority"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="due-date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Due Date (Optional)
        </label>
        <Input
          id="due-date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category (Optional)
        </label>
        <select
          id="category"
          value={categoryId || ""}
          onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
          disabled={isSubmitting}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">No Category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Recurring Task Options */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <input
            id="is-recurring"
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            disabled={isSubmitting}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is-recurring" className="text-sm font-medium text-gray-700">
            Make this a recurring task
          </label>
        </div>

        {isRecurring && (
          <div className="ml-6 space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="recurrence-pattern"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Repeat
                </label>
                <select
                  id="recurrence-pattern"
                  value={recurrencePattern}
                  onChange={(e) => setRecurrencePattern(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="recurrence-interval"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Every
                </label>
                <input
                  id="recurrence-interval"
                  type="number"
                  min="1"
                  max="365"
                  value={recurrenceInterval}
                  onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="recurrence-end-date"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date (Optional)
              </label>
              <Input
                id="recurrence-end-date"
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <p className="text-xs text-gray-600">
              {recurrenceInterval > 1
                ? `Repeats every ${recurrenceInterval} ${recurrencePattern === "daily" ? "days" : recurrencePattern === "weekly" ? "weeks" : "months"}`
                : `Repeats ${recurrencePattern}`}
              {recurrenceEndDate && ` until ${recurrenceEndDate}`}
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
