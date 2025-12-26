/**
 * Filter parser utility for advanced search syntax.
 */

import type { ParsedFilter, FilterChip, FilterOperator } from '@/types/filter';

export function parseSearchQuery(query: string): { filters: ParsedFilter[]; textQuery: string } {
  const filters: ParsedFilter[] = [];
  const textParts: string[] = [];
  const filterPattern = /(\w+):(\w+)/g;
  let match;
  let lastIndex = 0;

  while ((match = filterPattern.exec(query)) !== null) {
    const [raw, operator, value] = match;
    if (match.index > lastIndex) {
      textParts.push(query.slice(lastIndex, match.index));
    }
    if (isValidOperator(operator)) {
      filters.push({ operator: operator as FilterOperator, value: value.toLowerCase(), raw });
    } else {
      textParts.push(raw);
    }
    lastIndex = match.index + raw.length;
  }

  if (lastIndex < query.length) {
    textParts.push(query.slice(lastIndex));
  }

  return { filters, textQuery: textParts.join('').trim() };
}

export function filtersToChips(filters: ParsedFilter[]): FilterChip[] {
  return filters.map((filter, index) => ({
    id: 'filter-' + index,
    operator: filter.operator,
    value: filter.value,
    label: getFilterLabel(filter),
  }));
}

function getFilterLabel(filter: ParsedFilter): string {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  switch (filter.operator) {
    case 'is': return 'Status: ' + cap(filter.value);
    case 'priority': return 'Priority: ' + cap(filter.value);
    case 'category': return 'Category: ' + cap(filter.value);
    case 'due': return 'Due: ' + cap(filter.value);
    default: return cap(filter.operator) + ': ' + filter.value;
  }
}

function isValidOperator(operator: string): boolean {
  return ['is', 'priority', 'category', 'due'].includes(operator);
}

export function reconstructQuery(filters: ParsedFilter[], textQuery: string): string {
  return [...filters.map((f) => f.raw), textQuery].filter(Boolean).join(' ');
}
