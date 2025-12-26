"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Task, TaskUpdate } from "@/types/task";
import type { Category } from "@/types/category";
import { MoreVertical, Plus, GripVertical } from "lucide-react";
import Button from "./ui/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import QuickAddModal from "./QuickAddModal";

type TaskStatus = "todo" | "in_progress" | "done";

interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900/30" },
];

const STORAGE_KEY = "kanban-in-progress-tasks";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [inProgressTaskIds, setInProgressTaskIds] = useState<Set<number>>(new Set());
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load in-progress tasks from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        setInProgressTaskIds(new Set(ids));
      } catch (err) {
        console.error("Failed to load in-progress tasks:", err);
      }
    }

    if (api.getToken()) {
      fetchData();
    }
  }, []);

  // Save in-progress tasks to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(inProgressTaskIds)));
  }, [inProgressTaskIds]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [fetchedTasks, fetchedCategories] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
      ]);
      setTasks(fetchedTasks);
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine task status based on completion and in-progress state
  const getTaskStatus = (task: Task): TaskStatus => {
    if (task.completed) return "done";
    if (inProgressTaskIds.has(task.id)) return "in_progress";
    return "todo";
  };

  // Get tasks for a specific column
  const getTasksForColumn = (columnId: TaskStatus) => {
    return tasks.filter((task) => getTaskStatus(task) === columnId);
  };

  // Get category for a task
  const getTaskCategory = (task: Task) => {
    return categories.find((c) => c.id === task.category_id);
  };

  // Handle drag start
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  // Handle drag over (allow drop)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = async (columnId: TaskStatus) => {
    if (!draggedTask) return;

    const currentStatus = getTaskStatus(draggedTask);

    // Only update if status actually changed
    if (currentStatus !== columnId) {
      try {
        // Update completion status if moving to/from done
        if (columnId === "done" || currentStatus === "done") {
          const newCompleted = columnId === "done";
          const updatedTask = await api.updateTask(draggedTask.id, {
            completed: newCompleted,
          });
          setTasks(tasks.map((t) => (t.id === draggedTask.id ? updatedTask : t)));
        }

        // Update in-progress state
        const newInProgressIds = new Set(inProgressTaskIds);
        if (columnId === "in_progress") {
          newInProgressIds.add(draggedTask.id);
        } else {
          newInProgressIds.delete(draggedTask.id);
        }
        setInProgressTaskIds(newInProgressIds);

        addNotification({
          type: "success",
          title: "Task Moved",
          message: `"${draggedTask.title}" moved to ${columns.find(c => c.id === columnId)?.title}`,
        });
      } catch (err) {
        console.error("Failed to update task:", err);
        addNotification({
          type: "error",
          title: "Update Failed",
          message: "Failed to move task. Please try again.",
        });
      }
    }

    setDraggedTask(null);
  };

  // Handle task creation
  const handleTaskCreated = () => {
    setQuickAddOpen(false);
    fetchData();
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "border-l-4 border-l-red-500",
      medium: "border-l-4 border-l-yellow-500",
      low: "border-l-4 border-l-green-500",
    };
    return colors[priority as keyof typeof colors] || "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading board...</span>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Board Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">{tasks.length}</span> total tasks
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
        {columns.map((column) => {
          const columnTasks = getTasksForColumn(column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {column.title}
                    <span className="text-xs bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </h3>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {columnTasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-gray-600">
                    <p className="text-sm">No tasks</p>
                    <p className="text-xs mt-1">Drag tasks here</p>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const category = getTaskCategory(task);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task)}
                        className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-move hover:shadow-lg transition-all ${getPriorityColor(
                          task.priority
                        )} ${draggedTask?.id === task.id ? "opacity-50" : ""}`}
                      >
                        {/* Task Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-600 mt-0.5 flex-shrink-0" />
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {task.title}
                            </h4>
                          </div>
                        </div>

                        {/* Task Description */}
                        {task.description && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Task Meta */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            {/* Category Badge */}
                            {category && (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: category.color + "20",
                                  color: category.color,
                                  borderColor: category.color,
                                }}
                              >
                                {category.name}
                              </span>
                            )}

                            {/* Priority Badge */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                task.priority === "high"
                                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                  : task.priority === "medium"
                                  ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              }`}
                            >
                              {task.priority.toUpperCase()}
                            </span>
                          </div>

                          {/* Due Date */}
                          {task.due_date && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(task.due_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Task Button */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-4 border-l-red-500"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-4 border-l-yellow-500"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border-l-4 border-l-green-500"></div>
          <span>Low Priority</span>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
