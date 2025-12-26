"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Subtask, SubtaskCreate } from "@/types/subtask";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SubtaskListProps {
  taskId: number;
}

export default function SubtaskList({ taskId }: SubtaskListProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubtasks();
  }, [taskId]);

  const fetchSubtasks = async () => {
    setIsLoading(true);
    try {
      const fetchedSubtasks = await api.getSubtasks(taskId);
      setSubtasks(fetchedSubtasks);
    } catch (err) {
      console.error("Failed to fetch subtasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load subtasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSubtaskTitle.trim()) {
      setError("Subtask title is required");
      return;
    }

    try {
      const subtaskData: SubtaskCreate = {
        title: newSubtaskTitle.trim(),
        completed: false,
        order: subtasks.length,
      };

      const newSubtask = await api.createSubtask(taskId, subtaskData);
      setSubtasks([...subtasks, newSubtask]);
      setNewSubtaskTitle("");
      setIsAdding(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create subtask");
    }
  };

  const handleToggle = async (subtaskId: number, completed: boolean) => {
    try {
      const updated = await api.toggleSubtaskCompletion(taskId, subtaskId, completed);
      setSubtasks(subtasks.map((s) => (s.id === subtaskId ? updated : s)));
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  const handleEdit = async (subtaskId: number) => {
    if (!editTitle.trim()) {
      setError("Subtask title is required");
      return;
    }

    try {
      const updated = await api.updateSubtask(taskId, subtaskId, {
        title: editTitle.trim(),
      });
      setSubtasks(subtasks.map((s) => (s.id === subtaskId ? updated : s)));
      setEditingId(null);
      setEditTitle("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subtask");
    }
  };

  const handleDelete = async (subtaskId: number) => {
    if (!confirm("Delete this subtask?")) return;

    try {
      await api.deleteSubtask(taskId, subtaskId);
      setSubtasks(subtasks.filter((s) => s.id !== subtaskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subtask");
    }
  };

  const startEdit = (subtask: Subtask) => {
    setEditingId(subtask.id);
    setEditTitle(subtask.title);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setError(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewSubtaskTitle("");
    setError(null);
  };

  // Calculate progress
  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (isLoading) {
    return (
      <div className="mt-3 text-sm text-gray-500">Loading subtasks...</div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-medium text-gray-700">
            Checklist
          </h4>
          {totalCount > 0 && (
            <span className="text-xs text-gray-500">
              {completedCount}/{totalCount} completed
            </span>
          )}
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + Add Item
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-3 bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
          <Input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            placeholder="Enter subtask title..."
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") cancelAdd();
            }}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleAdd}>
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={cancelAdd}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 rounded hover:bg-gray-50"
          >
            {editingId === subtask.id ? (
              <>
                <Input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit(subtask.id);
                    if (e.key === "Escape") cancelEdit();
                  }}
                  autoFocus
                  className="flex-1"
                />
                <Button size="sm" onClick={() => handleEdit(subtask.id)}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleToggle(subtask.id, !subtask.completed)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    subtask.completed
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {subtask.completed && (
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
                <span
                  className={`flex-1 text-sm ${
                    subtask.completed
                      ? "text-gray-500 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  onClick={() => startEdit(subtask)}
                  className="text-xs text-blue-600 hover:text-blue-700 px-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(subtask.id)}
                  className="text-xs text-red-600 hover:text-red-700 px-2"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {totalCount === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          No subtasks yet. Break this task down into smaller steps!
        </p>
      )}
    </div>
  );
}
