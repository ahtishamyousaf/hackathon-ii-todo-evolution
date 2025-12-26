-- Migration: Create categories table
-- Feature: 004-task-categories
-- Date: 2025-12-24

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL CHECK (LENGTH(name) >= 1 AND LENGTH(name) <= 50),
    color VARCHAR(7) DEFAULT '#9CA3AF' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);

-- Create index for fast user category lookups
CREATE INDEX idx_categories_user ON categories(user_id);

-- Create trigger function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function before updates
CREATE TRIGGER trigger_update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();
