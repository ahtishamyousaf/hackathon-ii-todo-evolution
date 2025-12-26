"use client";

/**
 * TaskList component for displaying and managing all tasks.
 *
 * Features:
 * - Fetches tasks from API on mount
 * - Displays tasks using TaskItem components
 * - Shows create task form in modal
 * - Handles task updates and deletions
 * - Shows loading and empty states
 * - Error handling
 *
 * User Stories: US-001 (Create), US-002 (View), US-003 (Update), US-004 (Toggle), US-005 (Delete)
 * Feature: 003-task-crud
 */

import { useState, useEffect } from "react";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Task } from "@/types/task";
import type { Category } from "@/types/category";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";
import SearchBar from "./SearchBar";
import DraggableTaskItem from './DraggableTaskItem';
import BulkActionToolbar from './BulkActionToolbar';
import FeatureHintBanner from './FeatureHintBanner';
import KeyboardShortcutsFAB from './KeyboardShortcutsFAB';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useBulkSelection } from '@/hooks/useBulkSelection';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export default function TaskList() {
  const { token, isAuthenticated } = useAuth();

  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState<any>({});

  // Phase 1 Quick Wins: Bulk Selection & Drag & Drop
  const { selectedIds, isSelecting, toggleSelection, selectAll, clearSelection, selectRange } = useBulkSelection();
  const { sensors, handleDragEnd, closestCenter: collisionDetection } = useDragAndDrop();

  // Load categories when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCategories();
    }
  }, [isAuthenticated, token]);

  // Fetch tasks when authenticated or filter changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchTasks();
    }
  }, [isAuthenticated, token, selectedCategoryId]);

  // Load categories
  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert filter value to API parameter
      const categoryFilter = selectedCategoryId === "all" ? undefined : (selectedCategoryId ?? undefined);
      const fetchedTasks = await api.getTasks(categoryFilter);
      setTasks(fetchedTasks);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle task created
  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks]); // Add to beginning of list
    setShowCreateForm(false);
  };

  // Handle task updated
  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(
      tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setEditingTask(null);
  };

  // Handle task deleted
  const handleTaskDeleted = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Handle edit click
  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setShowCreateForm(false);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  // Phase 1 Quick Wins: Keyboard Shortcuts
  useKeyboardShortcut('newTask', () => {
    setShowCreateForm(true);
    setEditingTask(null);
  });
  useKeyboardShortcut('clearSelection', () => clearSelection());

  // Phase 1 Quick Wins: Bulk Operation Handlers
  const handleBulkComplete = async (taskIds: number[], completed: boolean) => {
    try {
      await api.bulkUpdateTasks({ task_ids: taskIds, updates: { completed } });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to bulk update tasks:', err);
      alert('Failed to update tasks. Please try again.');
    }
  };

  const handleBulkDelete = async (taskIds: number[]) => {
    try {
      await api.bulkDeleteTasks({ task_ids: taskIds });
      await fetchTasks();
      clearSelection();
    } catch (err) {
      console.error('Failed to bulk delete tasks:', err);
      alert('Failed to delete tasks. Please try again.');
    }
  };

  const handleBulkPriorityChange = async (taskIds: number[], priority: string) => {
    try {
      await api.bulkUpdateTasks({ task_ids: taskIds, updates: { priority } });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to bulk update priority:', err);
      alert('Failed to update priority. Please try again.');
    }
  };

  const handleBulkCategoryChange = async (taskIds: number[], categoryId: number | null) => {
    try {
      await api.bulkUpdateTasks({ task_ids: taskIds, updates: { category_id: categoryId } });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to bulk update category:', err);
      alert('Failed to update category. Please try again.');
    }
  };

  const handleBulkDueDateChange = async (taskIds: number[], dueDate: string | null) => {
    try {
      await api.bulkUpdateTasks({ task_ids: taskIds, updates: { due_date: dueDate } });
      await fetchTasks();
    } catch (err) {
      console.error('Failed to bulk update due date:', err);
      alert('Failed to update due date. Please try again.');
    }
  };

  // Phase 1 Quick Wins: Reorder Handler
  const handleReorder = async (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks);
    try {
      const taskIds = reorderedTasks.map(t => t.id);
      await api.reorderTasks(taskIds);
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      // Revert on error
      await fetchTasks();
    }
  };

  // Phase 1 Quick Wins: Search Handler
  const handleSearch = (textQuery: string, filters: any) => {
    setSearchQuery(textQuery);
    setSearchFilters(filters);
  };

  // Filter tasks based on search query and filters
  const filteredTasks = tasks.filter(task => {
    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Filter: is:completed / is:active
    if (searchFilters.status === 'completed' && !task.completed) return false;
    if (searchFilters.status === 'active' && task.completed) return false;

    // Filter: priority
    if (searchFilters.priority && task.priority !== searchFilters.priority) return false;

    // Filter: category
    if (searchFilters.category_id !== undefined && task.category_id !== searchFilters.category_id) return false;

    return true;
  });

  // Calculate task counts
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="mt-1 text-sm text-gray-600">
              {totalTasks === 0
                ? "No tasks yet"
                : `${totalTasks} ${totalTasks === 1 ? "task" : "tasks"} • ${completedTasks} completed • ${pendingTasks} pending`}
            </p>
          </div>
          <button
            onClick={() => {
              setShowCreateForm(true);
              setEditingTask(null);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            + New Task
          </button>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mt-4">
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategoryId === null ? "uncategorized" : selectedCategoryId}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "all") {
                  setSelectedCategoryId("all");
                } else if (value === "uncategorized") {
                  setSelectedCategoryId(null);
                } else {
                  setSelectedCategoryId(Number(value));
                }
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Feature Hints Banner */}
      <FeatureHintBanner />

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Create Task Form (Modal) */}
      {showCreateForm && (
        <div className="mb-6 bg-white border border-blue-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Task
          </h2>
          <TaskForm
            mode="create"
            onSuccess={handleTaskCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {/* Edit Task Form (Modal) */}
      {editingTask && (
        <div className="mb-6 bg-white border border-blue-200 rounded-lg p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Edit Task
          </h2>
          <TaskForm
            mode="edit"
            task={editingTask}
            onSuccess={handleTaskUpdated}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading tasks
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && totalTasks === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {selectedCategoryId === "all"
              ? "No tasks yet"
              : selectedCategoryId === null
              ? "No uncategorized tasks"
              : `No tasks in this category`}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedCategoryId === "all"
              ? "Get started by creating your first task"
              : "Try selecting a different category or create a new task"}
          </p>
          {selectedCategoryId === "all" && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              + Create Task
            </button>
          )}
          {selectedCategoryId !== "all" && (
            <button
              onClick={() => setSelectedCategoryId("all")}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View All Tasks
            </button>
          )}
        </div>
      )}

      {/* Task List */}
      {!loading && !error && totalTasks > 0 && (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragEnd={(e) => handleDragEnd(e, filteredTasks, handleReorder)}
          >
            <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {/* Select All Checkbox */}
                {filteredTasks.length > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAll(filteredTasks.map(t => t.id));
                        } else {
                          clearSelection();
                        }
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Select All ({filteredTasks.length})
                    </span>
                  </div>
                )}

                {/* Task Items */}
                {filteredTasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={handleTaskUpdated}
                    onDelete={handleTaskDeleted}
                    onEdit={handleEditClick}
                    isSelected={selectedIds.includes(task.id)}
                    onToggleSelection={(shiftKey) => {
                      if (shiftKey) {
                        const lastIndex = filteredTasks.findIndex(t => t.id === selectedIds[selectedIds.length - 1]);
                        if (lastIndex >= 0) {
                          selectRange(filteredTasks.map(t => t.id), lastIndex, index);
                        }
                      } else {
                        toggleSelection(task.id, index);
                      }
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Bulk Action Toolbar */}
          {isSelecting && (
            <BulkActionToolbar
              selectedTaskIds={selectedIds}
              categories={categories}
              onBulkComplete={handleBulkComplete}
              onBulkDelete={handleBulkDelete}
              onBulkPriorityChange={handleBulkPriorityChange}
              onBulkCategoryChange={handleBulkCategoryChange}
              onBulkDueDateChange={handleBulkDueDateChange}
              onClose={clearSelection}
            />
          )}
        </>
      )}

      {/* Floating Keyboard Shortcuts Button */}
      <KeyboardShortcutsFAB />
    </div>
  );
}
