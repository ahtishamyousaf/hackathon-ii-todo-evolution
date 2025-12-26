/**
 * Hook for registering keyboard shortcuts in components.
 *
 * Feature: 005-quick-wins-ux (US1: Keyboard Shortcuts System)
 */

import { useEffect } from 'react';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import type { ShortcutAction } from '@/types/keyboard';

/**
 * Register a keyboard shortcut handler for a specific action.
 *
 * @param action - The shortcut action to handle
 * @param handler - The function to call when the shortcut is triggered
 * @param enabled - Whether the shortcut is enabled (default: true)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useKeyboardShortcut('newTask', () => {
 *     openNewTaskModal();
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useKeyboardShortcut(
  action: ShortcutAction,
  handler: () => void,
  enabled: boolean = true
) {
  const { registerHandler, unregisterHandler } = useKeyboardShortcuts();

  useEffect(() => {
    if (!enabled) {
      unregisterHandler(action);
      return;
    }

    registerHandler(action, handler);

    return () => {
      unregisterHandler(action);
    };
  }, [action, handler, enabled, registerHandler, unregisterHandler]);
}
