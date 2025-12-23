"""
Database migration to add attachments table.

This migration creates a new attachments table for file uploads.
"""

from sqlalchemy import create_engine, text
from app.config import settings

# Database connection
DATABASE_URL = settings.database_url
engine = create_engine(DATABASE_URL, echo=True)


def run_migration():
    """Create the attachments table."""
    with engine.connect() as conn:
        # Create attachments table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS attachments (
                id SERIAL PRIMARY KEY,
                task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_size INTEGER NOT NULL,
                file_type VARCHAR(100) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """))

        # Create indexes for faster lookups
        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_attachments_task_id ON attachments(task_id)
        """))

        conn.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON attachments(user_id)
        """))

        conn.commit()
        print("✅ Attachments table created successfully!")


if __name__ == "__main__":
    print("Running attachments migration...")
    run_migration()
    print("Migration completed!")
