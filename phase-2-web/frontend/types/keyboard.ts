/**
 * Keyboard shortcut types for global keyboard navigation system.
 *
 * Feature: 005-quick-wins-ux (US1: Keyboard Shortcuts System)
 */

export type ShortcutKey =
  | 'n' | 'N'           // New task
  | '/' | 'Slash'       // Focus search
  | 'Escape'            // Close modal/clear
  | 'ArrowUp'           // Navigate up
  | 'ArrowDown'         // Navigate down
  | 'Enter'             // Edit/confirm
  | ' ' | 'Space'       // Toggle complete
  | 'Delete' | 'Backspace'; // Delete task

export type ShortcutAction =
  | 'newTask'
  | 'focusSearch'
  | 'closeModal'
  | 'navigateUp'
  | 'navigateDown'
  | 'editTask'
  | 'toggleComplete'
  | 'deleteTask'
  | 'clearSelection';

export interface KeyBinding {
  key: ShortcutKey;
  action: ShortcutAction;
  description: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
}

export interface ShortcutConfig {
  bindings: KeyBinding[];
  enableGlobal: boolean;
  excludeInputs: boolean; // Don't trigger shortcuts when typing in inputs
}

export interface KeyboardNavigationState {
  focusedIndex: number;
  selectedTaskIds: number[];
  isNavigating: boolean;
}
