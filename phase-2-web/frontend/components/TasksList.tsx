"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";
import { taskEvents } from "@/lib/taskEvents";
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
  Plus,
  X
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Button from "./ui/Button";
import { useNotifications } from "@/contexts/NotificationContext";
import QuickAddModal from "./QuickAddModal";
import FeatureBanner from "./FeatureBanner";
import DraggableTaskItem from "./DraggableTaskItem";
import BulkActionToolbar from "./BulkActionToolbar";
import {
  parseSearchQuery,
  isToday as checkIsToday,
  isTomorrow as checkIsTomorrow,
  isThisWeek as checkIsThisWeek,
  isOverdue as checkIsOverdue,
  getFilterDisplayText,
  type ParsedFilters,
} from "@/utils/searchFilters";

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
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const { addNotification } = useNotifications();

  // Bulk selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [showBulkToolbar, setShowBulkToolbar] = useState(false);

  // Parsed filters for chip display
  const [activeFilters, setActiveFilters] = useState<ParsedFilters>({ text: "" });

  // Keyboard navigation state
  const [focusedTaskIndex, setFocusedTaskIndex] = useState<number>(-1);

  // Recent searches state
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (api.getToken()) {
      fetchData();
    }

    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        console.error("Failed to parse recent searches:", e);
      }
    }
  }, []);

  // Listen for task events from chat widget and refresh task list
  useEffect(() => {
    const handleTaskEvent = () => {
      // Refresh task list when tasks are modified via chat
      if (api.getToken()) {
        fetchData();
      }
    };

    // Subscribe to all task events
    const unsubscribe = taskEvents.on('any', handleTaskEvent);

    return () => {
      unsubscribe();
    };
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

    // Parse advanced search query
    const parsedFilters = parseSearchQuery(searchQuery);
    setActiveFilters(parsedFilters);

    // Text search filter (remaining text after extracting filters)
    if (parsedFilters.text) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(parsedFilters.text.toLowerCase()) ||
        task.description?.toLowerCase().includes(parsedFilters.text.toLowerCase())
      );
    }

    // Advanced filter: Priority
    if (parsedFilters.priority) {
      filtered = filtered.filter((task) => task.priority === parsedFilters.priority);
    }

    // Advanced filter: Status
    if (parsedFilters.status) {
      if (parsedFilters.status === "active") {
        filtered = filtered.filter((task) => !task.completed);
      } else if (parsedFilters.status === "completed") {
        filtered = filtered.filter((task) => task.completed);
      }
    }

    // Advanced filter: Due Date
    if (parsedFilters.dueDate) {
      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);

        switch (parsedFilters.dueDate) {
          case "today":
            return checkIsToday(dueDate);
          case "tomorrow":
            return checkIsTomorrow(dueDate);
          case "overdue":
            return !task.completed && checkIsOverdue(dueDate);
          case "thisweek":
            return checkIsThisWeek(dueDate);
          default:
            return true;
        }
      });
    }

    // Advanced filter: Category (by name)
    if (parsedFilters.category) {
      const categoryName = parsedFilters.category.toLowerCase();
      filtered = filtered.filter((task) => {
        if (!task.category_id) return false;
        const category = categories.find((c) => c.id === task.category_id);
        return category?.name.toLowerCase().includes(categoryName);
      });
    }

    // Traditional dropdown filters (still work, combine with advanced filters)
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

  // Drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      let newOrder: Task[] = [];

      setFilteredTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder;
      });

      // Persist order to backend
      try {
        const taskIds = newOrder.map((task) => task.id);
        await api.reorderTasks(taskIds);
        addNotification({
          type: "success",
          title: "Task Reordered",
          message: "Task order saved successfully",
        });
      } catch (err) {
        console.error("Failed to persist task order:", err);
        addNotification({
          type: "error",
          title: "Reorder Failed",
          message: "Failed to save task order. Please try again.",
        });
        // Reload tasks to get correct order from backend
        await fetchData();
      }
    }
  };

  // Bulk selection handlers
  const handleToggleSelection = (taskId: number) => {
    setSelectedTaskIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  };

  const handleBulkComplete = async (taskIds: number[], completed: boolean) => {
    try {
      await Promise.all(
        taskIds.map((id) => api.updateTask(id, { completed }))
      );
      await fetchData();
      setSelectedTaskIds([]);
      addNotification({
        type: "success",
        title: "Tasks Updated",
        message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} marked as ${completed ? "complete" : "incomplete"}`,
      });
    } catch (err) {
      console.error("Failed to update tasks:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update tasks. Please try again.",
      });
    }
  };

  const handleBulkDelete = async (taskIds: number[]) => {
    try {
      await Promise.all(taskIds.map((id) => api.deleteTask(id)));
      await fetchData();
      setSelectedTaskIds([]);
      addNotification({
        type: "success",
        title: "Tasks Deleted",
        message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} deleted`,
      });
    } catch (err) {
      console.error("Failed to delete tasks:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to delete tasks. Please try again.",
      });
    }
  };

  const handleBulkPriorityChange = async (taskIds: number[], priority: any) => {
    try {
      await Promise.all(taskIds.map((id) => api.updateTask(id, { priority })));
      await fetchData();
      addNotification({
        type: "success",
        title: "Priority Updated",
        message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} updated`,
      });
    } catch (err) {
      console.error("Failed to update priority:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update priority. Please try again.",
      });
    }
  };

  const handleBulkCategoryChange = async (taskIds: number[], category_id: number | null) => {
    try {
      await Promise.all(taskIds.map((id) => api.updateTask(id, { category_id })));
      await fetchData();
      addNotification({
        type: "success",
        title: "Category Updated",
        message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} updated`,
      });
    } catch (err) {
      console.error("Failed to update category:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update category. Please try again.",
      });
    }
  };

  const handleBulkDueDateChange = async (taskIds: number[], due_date: string | null) => {
    try {
      await Promise.all(taskIds.map((id) => api.updateTask(id, { due_date })));
      await fetchData();
      addNotification({
        type: "success",
        title: "Due Date Updated",
        message: `${taskIds.length} task${taskIds.length === 1 ? "" : "s"} updated`,
      });
    } catch (err) {
      console.error("Failed to update due date:", err);
      addNotification({
        type: "error",
        title: "Error",
        message: "Failed to update due date. Please try again.",
      });
    }
  };

  // Update bulk toolbar visibility
  useEffect(() => {
    setShowBulkToolbar(selectedTaskIds.length > 0);
  }, [selectedTaskIds]);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Don't handle if modal is open
      if (quickAddOpen) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedTaskIndex((prev) => {
            const next = prev + 1;
            return next >= filteredTasks.length ? 0 : next;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedTaskIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? filteredTasks.length - 1 : next;
          });
          break;

        case "Enter":
          if (focusedTaskIndex >= 0 && focusedTaskIndex < filteredTasks.length) {
            e.preventDefault();
            handleEditTask(filteredTasks[focusedTaskIndex]);
          }
          break;

        case " ": // Space
          if (focusedTaskIndex >= 0 && focusedTaskIndex < filteredTasks.length) {
            e.preventDefault();
            handleToggleComplete(filteredTasks[focusedTaskIndex]);
          }
          break;

        case "Delete":
        case "Backspace":
          if (focusedTaskIndex >= 0 && focusedTaskIndex < filteredTasks.length) {
            e.preventDefault();
            handleDeleteTask(filteredTasks[focusedTaskIndex]);
            // Reset focus after delete
            setFocusedTaskIndex(-1);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedTaskIndex, filteredTasks, quickAddOpen]);

  // Reset focused index when filtered tasks change
  useEffect(() => {
    if (focusedTaskIndex >= filteredTasks.length) {
      setFocusedTaskIndex(filteredTasks.length > 0 ? 0 : -1);
    }
  }, [filteredTasks]);

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
    setEditingTask(undefined);
    fetchData();
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setQuickAddOpen(true);
  };

  // Filter chip handlers
  const clearFilter = (filterType: keyof ParsedFilters) => {
    let newQuery = searchQuery;

    if (filterType === "priority" && activeFilters.priority) {
      newQuery = newQuery.replace(new RegExp(`priority:${activeFilters.priority}`, "i"), "").trim();
    } else if (filterType === "status" && activeFilters.status) {
      newQuery = newQuery.replace(new RegExp(`is:${activeFilters.status}`, "i"), "").trim();
    } else if (filterType === "dueDate" && activeFilters.dueDate) {
      newQuery = newQuery.replace(new RegExp(`due:${activeFilters.dueDate}`, "i"), "").trim();
    } else if (filterType === "category" && activeFilters.category) {
      newQuery = newQuery.replace(new RegExp(`category:${activeFilters.category}`, "i"), "").trim();
    } else if (filterType === "text") {
      // Keep only the filter syntax, remove text
      const parts: string[] = [];
      if (activeFilters.priority) parts.push(`priority:${activeFilters.priority}`);
      if (activeFilters.status) parts.push(`is:${activeFilters.status}`);
      if (activeFilters.dueDate) parts.push(`due:${activeFilters.dueDate}`);
      if (activeFilters.category) parts.push(`category:${activeFilters.category}`);
      newQuery = parts.join(" ");
    }

    setSearchQuery(newQuery.replace(/\s+/g, " ").trim());
  };

  const clearAllFilters = () => {
    setSearchQuery("");
  };

  // Recent searches handlers
  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;

    const trimmed = query.trim();
    // Don't save if it's already the most recent search
    if (recentSearches[0] === trimmed) return;

    // Add to recent searches (max 10)
    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearchBlur = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    // Delay hiding to allow click on dropdown items
    setTimeout(() => setShowRecentSearches(false), 200);
  };

  const handleSearchFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveRecentSearch(searchQuery);
      setShowRecentSearches(false);
      e.currentTarget.blur();
    }
  };

  const selectRecentSearch = (search: string) => {
    setSearchQuery(search);
    setShowRecentSearches(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    setShowRecentSearches(false);
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
      {/* Feature Banner */}
      <FeatureBanner />

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
                placeholder="Search tasks or try: priority:high is:completed due:today category:work"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyDown={handleSearchKeyDown}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />

              {/* Recent Searches Dropdown */}
              {showRecentSearches && recentSearches.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Recent Searches</span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
                    >
                      Clear all
                    </button>
                  </div>
                  <ul className="py-1">
                    {recentSearches.map((search, index) => (
                      <li key={index}>
                        <button
                          onClick={() => selectRecentSearch(search)}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Search className="w-3 h-3 text-gray-400" />
                          <span className="flex-1 truncate">{search}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">Filter syntax:</span>{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">priority:high/medium/low</code>{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">is:completed/active</code>{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">due:today/tomorrow/overdue/thisweek</code>{" "}
                <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">category:name</code>
              </div>
            )}

            {/* Active Filter Chips */}
            {(activeFilters.priority || activeFilters.status || activeFilters.dueDate || activeFilters.category || activeFilters.text) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Active filters:</span>

                {activeFilters.priority && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium border border-purple-200 dark:border-purple-800">
                    <span>Priority: {activeFilters.priority}</span>
                    <button
                      onClick={() => clearFilter("priority")}
                      className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5 transition-colors"
                      title="Remove priority filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeFilters.status && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
                    <span>{activeFilters.status === "completed" ? "Completed" : "Active"}</span>
                    <button
                      onClick={() => clearFilter("status")}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                      title="Remove status filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeFilters.dueDate && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium border border-orange-200 dark:border-orange-800">
                    <span>
                      Due: {activeFilters.dueDate === "today" ? "Today" :
                            activeFilters.dueDate === "tomorrow" ? "Tomorrow" :
                            activeFilters.dueDate === "overdue" ? "Overdue" : "This Week"}
                    </span>
                    <button
                      onClick={() => clearFilter("dueDate")}
                      className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5 transition-colors"
                      title="Remove due date filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeFilters.category && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">
                    <span>Category: {activeFilters.category}</span>
                    <button
                      onClick={() => clearFilter("category")}
                      className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5 transition-colors"
                      title="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {activeFilters.text && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-600">
                    <span>Search: "{activeFilters.text}"</span>
                    <button
                      onClick={() => clearFilter("text")}
                      className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-0.5 transition-colors"
                      title="Remove search text"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium ml-1 underline"
                >
                  Clear all
                </button>
              </div>
            )}
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
        <>
          {/* Select All Checkbox - Compact Design */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-blue-600 dark:text-blue-500 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  title="Select all tasks"
                />
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Bulk Actions
                  </span>
                  {selectedTaskIds.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {selectedTaskIds.length} of {filteredTasks.length} selected
                    </span>
                  )}
                </div>
              </label>
              {selectedTaskIds.length > 0 && (
                <button
                  onClick={() => setSelectedTaskIds([])}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}

          {/* Draggable Task List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={(updatedTask) => {
                      setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
                    }}
                    onDelete={(taskId) => {
                      setTasks(tasks.filter((t) => t.id !== taskId));
                    }}
                    onEdit={handleEditTask}
                    isSelected={selectedTaskIds.includes(task.id)}
                    onToggleSelection={() => handleToggleSelection(task.id)}
                    isFocused={index === focusedTaskIndex}
                    onFocus={() => setFocusedTaskIndex(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {/* Bulk Action Toolbar */}
      {showBulkToolbar && (
        <BulkActionToolbar
          selectedTaskIds={selectedTaskIds}
          categories={categories}
          onBulkComplete={handleBulkComplete}
          onBulkDelete={handleBulkDelete}
          onBulkPriorityChange={handleBulkPriorityChange}
          onBulkCategoryChange={handleBulkCategoryChange}
          onBulkDueDateChange={handleBulkDueDateChange}
          onClose={() => setSelectedTaskIds([])}
        />
      )}

      {/* Keep old task rendering for reference - REMOVE THIS SECTION */}
      {false && (
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
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit task"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
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
        onClose={() => {
          setQuickAddOpen(false);
          setEditingTask(undefined);
        }}
        onTaskCreated={handleTaskCreated}
        editTask={editingTask}
      />
    </div>
  );
}
