-- Migration: Add category_id to tasks table
-- Feature: 004-task-categories
-- Date: 2025-12-24

-- Add category_id column to tasks (nullable - tasks can be uncategorized)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS category_id INTEGER NULL;

-- Add foreign key constraint with ON DELETE SET NULL
-- When a category is deleted, tasks are preserved but become uncategorized
ALTER TABLE tasks ADD CONSTRAINT fk_task_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Create index for fast category filtering
CREATE INDEX idx_tasks_category ON tasks(category_id);
