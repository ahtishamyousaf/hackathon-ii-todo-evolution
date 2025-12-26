"use client";

/**
 * @deprecated Use TasksList.tsx instead
 * This component is kept for reference only
 * TODO: Remove after confirming no usages remain
 */

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Task, TaskCreate, TaskUpdate } from "@/types/task";
import { useNotifications } from "@/contexts/NotificationContext";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import SearchBar from "./SearchBar";
import FilterPanel, { type TaskFilters } from "./FilterPanel";
import { useFilterPresets } from "@/hooks/useFilterPresets";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const { presets, savePreset, deletePreset } = useFilterPresets();
  const { addNotification } = useNotifications();

  // Check if token is available before fetching
  const hasToken = api.getToken() !== null;

  // Fetch tasks when token becomes available
  useEffect(() => {
    if (hasToken) {
      fetchTasks();
    } else {
      // Still waiting for authentication
      setIsLoading(false);
    }
  }, [hasToken]);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);

      // Check for due date reminders
      checkDueDateReminders(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const checkDueDateReminders = (tasks: Task[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks.forEach((task) => {
      if (task.completed || !task.due_date) return;

      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Overdue tasks
      if (dueDate < today) {
        const daysOverdue = Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        addNotification({
          type: "warning",
          title: "Overdue Task",
          message: `"${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue.`,
        });
      }
      // Due today
      else if (dueDate.getTime() === today.getTime()) {
        addNotification({
          type: "info",
          title: "Task Due Today",
          message: `"${task.title}" is due today. Don't forget to complete it!`,
        });
      }
      // Due tomorrow
      else if (dueDate.getTime() === tomorrow.getTime()) {
        addNotification({
          type: "info",
          title: "Task Due Tomorrow",
          message: `"${task.title}" is due tomorrow. Plan ahead!`,
        });
      }
    });
  };

  // Client-side filtering
  const filteredTasks = tasks.filter((task) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status) {
      if (filters.status === "active" && task.completed) return false;
      if (filters.status === "completed" && !task.completed) return false;
    }

    // Priority filter
    if (filters.priorities && filters.priorities.length > 0) {
      if (!filters.priorities.includes(task.priority)) return false;
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!task.category_id || !filters.categories.includes(task.category_id)) {
        return false;
      }
    }

    // Due date filter
    if (filters.dueDateFilter && filters.dueDateFilter !== "all" && task.due_date) {
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (filters.dueDateFilter) {
        case "overdue":
          if (dueDate >= today || task.completed) return false;
          break;
        case "today":
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (dueDate < today || dueDate >= tomorrow) return false;
          break;
        case "week":
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          if (dueDate < today || dueDate >= weekEnd) return false;
          break;
        case "month":
          const monthEnd = new Date(today);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          if (dueDate < today || dueDate >= monthEnd) return false;
          break;
      }
    }

    // Custom date range filter
    if (filters.dateRange) {
      if (filters.dateRange.start && task.due_date) {
        if (new Date(task.due_date) < new Date(filters.dateRange.start)) {
          return false;
        }
      }
      if (filters.dateRange.end && task.due_date) {
        if (new Date(task.due_date) > new Date(filters.dateRange.end)) {
          return false;
        }
      }
    }

    return true;
  });

  const handleCreateTask = async (taskData: TaskCreate) => {
    const newTask = await api.createTask(taskData);
    setTasks([newTask, ...tasks]);
    setShowAddForm(false);

    // Add notification
    addNotification({
      type: "success",
      title: "Task Created",
      message: `"${newTask.title}" has been added to your tasks.`,
    });
  };

  const handleToggleTask = async (taskId: number, completed: boolean) => {
    const updatedTask = await api.toggleTaskCompletion(taskId, completed);
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));

    // Add notification
    if (completed) {
      addNotification({
        type: "success",
        title: "Task Completed",
        message: `"${updatedTask.title}" has been marked as completed. Great job!`,
      });

      // If recurring, notify about next instance
      if (updatedTask.is_recurring) {
        setTimeout(() => {
          addNotification({
            type: "info",
            title: "Recurring Task",
            message: `Next instance of "${updatedTask.title}" has been created automatically.`,
          });
        }, 1000);
      }
    }
  };

  const handleUpdateTask = async (taskId: number, updates: TaskUpdate) => {
    const updatedTask = await api.updateTask(taskId, updates);
    setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));

    // Add notification
    addNotification({
      type: "success",
      title: "Task Updated",
      message: `"${updatedTask.title}" has been updated successfully.`,
    });
  };

  const handleDeleteTask = async (taskId: number) => {
    const taskToDelete = tasks.find((t) => t.id === taskId);
    await api.deleteTask(taskId);
    setTasks(tasks.filter((t) => t.id !== taskId));

    // Add notification
    if (taskToDelete) {
      addNotification({
        type: "info",
        title: "Task Deleted",
        message: `"${taskToDelete.title}" has been removed from your tasks.`,
      });
    }
  };

  // Calculate statistics (using all user tasks, not just filtered)
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading tasks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
          <Button onClick={fetchTasks} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {pendingTasks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {completedTasks}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showAddForm ? "Add New Task" : "Tasks"}
            </h2>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                + Add Task
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <TaskForm
              onSubmit={handleCreateTask}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      {totalTasks > 0 && (
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onFilterClick={() => setShowFilterPanel(true)}
          />
        </div>
      )}

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        filters={filters}
        onFiltersChange={setFilters}
        presets={presets}
        onSavePreset={savePreset}
        onDeletePreset={deletePreset}
      />

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 dark:text-gray-600 text-5xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery || Object.keys(filters).length > 0
                ? "No tasks match your filters"
                : "No tasks yet"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || Object.keys(filters).length > 0
                ? "Try adjusting your search or filter criteria."
                : "Create your first task to get started!"}
            </p>
            {!searchQuery && Object.keys(filters).length === 0 && !showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                + Add Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}
