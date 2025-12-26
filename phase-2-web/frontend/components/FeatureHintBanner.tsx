"use client";

/**
 * Feature hint banner to help users discover new Phase 1 Quick Wins features.
 *
 * Shows helpful tips about keyboard shortcuts, drag & drop, bulk operations, etc.
 * Can be dismissed and won't show again (stored in localStorage).
 */

import { useState, useEffect } from "react";
import { X, Keyboard, MousePointer2, CheckSquare, Calendar, Search } from "lucide-react";

export default function FeatureHintBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      icon: <Keyboard className="w-5 h-5 text-blue-500" />,
      title: "Keyboard Shortcuts",
      description: "Press N to create a task, / to search, Esc to close modals",
      action: "View all shortcuts in Settings",
    },
    {
      icon: <MousePointer2 className="w-5 h-5 text-green-500" />,
      title: "Drag & Drop",
      description: "Drag tasks to reorder them - your custom order is saved automatically",
      action: "Try dragging a task now!",
    },
    {
      icon: <CheckSquare className="w-5 h-5 text-purple-500" />,
      title: "Bulk Operations",
      description: "Select multiple tasks and perform actions on all of them at once",
      action: "Click the checkboxes to select tasks",
    },
    {
      icon: <Calendar className="w-5 h-5 text-orange-500" />,
      title: "Smart Dates",
      description: "Quick buttons for Today, Tomorrow, Next Week when setting due dates",
      action: "Try creating a new task",
    },
    {
      icon: <Search className="w-5 h-5 text-pink-500" />,
      title: "Advanced Search",
      description: "Use filters like is:completed, priority:high, due:today",
      action: "Try it in the search bar",
    },
  ];

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem("featureHintsDismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("featureHintsDismissed", "true");
    setIsVisible(false);
  };

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrevious = () => {
    if (currentTip > 0) {
      setCurrentTip(currentTip - 1);
    }
  };

  if (!isVisible) return null;

  const tip = tips[currentTip];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500 p-4 mb-6 rounded-lg shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {tip.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              ✨ New Feature: {tip.title}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {currentTip + 1} of {tips.length}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {tip.description}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            💡 {tip.action}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Dismiss feature hints"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentTip === 0}
          className="px-3 py-1 text-sm rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {currentTip === tips.length - 1 ? "Got it!" : "Next"}
        </button>
        <button
          onClick={handleDismiss}
          className="ml-auto text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Don't show again
        </button>
      </div>
    </div>
  );
}
