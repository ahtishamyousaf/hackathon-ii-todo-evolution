"use client";

/**
 * SearchBar component with advanced filter parsing.
 *
 * Features:
 * - Search input with filter syntax support (is:completed, priority:high, etc.)
 * - Filter chips display
 * - Keyboard shortcut (/) to focus search
 * - Clear filters functionality
 *
 * User Story: US6 (Enhanced Search & Filters)
 * Feature: 005-quick-wins-ux
 */

import { useRef } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useFilterParser } from "@/hooks/useFilterParser";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import FilterChipBar from "./FilterChipBar";
import SearchHelpTooltip from "./SearchHelpTooltip";

interface SearchBarProps {
  onSearch: (textQuery: string, filters: any) => void;
  onFilterClick?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  onFilterClick,
  placeholder = "Search tasks... (try: is:completed priority:high)",
}: SearchBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, textQuery, filters, chips, removeFilter, clearAllFilters } = useFilterParser();

  // Keyboard shortcut: '/' to focus search
  useKeyboardShortcut('focusSearch', () => {
    searchRef.current?.focus();
  });

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    onSearch(textQuery, filters);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("", {});
  };

  const handleRemoveFilter = (chipId: string) => {
    removeFilter(chipId);
    // Trigger search with updated filters
    onSearch(textQuery, filters);
  };

  const handleClearAllFilters = () => {
    clearAllFilters();
    // Trigger search with no filters
    onSearch(textQuery, {});
  };

  return (
    <div className="space-y-2">
      {/* Search Input Row */}
      <div className="relative flex items-center gap-2">
        {/* Search Input */}
        <div className="flex-1 relative flex items-center ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 rounded-lg bg-white dark:bg-gray-800 transition-all">
          <Search className="absolute left-3 w-5 h-5 text-gray-400 dark:text-gray-500" />

          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none rounded-lg"
          />

          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
        </div>

        {/* Search Help */}
        <SearchHelpTooltip />

        {/* Filter Button (Optional) */}
        {onFilterClick && (
          <button
            onClick={onFilterClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Open filters"
          >
            <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </span>
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <FilterChipBar
        chips={chips}
        onRemove={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
      />
    </div>
  );
}
