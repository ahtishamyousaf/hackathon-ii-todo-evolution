"use client";

import { useState, useEffect } from "react";
import { X, Plus, Link2, AlertCircle } from "lucide-react";
import Button from "./ui/Button";
import type { Task } from "@/types/task";
import { api } from "@/lib/api";

interface Dependency {
  id: string;
  taskId: number;
  taskTitle: string;
  completed: boolean;
}

interface TaskDependencyManagerProps {
  task: Task;
  allTasks: Task[];
  onSave: (dependencies: number[]) => void;
  onClose: () => void;
}

export default function TaskDependencyManager({
  task,
  allTasks,
  onSave,
  onClose,
}: TaskDependencyManagerProps) {
  const [selectedDependencies, setSelectedDependencies] = useState<Dependency[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load existing dependencies when component mounts
  useEffect(() => {
    loadExistingDependencies();
  }, []);

  const loadExistingDependencies = async () => {
    setLoading(true);
    try {
      const data = await api.getTaskDependencies(task.id);
      const deps = (Array.isArray(data) ? data : []).map((d: any) => ({
        id: d.id.toString(),
        taskId: d.depends_on_task_id,
        taskTitle: d.depends_on_title,
        completed: d.depends_on_completed,
      }));
      setSelectedDependencies(deps);
    } catch (err) {
      console.error("Failed to load dependencies:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter out current task and already selected tasks
  const availableTasks = allTasks.filter(
    (t) =>
      t.id !== task.id &&
      !selectedDependencies.some((d) => d.taskId === t.id) &&
      (searchQuery === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddDependency = (selectedTask: Task) => {
    // Check if this would create a circular dependency
    // (Simple check: if the selected task already has current task as dependency)
    const wouldBeCircular = selectedDependencies.some(
      (dep) => dep.taskId === task.id
    );

    if (wouldBeCircular) {
      // Show warning but still allow (backend will validate)
      console.warn("Warning: This may create a circular dependency");
    }

    setSelectedDependencies([
      ...selectedDependencies,
      {
        id: Date.now().toString() + Math.random(),
        taskId: selectedTask.id,
        taskTitle: selectedTask.title,
        completed: selectedTask.completed,
      },
    ]);
    setSearchQuery("");
  };

  const handleRemoveDependency = (dependencyId: string) => {
    setSelectedDependencies(
      selectedDependencies.filter((d) => d.id !== dependencyId)
    );
  };

  const handleSave = () => {
    onSave(selectedDependencies.map((d) => d.taskId));
  };

  const hasUncompletedDependencies =
    selectedDependencies.filter((d) => !d.completed).length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Link2 className="w-6 h-6" />
              Task Dependencies
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Link tasks that must be completed before: <strong>{task.title}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 pt-4">
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Circular dependencies are not allowed. If Task A depends on Task B, then Task B cannot depend on Task A.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Current Dependencies */}
          {selectedDependencies.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Dependencies ({selectedDependencies.length})
              </h3>
              <div className="space-y-2">
                {selectedDependencies.map((dep) => (
                  <div
                    key={dep.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          dep.completed
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          dep.completed
                            ? "text-gray-500 dark:text-gray-400 line-through"
                            : "text-gray-900 dark:text-white font-medium"
                        }`}
                      >
                        {dep.taskTitle}
                      </span>
                      {!dep.completed && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                          Incomplete
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemoveDependency(dep.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title="Remove dependency"
                    >
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              {hasUncompletedDependencies && (
                <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    This task will be blocked until all dependencies are completed.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Add Dependency */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Add Dependency
            </h3>

            {/* Search */}
            <div className="relative mb-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Available Tasks */}
            {searchQuery && (
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableTasks.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No tasks found
                  </p>
                ) : (
                  availableTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleAddDependency(t)}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            t.completed
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            t.completed
                              ? "text-gray-500 dark:text-gray-400 line-through"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                      <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {selectedDependencies.length === 0 && (
            <div className="text-center py-8">
              <Link2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No dependencies added yet. Search for tasks above to add dependencies.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Dependencies
          </Button>
        </div>
      </div>
    </div>
  );
}
