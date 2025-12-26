-- Migration 007: Add sort_order field to tasks table
-- Feature: 005-quick-wins-ux (Drag & Drop Task Reordering)
--
-- This migration adds a nullable sort_order column to enable user-defined task ordering.
-- Existing tasks will have NULL sort_order and will display at the end of the list.
--
-- Usage: psql $DATABASE_URL -f migrations/007_add_task_sort_order.sql

-- Add sort_order column (nullable for backward compatibility)
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_tasks_user_sort
ON tasks(user_id, sort_order)
WHERE sort_order IS NOT NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN tasks.sort_order IS 'User-defined sort position. NULL for tasks created before this feature.';
