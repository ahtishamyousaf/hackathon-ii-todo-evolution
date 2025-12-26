"use client";

import { useState, useEffect } from "react";
import { X, Save, Trash2 } from "lucide-react";
import Button from "./ui/Button";
import { api } from "@/lib/api";
import type { Category } from "@/types/category";
import type { TaskPriority } from "@/types/task";

export interface TaskFilters {
  status?: "all" | "active" | "completed";
  priorities?: TaskPriority[];
  categories?: number[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  dueDateFilter?: "overdue" | "today" | "week" | "month" | "all";
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: TaskFilters;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  presets?: FilterPreset[];
  onSavePreset?: (preset: FilterPreset) => void;
  onDeletePreset?: (presetId: string) => void;
}

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  presets = [],
  onSavePreset,
  onDeletePreset,
}: FilterPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleStatusChange = (status: TaskFilters["status"]) => {
    onFiltersChange({ ...filters, status });
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const currentPriorities = filters.priorities || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter((p) => p !== priority)
      : [...currentPriorities, priority];
    onFiltersChange({
      ...filters,
      priorities: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleCategoryToggle = (categoryId: number) => {
    const currentCategories = filters.categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((c) => c !== categoryId)
      : [...currentCategories, categoryId];
    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleDueDateFilterChange = (dueDateFilter: TaskFilters["dueDateFilter"]) => {
    onFiltersChange({ ...filters, dueDateFilter });
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value || undefined,
      },
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const handleSavePreset = () => {
    if (!presetName.trim() || !onSavePreset) return;

    const preset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...filters },
    };

    onSavePreset(preset);
    setPresetName("");
    setShowSavePreset(false);
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-800 h-full w-full max-w-md shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Presets */}
          {presets.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Saved Filters
              </h3>
              <div className="space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="flex-1 text-left text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {preset.name}
                    </button>
                    {onDeletePreset && (
                      <button
                        onClick={() => onDeletePreset(preset.id)}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                        title="Delete preset"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Status
            </h3>
            <div className="flex gap-2">
              {(["all", "active", "completed"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (filters.status || "all") === status
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Priority
            </h3>
            <div className="flex gap-2">
              {(["low", "medium", "high"] as TaskPriority[]).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityToggle(priority)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.priorities?.includes(priority)
                      ? priority === "high"
                        ? "bg-red-600 text-white"
                        : priority === "medium"
                        ? "bg-yellow-600 text-white"
                        : "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={filters.categories?.includes(category.id) || false}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Due Date Quick Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Due Date
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "all", label: "All" },
                { value: "overdue", label: "Overdue" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleDueDateFilterChange(
                      option.value as TaskFilters["dueDateFilter"]
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (filters.dueDateFilter || "all") === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Custom Date Range
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ""}
                  onChange={(e) => handleDateRangeChange("start", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ""}
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Save as Preset */}
          {onSavePreset && (
            <div>
              {!showSavePreset ? (
                <Button
                  variant="ghost"
                  className="w-full gap-2"
                  onClick={() => setShowSavePreset(true)}
                >
                  <Save className="w-4 h-4" />
                  Save Current Filters
                </Button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Preset name..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSavePreset();
                      if (e.key === "Escape") setShowSavePreset(false);
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleSavePreset}
                      disabled={!presetName.trim()}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShowSavePreset(false);
                        setPresetName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={handleClearFilters}>
            Clear All
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
