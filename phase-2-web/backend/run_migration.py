"""
Run database migration script.

Usage: python run_migration.py migrations/001_create_tasks_table.sql
"""

import sys
import os
from pathlib import Path
from sqlalchemy import create_engine, text

# Add app directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings

def run_migration(migration_file: str):
    """
    Execute a SQL migration file against the database.

    Args:
        migration_file: Path to SQL file relative to backend directory
    """
    # Read migration SQL
    migration_path = Path(__file__).parent / migration_file

    if not migration_path.exists():
        print(f"❌ Error: Migration file not found: {migration_path}")
        sys.exit(1)

    with open(migration_path, 'r') as f:
        sql_content = f.read()

    # Create database engine
    engine = create_engine(settings.database_url)

    print(f"📋 Running migration: {migration_file}")
    print(f"🔗 Database: {settings.database_url.split('@')[1].split('?')[0]}")  # Hide credentials
    print()

    try:
        with engine.connect() as connection:
            # Execute migration SQL
            connection.execute(text(sql_content))
            connection.commit()

        print(f"✅ Migration completed successfully!")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run_migration.py <migration_file>")
        print("Example: python run_migration.py migrations/001_create_tasks_table.sql")
        sys.exit(1)

    migration_file = sys.argv[1]
    run_migration(migration_file)
