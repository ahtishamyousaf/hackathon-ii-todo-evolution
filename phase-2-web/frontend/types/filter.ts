/**
 * Filter and search types for enhanced search system.
 *
 * Feature: 005-quick-wins-ux (US6: Enhanced Search & Filters)
 */

export type FilterOperator = 'is' | 'priority' | 'category' | 'due';

export interface ParsedFilter {
  operator: FilterOperator;
  value: string;
  raw: string; // Original filter string (e.g., "is:completed")
}

export interface FilterChip {
  id: string;
  operator: FilterOperator;
  value: string;
  label: string; // Display label (e.g., "Status: Completed")
}

export interface SearchState {
  query: string;
  textQuery: string; // Query with filters removed
  filters: ParsedFilter[];
  chips: FilterChip[];
}
