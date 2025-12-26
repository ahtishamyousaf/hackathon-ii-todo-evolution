"use client";

/**
 * Help tooltip for search filters.
 * Shows examples of filter syntax when user hovers/clicks.
 */

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

export default function SearchHelpTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  const examples = [
    { filter: "is:completed", description: "Show completed tasks" },
    { filter: "is:active", description: "Show active tasks" },
    { filter: "priority:high", description: "Filter by high priority" },
    { filter: "priority:medium", description: "Filter by medium priority" },
    { filter: "priority:low", description: "Filter by low priority" },
    { filter: "due:today", description: "Tasks due today" },
    { filter: "due:overdue", description: "Overdue tasks" },
    { filter: "due:this_week", description: "Due this week" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Search help"
      >
        <HelpCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip */}
          <div className="absolute right-0 top-12 z-50 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Search Filters
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Type these filters in the search box:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {examples.map((example, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <code className="flex-shrink-0 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-mono">
                    {example.filter}
                  </code>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {example.description}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Combine filters with regular text search
              </p>
              <code className="block mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono">
                project priority:high is:active
              </code>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
