/**
 * Keyboard helper utilities for global keyboard navigation system.
 *
 * Feature: 005-quick-wins-ux (US1: Keyboard Shortcuts System)
 */

import type { ShortcutKey, KeyBinding } from '@/types/keyboard';

/**
 * Check if the currently focused element is an input field.
 * Returns true for input, textarea, select, and contenteditable elements.
 */
export function isInputFocused(): boolean {
  const activeElement = document.activeElement;

  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isContentEditable = activeElement.getAttribute('contenteditable') === 'true';

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  );
}

/**
 * Parse a keyboard event into a normalized key string.
 * Handles special keys and modifiers.
 */
export function parseKeyEvent(event: KeyboardEvent): ShortcutKey | null {
  const key = event.key;

  // Direct key mappings
  if (key === 'n' || key === 'N') return 'n';
  if (key === '/') return '/';
  if (key === 'Escape') return 'Escape';
  if (key === 'ArrowUp') return 'ArrowUp';
  if (key === 'ArrowDown') return 'ArrowDown';
  if (key === 'Enter') return 'Enter';
  if (key === ' ') return ' ';
  if (key === 'Delete') return 'Delete';
  if (key === 'Backspace') return 'Backspace';

  return null;
}

/**
 * Check if a keyboard event matches a key binding.
 */
export function matchesBinding(event: KeyboardEvent, binding: KeyBinding): boolean {
  const key = parseKeyEvent(event);

  if (!key) return false;
  if (key !== binding.key && key.toLowerCase() !== binding.key.toLowerCase()) return false;

  // Check modifiers
  if (binding.ctrl && !event.ctrlKey) return false;
  if (binding.alt && !event.altKey) return false;
  if (binding.shift && !event.shiftKey) return false;
  if (binding.meta && !event.metaKey) return false;

  // Ensure no extra modifiers
  if (!binding.ctrl && event.ctrlKey) return false;
  if (!binding.alt && event.altKey) return false;
  if (!binding.meta && event.metaKey) return false;
  // Note: shift is allowed for uppercase letters

  return true;
}

/**
 * Get user-friendly display string for a key binding.
 * E.g., "Ctrl+N", "Shift+/", "Escape"
 */
export function getBindingDisplay(binding: KeyBinding): string {
  const parts: string[] = [];

  if (binding.meta) parts.push(navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl');
  if (binding.ctrl) parts.push('Ctrl');
  if (binding.alt) parts.push('Alt');
  if (binding.shift) parts.push('Shift');

  // Format key display
  let keyDisplay: string = binding.key;
  if (keyDisplay === ' ') keyDisplay = 'Space';
  if (keyDisplay === '/') keyDisplay = '/';
  if (keyDisplay.startsWith('Arrow')) keyDisplay = keyDisplay.replace('Arrow', '');

  parts.push(keyDisplay);

  return parts.join('+');
}

/**
 * Default keyboard shortcuts configuration.
 */
export const defaultShortcuts: KeyBinding[] = [
  {
    key: 'n',
    action: 'newTask',
    description: 'Create new task',
  },
  {
    key: '/',
    action: 'focusSearch',
    description: 'Focus search bar',
  },
  {
    key: 'Escape',
    action: 'closeModal',
    description: 'Close modal or clear selection',
  },
  {
    key: 'ArrowUp',
    action: 'navigateUp',
    description: 'Navigate to previous task',
  },
  {
    key: 'ArrowDown',
    action: 'navigateDown',
    description: 'Navigate to next task',
  },
  {
    key: 'Enter',
    action: 'editTask',
    description: 'Edit selected task',
  },
  {
    key: ' ',
    action: 'toggleComplete',
    description: 'Toggle task completion',
  },
  {
    key: 'Delete',
    action: 'deleteTask',
    description: 'Delete selected task',
  },
];
