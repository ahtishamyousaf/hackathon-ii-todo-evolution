/**
 * Bulk operation types for multi-task actions.
 */

export type BulkAction =
  | 'complete'
  | 'uncomplete'
  | 'delete'
  | 'setPriority'
  | 'setCategory'
  | 'setDueDate';

export interface SelectionState {
  selectedIds: number[];
  lastSelectedIndex: number | null;
  isSelecting: boolean;
}

export interface BulkActionPayload {
  action: BulkAction;
  taskIds: number[];
  value?: any;
}
