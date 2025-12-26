'use client';

import { useState, useCallback } from 'react';
import type { SelectionState } from '@/types/bulkOperation';

export function useBulkSelection() {
  const [state, setState] = useState<SelectionState>({
    selectedIds: [],
    lastSelectedIndex: null,
    isSelecting: false,
  });

  const toggleSelection = useCallback((taskId: number, index: number, shiftKey: boolean = false) => {
    setState((prev) => {
      if (shiftKey && prev.lastSelectedIndex !== null) {
        return prev;
      }

      const isSelected = prev.selectedIds.includes(taskId);
      const newSelectedIds = isSelected
        ? prev.selectedIds.filter((id) => id !== taskId)
        : [...prev.selectedIds, taskId];

      return {
        selectedIds: newSelectedIds,
        lastSelectedIndex: index,
        isSelecting: newSelectedIds.length > 0,
      };
    });
  }, []);

  const selectAll = useCallback((taskIds: number[]) => {
    setState({
      selectedIds: taskIds,
      lastSelectedIndex: null,
      isSelecting: true,
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState({
      selectedIds: [],
      lastSelectedIndex: null,
      isSelecting: false,
    });
  }, []);

  const selectRange = useCallback((taskIds: number[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeIds = taskIds.slice(start, end + 1);

    setState((prev) => ({
      selectedIds: Array.from(new Set([...prev.selectedIds, ...rangeIds])),
      lastSelectedIndex: endIndex,
      isSelecting: true,
    }));
  }, []);

  return {
    selectedIds: state.selectedIds,
    isSelecting: state.isSelecting,
    toggleSelection,
    selectAll,
    clearSelection,
    selectRange,
    lastSelectedIndex: state.lastSelectedIndex,
  };
}
