/**
 * Category types for task categorization system.
 *
 * Defines TypeScript interfaces for Category entity and operations.
 * Matches backend Category model schemas.
 *
 * Feature: 004-task-categories
 */

/**
 * Complete Category entity (from database).
 *
 * Includes all fields including auto-generated ones (id, timestamps).
 * Used for API responses.
 */
export interface Category {
  id: number;
  name: string;
  color: string;
  user_id: number;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

/**
 * Schema for creating a new category.
 *
 * Excludes auto-generated fields (id, user_id, timestamps).
 * Used for POST /api/categories request body.
 */
export interface CategoryCreate {
  name: string;
  color?: string; // Optional, defaults to #9CA3AF (gray) if not provided
}

/**
 * Schema for updating an existing category.
 *
 * All fields are optional to allow partial updates.
 * At least one field should be provided.
 * Used for PUT /api/categories/{id} request body.
 */
export interface CategoryUpdate {
  name?: string;
  color?: string;
}
