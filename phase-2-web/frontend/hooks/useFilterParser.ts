'use client';

import { useState, useCallback, useMemo } from 'react';
import { parseSearchQuery, filtersToChips, reconstructQuery } from '@/utils/filterParser';
import type { ParsedFilter, FilterChip } from '@/types/filter';

export function useFilterParser(initialQuery: string = '') {
  const [query, setQuery] = useState(initialQuery);

  const parsed = useMemo(() => parseSearchQuery(query), [query]);

  const chips = useMemo(() => filtersToChips(parsed.filters), [parsed.filters]);

  const removeFilter = useCallback((chipId: string) => {
    const chipIndex = parseInt(chipId.split('-')[1]);
    const newFilters = parsed.filters.filter((_, i) => i !== chipIndex);
    setQuery(reconstructQuery(newFilters, parsed.textQuery));
  }, [parsed.filters, parsed.textQuery]);

  const clearAllFilters = useCallback(() => {
    setQuery(parsed.textQuery);
  }, [parsed.textQuery]);

  return {
    query,
    setQuery,
    textQuery: parsed.textQuery,
    filters: parsed.filters,
    chips,
    removeFilter,
    clearAllFilters,
  };
}
