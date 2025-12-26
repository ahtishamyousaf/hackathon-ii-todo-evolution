'use client';

import { useState, useEffect } from 'react';

const MAX_RECENT_SEARCHES = 10;
const STORAGE_KEY = 'taskflow_recent_searches';

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const addSearch = (query: string) => {
    if (!query.trim()) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { recentSearches, addSearch, clearSearches };
}
