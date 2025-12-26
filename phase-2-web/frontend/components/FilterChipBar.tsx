'use client';

/**
 * Filter chip bar component for displaying active search filters.
 *
 * Feature: 005-quick-wins-ux (US6: Enhanced Search & Filters)
 */

import React from 'react';
import type { FilterChip } from '@/types/filter';

interface FilterChipBarProps {
  chips: FilterChip[];
  onRemove: (chipId: string) => void;
  onClearAll: () => void;
}

export default function FilterChipBar({ chips, onRemove, onClearAll }: FilterChipBarProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Filters:</span>

      {chips.map((chip) => (
        <div
          key={chip.id}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md"
        >
          <span>{chip.label}</span>
          <button
            onClick={() => onRemove(chip.id)}
            className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
            aria-label={`Remove ${chip.label} filter`}
          >
            ×
          </button>
        </div>
      ))}

      {chips.length > 1 && (
        <button
          onClick={onClearAll}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
