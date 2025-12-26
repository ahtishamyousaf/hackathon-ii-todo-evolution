'use client';

/**
 * Smart date picker with quick-select buttons.
 *
 * Feature: 005-quick-wins-ux (US2: Smart Due Date Selection)
 */

import React, { useState, useEffect } from 'react';
import { getToday, getTomorrow, getNextWeek, getNextMonth, formatInputDate } from '@/utils/dateHelpers';

interface SmartDatePickerProps {
  value: string | null;
  onChange: (date: string | null) => void;
  label?: string;
}

export default function SmartDatePicker({ value, onChange, label = 'Due Date' }: SmartDatePickerProps) {
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);

  const quickOptions = [
    { label: 'Today', getValue: () => formatInputDate(getToday()), key: 'today' },
    { label: 'Tomorrow', getValue: () => formatInputDate(getTomorrow()), key: 'tomorrow' },
    { label: 'Next Week', getValue: () => formatInputDate(getNextWeek()), key: 'nextWeek' },
    { label: 'Next Month', getValue: () => formatInputDate(getNextMonth()), key: 'nextMonth' },
  ];

  // Update selectedQuick when value changes externally
  useEffect(() => {
    if (!value) {
      setSelectedQuick(null);
      return;
    }

    // Check if current value matches a quick option
    const matchingOption = quickOptions.find((opt) => opt.getValue() === value);
    setSelectedQuick(matchingOption?.key || null);
  }, [value]);

  const handleQuickSelect = (option: typeof quickOptions[0]) => {
    const dateValue = option.getValue();
    setSelectedQuick(option.key);
    onChange(dateValue);
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value || null;
    setSelectedQuick(null); // Clear quick selection when manually selecting
    onChange(newValue);
  };

  const handleClear = () => {
    setSelectedQuick(null);
    onChange(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2">
        {quickOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => handleQuickSelect(option)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              selectedQuick === option.key
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Date input */}
      <div className="flex gap-2">
        <input
          type="date"
          value={value || ''}
          onChange={handleDateInputChange}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
