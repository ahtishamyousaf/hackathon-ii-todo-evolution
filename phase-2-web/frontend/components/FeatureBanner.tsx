"use client";

/**
 * FeatureBanner - Quick reference banner showing available Phase 1 features
 */

import { X, Keyboard, MousePointer2, Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function FeatureBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('feature-banner-dismissed') === 'true';
    }
    return false;
  });

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('feature-banner-dismissed', 'true');
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      "border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
    )}>
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🎉</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              New Features Available!
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Keyboard Shortcuts</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">N</kbd> for new task, <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> to search
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MousePointer2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Drag & Drop</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Drag tasks to reorder them (feature coming soon)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <SearchIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Advanced Filters</p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Try: <code className="px-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">priority:high</code>
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800/50",
            "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
            "transition-colors"
          )}
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
