"""
Add categories table and category_id to tasks table.

This migration creates the categories table for organizing tasks.
"""

from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    # Create categories table
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(50) NOT NULL,
            color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """))
    print("✓ Categories table created")

    # Add index on user_id for faster queries
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id)
    """))
    print("✓ Index on categories.user_id created")

    # Add category_id to tasks table
    conn.execute(text("""
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL
    """))
    print("✓ category_id column added to tasks table")

    conn.commit()

print("Migration completed successfully!")
