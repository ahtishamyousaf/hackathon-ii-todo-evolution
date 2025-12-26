"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";
import {
  Search,
  Filter,
  CheckCircle2,
  Circle,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  Tag,
  AlertCircle,
  Plus
} from "lucide-react";
import Button from "./ui/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import QuickAddModal from "./QuickAddModal";

type SortField = "title" | "due_date" | "priority" | "created_at";
type SortOrder = "asc" | "desc";
type FilterStatus = "all" | "active" | "completed";

export default function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (api.getToken()) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory, sortField, sortOrder]);

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
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to load tasks. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === "active") {
      filtered = filtered.filter((task) => !task.completed);
    } else if (filterStatus === "completed") {
      filtered = filtered.filter((task) => task.completed);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Category filter
    if (filterCategory !== "all") {
      filtered = filtered.filter((task) => task.category_id === parseInt(filterCategory));
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updatedTask = await api.updateTask(task.id, {
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? updatedTask : t)));
      addNotification({
        type: "success",
        title: task.completed ? "Task Reopened" : "Task Completed",
        message: `"${task.title}" marked as ${task.completed ? "incomplete" : "complete"}`,
      });
    } catch (err) {
      console.error("Failed to update task:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update task. Please try again.",
      });
    }
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    try {
      await api.deleteTask(task.id);
      setTasks(tasks.filter((t) => t.id !== task.id));
      addNotification({
        type: "success",
        title: "Task Deleted",
        message: `"${task.title}" has been deleted`,
      });
    } catch (err) {
      console.error("Failed to delete task:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete task. Please try again.",
      });
    }
  };

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    const category = categories.find((c) => c.id === categoryId);
    return category;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      medium: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      low: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    };
    return colors[priority as keyof typeof colors] || "";
  };

  const isOverdue = (task: Task) => {
    if (!task.due_date || task.completed) return false;
    return new Date(task.due_date) < new Date();
  };

  const handleTaskCreated = () => {
    setQuickAddOpen(false);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tasks...</span>
      </div>
    );
  }

  // Calculate quick stats
  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const overdueTasksCount = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date) < new Date()).length;
  const highPriorityCount = tasks.filter(t => !t.completed && t.priority === 'high').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Active Tasks</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">{activeTasksCount}</div>
            </div>
            <Circle className="w-8 h-8 text-blue-500 dark:text-blue-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">Completed</div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">{completedTasksCount}</div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-500 dark:text-green-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">Overdue</div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">{overdueTasksCount}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">High Priority</div>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">{highPriorityCount}</div>
            </div>
            <Tag className="w-8 h-8 text-orange-500 dark:text-orange-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortField(field as SortField);
                setSortOrder(order as SortOrder);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="due_date-asc">Due Date (Soon)</option>
              <option value="due_date-desc">Due Date (Late)</option>
              <option value="priority-desc">High Priority First</option>
              <option value="priority-asc">Low Priority First</option>
            </select>
          </div>
        </div>

        {/* Results count and actions */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
            </span>
            {(searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all") && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                (filtered from {tasks.length} total)
              </span>
            )}
          </div>
          <Button onClick={() => setQuickAddOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            New Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-16 text-center">
          <div className="mb-6">
            {searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all" ? (
              <Search className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600" />
            ) : (
              <CheckCircle2 className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all"
              ? "No tasks match your filters"
              : "No tasks yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery || filterStatus !== "all" || filterPriority !== "all" || filterCategory !== "all"
              ? "Try adjusting your search or filters to find what you're looking for"
              : "Get started by creating your first task and stay organized"}
          </p>
          <Button onClick={() => setQuickAddOpen(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Task
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const category = getCategoryName(task.category_id);
            const overdue = isOverdue(task);

            return (
              <div
                key={task.id}
                className={`group bg-white dark:bg-gray-900 rounded-xl border-2 transition-all duration-200 ${
                  task.completed
                    ? "border-gray-200 dark:border-gray-700 opacity-70 hover:opacity-100"
                    : overdue
                    ? "border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 shadow-sm hover:shadow-red-100 dark:hover:shadow-red-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm hover:shadow-lg"
                } p-5 hover:scale-[1.01]`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-1 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-blue-500 transition-colors" />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-medium text-gray-900 dark:text-white ${
                            task.completed ? "line-through" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteTask(task)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {/* Priority */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority.toUpperCase()}
                      </span>

                      {/* Category */}
                      {category && (
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                          style={{
                            backgroundColor: category.color + "20",
                            color: category.color,
                            borderColor: category.color,
                            borderWidth: "1px",
                          }}
                        >
                          <Tag className="w-3 h-3" />
                          {category.name}
                        </span>
                      )}

                      {/* Due Date */}
                      {task.due_date && (
                        <span
                          className={`flex items-center gap-1 text-xs ${
                            overdue
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {overdue && <AlertCircle className="w-3 h-3" />}
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(task.due_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}

                      {/* Created date */}
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        Created{" "}
                        {new Date(task.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
