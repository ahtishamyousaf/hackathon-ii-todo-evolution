'use client';

/**
 * Keyboard shortcuts help panel component.
 *
 * Displays all available keyboard shortcuts with descriptions.
 * Can be shown as a modal or embedded in settings page.
 *
 * Feature: 005-quick-wins-ux (US1: Keyboard Shortcuts System)
 */

import React from 'react';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';
import { getBindingDisplay } from '@/utils/keyboardHelpers';
import { Card } from './ui/Card';

interface KeyboardShortcutsHelpProps {
  embedded?: boolean; // If true, renders without modal wrapper
}

export default function KeyboardShortcutsHelp({ embedded = false }: KeyboardShortcutsHelpProps) {
  const { shortcuts } = useKeyboardShortcuts();

  const content = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
      </div>

      <div className="space-y-2">
        {shortcuts.map((binding, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {binding.description}
            </span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
              {getBindingDisplay(binding)}
            </kbd>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Keyboard shortcuts work globally except when typing in input fields.
          Press <kbd className="px-1 py-0.5 text-xs bg-blue-100 dark:bg-blue-800 rounded">Esc</kbd> to
          close modals or clear selections from anywhere.
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <Card>{content}</Card>;
}
