"""
Migration 005: Add sort_order field to tasks table

This migration adds a nullable sort_order column to enable user-defined task ordering.
Existing tasks will have NULL sort_order and will display at the end of the list.
"""

import os
from sqlalchemy import create_engine, text

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

def run_migration():
    """Execute the migration to add sort_order column"""
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Add sort_order column (nullable for backward compatibility)
        print("Adding sort_order column to tasks table...")
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS sort_order INTEGER NULL
        """))

        # Create index for efficient ordering queries
        print("Creating index on user_id and sort_order...")
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_user_sort
            ON tasks(user_id, sort_order)
            WHERE sort_order IS NOT NULL
        """))

        conn.commit()
        print("Migration 005 completed successfully!")
        print("- Added sort_order column (nullable)")
        print("- Created partial index for performance")
        print("- Existing tasks will have NULL sort_order")

def rollback_migration():
    """Rollback the migration"""
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        print("Rolling back migration 005...")

        # Drop index
        conn.execute(text("""
            DROP INDEX IF EXISTS idx_tasks_user_sort
        """))

        # Drop column
        conn.execute(text("""
            ALTER TABLE tasks
            DROP COLUMN IF EXISTS sort_order
        """))

        conn.commit()
        print("Migration 005 rolled back successfully!")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        rollback_migration()
    else:
        run_migration()
