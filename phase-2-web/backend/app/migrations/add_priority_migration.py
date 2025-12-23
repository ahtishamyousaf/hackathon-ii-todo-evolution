"""
Add priority column to tasks table.
"""
from sqlalchemy import create_engine, text
from app.config import settings

engine = create_engine(settings.database_url)

with engine.connect() as conn:
    # Add priority column if it doesn't exist
    conn.execute(text("""
        ALTER TABLE tasks
        ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium' NOT NULL
    """))
    conn.commit()
    print("✓ Priority column added to tasks table")
