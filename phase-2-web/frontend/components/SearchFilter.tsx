"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types/category";
import Button from "./ui/Button";

export interface FilterValues {
  search?: string;
  category_id?: number;
  priority?: string;
  completed?: boolean;
  is_recurring?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  overdue_only?: boolean;
}

interface SearchFilterProps {
  onFilterChange: (filters: FilterValues) => void;
  activeFilters: FilterValues;
}

export default function SearchFilter({ onFilterChange, activeFilters }: SearchFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Local state for filter inputs
  const [search, setSearch] = useState(activeFilters.search || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(activeFilters.category_id);
  const [priority, setPriority] = useState<string | undefined>(activeFilters.priority);
  const [completed, setCompleted] = useState<boolean | undefined>(activeFilters.completed);
  const [isRecurring, setIsRecurring] = useState<boolean | undefined>(activeFilters.is_recurring);
  const [dueDateFrom, setDueDateFrom] = useState<string | undefined>(activeFilters.due_date_from);
  const [dueDateTo, setDueDateTo] = useState<string | undefined>(activeFilters.due_date_to);
  const [overdueOnly, setOverdueOnly] = useState<boolean | undefined>(activeFilters.overdue_only);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const applyFilters = () => {
    const filters: FilterValues = {};

    if (search) filters.search = search;
    if (categoryId !== undefined) filters.category_id = categoryId;
    if (priority) filters.priority = priority;
    if (completed !== undefined) filters.completed = completed;
    if (isRecurring !== undefined) filters.is_recurring = isRecurring;
    if (dueDateFrom) filters.due_date_from = dueDateFrom;
    if (dueDateTo) filters.due_date_to = dueDateTo;
    if (overdueOnly) filters.overdue_only = overdueOnly;

    onFilterChange(filters);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setPriority(undefined);
    setCompleted(undefined);
    setIsRecurring(undefined);
    setDueDateFrom(undefined);
    setDueDateTo(undefined);
    setOverdueOnly(undefined);
    onFilterChange({});
  };

  const hasActiveFilters = () => {
    return search || categoryId !== undefined || priority || completed !== undefined ||
           isRecurring !== undefined || dueDateFrom || dueDateTo || overdueOnly;
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (search) count++;
    if (categoryId !== undefined) count++;
    if (priority) count++;
    if (completed !== undefined) count++;
    if (isRecurring !== undefined) count++;
    if (dueDateFrom || dueDateTo) count++;
    if (overdueOnly) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Search & Filter</h3>
          {hasActiveFilters() && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Search Bar - Always Visible */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search tasks by title or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            // Auto-apply search as user types
            setTimeout(() => {
              const filters: FilterValues = { search: e.target.value };
              if (categoryId !== undefined) filters.category_id = categoryId;
              if (priority) filters.priority = priority;
              if (completed !== undefined) filters.completed = completed;
              if (isRecurring !== undefined) filters.is_recurring = isRecurring;
              if (dueDateFrom) filters.due_date_from = dueDateFrom;
              if (dueDateTo) filters.due_date_to = dueDateTo;
              if (overdueOnly) filters.overdue_only = overdueOnly;
              onFilterChange(filters);
            }, 300);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Row 1: Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={priority || ""}
                onChange={(e) => setPriority(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date From
              </label>
              <input
                type="date"
                value={dueDateFrom || ""}
                onChange={(e) => setDueDateFrom(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date To
              </label>
              <input
                type="date"
                value={dueDateTo || ""}
                onChange={(e) => setDueDateTo(e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 3: Status Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Completion Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={completed === undefined ? "" : completed.toString()}
                onChange={(e) => setCompleted(e.target.value === "" ? undefined : e.target.value === "true")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tasks</option>
                <option value="false">Pending Only</option>
                <option value="true">Completed Only</option>
              </select>
            </div>

            {/* Recurring Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recurring
              </label>
              <select
                value={isRecurring === undefined ? "" : isRecurring.toString()}
                onChange={(e) => setIsRecurring(e.target.value === "" ? undefined : e.target.value === "true")}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tasks</option>
                <option value="true">Recurring Only</option>
                <option value="false">Non-Recurring Only</option>
              </select>
            </div>

            {/* Overdue Only Checkbox */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overdueOnly || false}
                  onChange={(e) => setOverdueOnly(e.target.checked ? true : undefined)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Overdue Only</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
            {hasActiveFilters() && (
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
