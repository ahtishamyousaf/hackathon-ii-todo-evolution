"""
Database migration to add comments table.

This migration creates a new comments table for adding notes and updates to tasks.
"""

from sqlalchemy import create_engine, text
from app.config import settings

# Database connection
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, echo=True)


def run_migration():
    """Create the comments table."""
    with engine.connect() as conn:
        # Create comments table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Create indexes for faster lookups
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id)
        """))

        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)
        """))

        conn.commit()
        print("✅ Comments table created successfully!")


if __name__ == "__main__":
    print("Running comments migration...")
    run_migration()
    print("Migration completed!")
