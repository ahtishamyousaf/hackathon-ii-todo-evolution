"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Category, CategoryCreate } from "@/types/category";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

const DEFAULT_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
];

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if token is available before fetching
  const hasToken = api.getToken() !== null;

  useEffect(() => {
    if (hasToken) {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [hasToken]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      const newCategory = await api.createCategory({ name: name.trim(), color });
      setCategories([...categories, newCategory]);
      setName("");
      setColor(DEFAULT_COLORS[0]);
      setIsAdding(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    }
  };

  const handleUpdate = async (categoryId: number) => {
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      const updated = await api.updateCategory(categoryId, { name: name.trim(), color });
      setCategories(categories.map(c => c.id === categoryId ? updated : c));
      setEditingId(null);
      setName("");
      setColor(DEFAULT_COLORS[0]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update category");
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm("Delete this category? Tasks using it will become uncategorized.")) {
      return;
    }

    try {
      await api.deleteCategory(categoryId);
      setCategories(categories.filter(c => c.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setColor(category.color);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setName("");
    setColor(DEFAULT_COLORS[0]);
    setError(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-600">Loading categories...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Categories</h3>
            {!isAdding && !editingId && (
              <Button size="sm" onClick={() => setIsAdding(true)}>
                + Add Category
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingId) && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Work, Personal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex gap-2">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === c ? "border-gray-900 scale-110" : "border-gray-300"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
                >
                  {editingId ? "Save" : "Create"}
                </Button>
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories yet. Create one to organize your tasks!
              </p>
            ) : (
              categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(category)}
                      className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
