"use client";

import { useState } from "react";
import { X, Calendar, Repeat } from "lucide-react";
import Button from "./ui/Button";

export interface RecurringTaskSettings {
  is_recurring: boolean;
  recurrence_pattern: "daily" | "weekly" | "monthly" | "yearly" | null;
  recurrence_interval: number;
  recurrence_end_date: string | null;
}

interface RecurringTaskEditorProps {
  initialSettings?: RecurringTaskSettings;
  onSave: (settings: RecurringTaskSettings) => void;
  onClose: () => void;
}

export default function RecurringTaskEditor({
  initialSettings,
  onSave,
  onClose,
}: RecurringTaskEditorProps) {
  const [isRecurring, setIsRecurring] = useState(
    initialSettings?.is_recurring ?? false
  );
  const [pattern, setPattern] = useState<RecurringTaskSettings["recurrence_pattern"]>(
    initialSettings?.recurrence_pattern ?? "daily"
  );
  const [interval, setInterval] = useState(
    initialSettings?.recurrence_interval ?? 1
  );
  const [endDate, setEndDate] = useState(
    initialSettings?.recurrence_end_date ?? ""
  );

  const handleSave = () => {
    if (!isRecurring) {
      onSave({
        is_recurring: false,
        recurrence_pattern: null,
        recurrence_interval: 1,
        recurrence_end_date: null,
      });
    } else {
      onSave({
        is_recurring: true,
        recurrence_pattern: pattern,
        recurrence_interval: interval,
        recurrence_end_date: endDate || null,
      });
    }
  };

  const getPatternDescription = () => {
    if (!isRecurring || !pattern) return "";

    const intervalText = interval > 1 ? `every ${interval}` : "every";

    switch (pattern) {
      case "daily":
        return `Repeats ${intervalText} ${interval > 1 ? "days" : "day"}`;
      case "weekly":
        return `Repeats ${intervalText} ${interval > 1 ? "weeks" : "week"}`;
      case "monthly":
        return `Repeats ${intervalText} ${interval > 1 ? "months" : "month"}`;
      case "yearly":
        return `Repeats ${intervalText} ${interval > 1 ? "years" : "year"}`;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Repeat className="w-6 h-6" />
              Recurring Task
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Set up a repeating schedule for this task
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Enable/Disable Recurring */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Make this task recurring
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Task will automatically repeat based on your schedule
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {isRecurring && (
            <>
              {/* Recurrence Pattern */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Repeat Pattern
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["daily", "weekly", "monthly", "yearly"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPattern(p)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        pattern === p
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interval */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Repeat Every
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={interval}
                    onChange={(e) =>
                      setInterval(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-24 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-center font-semibold"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pattern === "daily" && (interval > 1 ? "days" : "day")}
                    {pattern === "weekly" && (interval > 1 ? "weeks" : "week")}
                    {pattern === "monthly" && (interval > 1 ? "months" : "month")}
                    {pattern === "yearly" && (interval > 1 ? "years" : "year")}
                  </span>
                </div>
              </div>

              {/* End Date (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  End Date (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  {endDate && (
                    <button
                      onClick={() => setEndDate("")}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Clear end date"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Leave empty to repeat indefinitely
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1">
                  Schedule Preview
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getPatternDescription()}
                  {endDate && ` until ${new Date(endDate).toLocaleDateString()}`}
                  {!endDate && " (no end date)"}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
