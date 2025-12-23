"""
Database migration to add subtasks table.

This migration creates a new subtasks table for breaking down tasks into smaller action items.
"""

from sqlalchemy import create_engine, text
from app.config import settings

# Database connection
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, echo=True)


def run_migration():
    """Create the subtasks table."""
    with engine.connect() as conn:
        # Create subtasks table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS subtasks (
                id SERIAL PRIMARY KEY,
                task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT FALSE,
                "order" INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Create index on task_id for faster lookups
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id)
        """))

        conn.commit()
        print("✅ Subtasks table created successfully!")


if __name__ == "__main__":
    print("Running subtasks migration...")
    run_migration()
    print("Migration completed!")
