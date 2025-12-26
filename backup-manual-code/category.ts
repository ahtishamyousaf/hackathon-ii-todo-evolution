/**
 * Category type definitions for the application.
 *
 * Matches the backend Category model structure.
 */

export interface Category {
  id: number;
  user_id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreate {
  name: string;
  color?: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
}
