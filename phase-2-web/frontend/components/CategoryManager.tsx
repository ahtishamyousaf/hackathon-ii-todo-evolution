"use client";

/**
 * CategoryManager component for managing task categories.
 *
 * Features:
 * - Create new categories with name and color
 * - Display list of user's categories
 * - Color picker for visual customization
 * - Error handling for duplicate names and validation
 *
 * User Story: US1 (Create Custom Category)
 * Feature: 004-task-categories
 */

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { Category, CategoryCreate } from "@/types/category";

export default function CategoryManager() {
  const { token, isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3B82F6"); // Default blue
  const [isCreating, setIsCreating] = useState(false);

  // Edit state
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  // Load categories when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCategories();
    }
  }, [isAuthenticated, token]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Failed to load categories:", err);
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newCategoryName.trim()) {
      setError("Category name is required");
      return;
    }

    if (newCategoryName.length > 50) {
      setError("Category name must be 50 characters or less");
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      const categoryData: CategoryCreate = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
      };

      const newCategory = await api.createCategory(categoryData);

      // Add to list and reset form
      setCategories([...categories, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName("");
      setNewCategoryColor("#3B82F6");
    } catch (err) {
      console.error("Failed to create category:", err);
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditName(category.name);
    setEditColor(category.color);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditName("");
    setEditColor("");
    setError(null);
  };

  const handleUpdateCategory = async (categoryId: number) => {
    // Validation
    if (!editName.trim()) {
      setError("Category name is required");
      return;
    }

    if (editName.length > 50) {
      setError("Category name must be 50 characters or less");
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const updateData = {
        name: editName.trim(),
        color: editColor,
      };

      const updatedCategory = await api.updateCategory(categoryId, updateData);

      // Update in list
      setCategories(
        categories
          .map((cat) => (cat.id === categoryId ? updatedCategory : cat))
          .sort((a, b) => a.name.localeCompare(b.name))
      );

      // Reset edit state
      setEditingCategoryId(null);
      setEditName("");
      setEditColor("");
    } catch (err) {
      console.error("Failed to update category:", err);
      setError(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?\n\nTasks in this category will become uncategorized. This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingId(category.id);
      setError(null);

      await api.deleteCategory(category.id);

      // Remove from list
      setCategories(categories.filter((cat) => cat.id !== category.id));

      // Cancel edit if this category was being edited
      if (editingCategoryId === category.id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Categories
      </h2>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Create category form */}
      <form onSubmit={handleCreateCategory} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name (e.g., Work, Personal)"
            maxLength={50}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            disabled={isCreating}
          />

          <input
            type="color"
            value={newCategoryColor}
            onChange={(e) => setNewCategoryColor(e.target.value)}
            className="w-12 h-10 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer"
            title="Pick category color"
            disabled={isCreating}
          />

          <button
            type="submit"
            disabled={isCreating || !newCategoryName.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-md font-medium text-sm transition-colors"
          >
            {isCreating ? "Adding..." : "Add"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Create a category to organize your tasks
        </p>
      </form>

      {/* Categories list */}
      <div className="space-y-2">
        {isLoading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No categories yet. Create one above!
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {categories.length} {categories.length === 1 ? "category" : "categories"}
            </p>
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-3 border border-gray-200 dark:border-gray-600 rounded-md ${
                    isDeletingId === category.id ? "opacity-50" : ""
                  }`}
                >
                  {editingCategoryId === category.id ? (
                    /* Edit Mode */
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name"
                          maxLength={50}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          disabled={isUpdating}
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="w-10 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={handleCancelEdit}
                          disabled={isUpdating}
                          className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateCategory(category.id)}
                          disabled={isUpdating || !editName.trim()}
                          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUpdating ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {category.name}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(category)}
                          disabled={isDeletingId !== null || editingCategoryId !== null}
                          className="px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit category"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          disabled={isDeletingId !== null || editingCategoryId !== null}
                          className="px-2 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete category"
                        >
                          {isDeletingId === category.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
