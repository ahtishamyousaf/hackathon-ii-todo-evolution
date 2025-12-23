"""
Database migration to add recurring task fields.

This migration adds fields to support recurring tasks.
"""

from sqlalchemy import create_engine, text
from app.config import settings

# Database connection
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, echo=True)


def run_migration():
    """Add recurring task fields to tasks table."""
    with engine.connect() as conn:
        # Add recurring task fields
        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN NOT NULL DEFAULT FALSE
        """))

        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS recurrence_pattern VARCHAR(20)
        """))

        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1
        """))

        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS recurrence_end_date DATE
        """))

        conn.execute(text("""
            ALTER TABLE tasks
            ADD COLUMN IF NOT EXISTS parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL
        """))

        # Create index on parent_task_id for faster lookups
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_parent_task_id ON tasks(parent_task_id)
        """))

        # Create index on is_recurring for filtering
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring)
        """))

        conn.commit()
        print("✅ Recurring task fields added successfully!")


if __name__ == "__main__":
    print("Running recurring tasks migration...")
    run_migration()
    print("Migration completed!")
