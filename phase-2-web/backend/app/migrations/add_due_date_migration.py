"""
Add due_date column to tasks table.

This migration adds an optional due_date field to track task deadlines.
"""

from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    # Add due_date column
    conn.execute(text("""
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS due_date DATE DEFAULT NULL
    """))
    conn.commit()
    print("✓ due_date column added to tasks table")

print("Migration completed successfully!")
