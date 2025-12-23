"""
Database migration to add oauth_accounts table.

Run this script to add OAuth social login functionality to the database.
"""

from sqlalchemy import text
from app.database import engine


def run_migration():
    """Add oauth_accounts table for social login."""

    migration_sql = """
    -- Create oauth_accounts table
    CREATE TABLE IF NOT EXISTS oauth_accounts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider VARCHAR(50) NOT NULL,
        provider_user_id VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        access_token VARCHAR(500),
        refresh_token VARCHAR(500),
        token_expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_oauth_accounts_user_id
        ON oauth_accounts(user_id);

    CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider
        ON oauth_accounts(provider);

    CREATE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user_id
        ON oauth_accounts(provider_user_id);

    -- Create unique constraint to prevent duplicate OAuth connections
    CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_accounts_provider_user
        ON oauth_accounts(provider, provider_user_id);
    """

    with engine.begin() as conn:
        print("Running OAuth accounts migration...")
        conn.execute(text(migration_sql))
        print("✅ OAuth accounts table created successfully!")


if __name__ == "__main__":
    run_migration()
