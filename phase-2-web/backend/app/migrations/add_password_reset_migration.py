"""
Database migration to add password_reset_tokens table.

Run this script to add the password reset functionality to the database.
"""

from sqlalchemy import text
from app.database import engine


def run_migration():
    """Add password_reset_tokens table."""

    migration_sql = """
    -- Create password_reset_tokens table
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP NULL
    );

    -- Create indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id
        ON password_reset_tokens(user_id);

    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token
        ON password_reset_tokens(token);
    """

    with engine.begin() as conn:
        print("Running password reset migration...")
        conn.execute(text(migration_sql))
        print("✅ Password reset tokens table created successfully!")


if __name__ == "__main__":
    run_migration()
