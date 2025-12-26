"use client";

/**
 * KeyboardShortcutButton - Floating button showing keyboard shortcuts
 */

import { useState } from "react";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KeyboardShortcutButton() {
  const [showHelp, setShowHelp] = useState(false);

  const shortcuts = [
    { key: "N", description: "Create new task" },
    { key: "/", description: "Focus search bar" },
    { key: "Esc", description: "Close modal or dialog" },
  ];

  return (
    <>
      {/* Floating Button - positioned higher to avoid bulk toolbar */}
      <button
        onClick={() => setShowHelp(true)}
        className={cn(
          "fixed bottom-24 right-6 z-40",
          "p-4 rounded-full shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "transition-all duration-200 hover:scale-110",
          "focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        )}
        title="Keyboard Shortcuts (Press ? for help)"
      >
        <Keyboard className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {showHelp && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Keyboard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className={cn(
                  "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700",
                  "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                  "transition-colors"
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <kbd
                    className={cn(
                      "px-3 py-1.5 rounded-md font-mono text-sm font-semibold",
                      "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      "border border-gray-300 dark:border-gray-600",
                      "shadow-sm"
                    )}
                  >
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                More keyboard shortcuts coming soon!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
