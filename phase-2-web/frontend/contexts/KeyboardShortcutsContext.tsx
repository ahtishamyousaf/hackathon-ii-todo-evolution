'use client';

/**
 * Keyboard shortcuts context for global keyboard navigation system.
 *
 * Provides centralized keyboard shortcut management across the application.
 * Handles global key bindings, navigation state, and action dispatching.
 *
 * Feature: 005-quick-wins-ux (US1: Keyboard Shortcuts System)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ShortcutAction, KeyBinding, KeyboardNavigationState } from '@/types/keyboard';
import { isInputFocused, matchesBinding, defaultShortcuts } from '@/utils/keyboardHelpers';

interface KeyboardShortcutsContextValue {
  navigationState: KeyboardNavigationState;
  setNavigationState: React.Dispatch<React.SetStateAction<KeyboardNavigationState>>;
  registerHandler: (action: ShortcutAction, handler: () => void) => void;
  unregisterHandler: (action: ShortcutAction) => void;
  shortcuts: KeyBinding[];
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | undefined>(
  undefined
);

interface KeyboardShortcutsProviderProps {
  children: React.ReactNode;
}

export function KeyboardShortcutsProvider({ children }: KeyboardShortcutsProviderProps) {
  const [navigationState, setNavigationState] = useState<KeyboardNavigationState>({
    focusedIndex: -1,
    selectedTaskIds: [],
    isNavigating: false,
  });

  const [handlers, setHandlers] = useState<Map<ShortcutAction, () => void>>(new Map());
  const [shortcuts] = useState<KeyBinding[]>(defaultShortcuts);
  const [enabled, setEnabled] = useState(true);

  const registerHandler = useCallback((action: ShortcutAction, handler: () => void) => {
    setHandlers((prev) => {
      const next = new Map(prev);
      next.set(action, handler);
      return next;
    });
  }, []);

  const unregisterHandler = useCallback((action: ShortcutAction) => {
    setHandlers((prev) => {
      const next = new Map(prev);
      next.delete(action);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts when typing in input fields
      if (isInputFocused()) {
        // Except for Escape key - always allow closing
        if (event.key !== 'Escape') {
          return;
        }
      }

      // Find matching shortcut
      for (const binding of shortcuts) {
        if (matchesBinding(event, binding)) {
          const handler = handlers.get(binding.action);

          if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler();
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [enabled, shortcuts, handlers]);

  const value: KeyboardShortcutsContextValue = {
    navigationState,
    setNavigationState,
    registerHandler,
    unregisterHandler,
    shortcuts,
    enabled,
    setEnabled,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook to access keyboard shortcuts context.
 */
export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutsContext);

  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutsProvider');
  }

  return context;
}
