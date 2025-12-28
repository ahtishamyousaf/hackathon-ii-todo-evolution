-- Migration 010: Fix user_id type mismatch for Better Auth integration
--
-- Problem: Better Auth uses VARCHAR for user IDs, but backend models had INTEGER
-- Solution: Alter all tables to use VARCHAR for user_id foreign keys
--
-- Date: 2025-12-27
-- Feature: Phase III - AI-Powered Todo Chatbot

-- Step 1: Drop all foreign key constraints that reference users.id
ALTER TABLE IF EXISTS tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;
ALTER TABLE IF EXISTS categories DROP CONSTRAINT IF EXISTS categories_user_id_fkey;
ALTER TABLE IF EXISTS time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE IF EXISTS task_templates DROP CONSTRAINT IF EXISTS task_templates_user_id_fkey;
ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS conversations DROP CONSTRAINT IF EXISTS conversations_user_id_fkey;
ALTER TABLE IF EXISTS messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE IF EXISTS password_reset_tokens DROP CONSTRAINT IF EXISTS password_reset_tokens_user_id_fkey;
ALTER TABLE IF EXISTS attachments DROP CONSTRAINT IF EXISTS attachments_user_id_fkey;
ALTER TABLE IF EXISTS comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS oauth_accounts DROP CONSTRAINT IF EXISTS oauth_accounts_user_id_fkey;

-- Step 2: Clear all data (fresh start for testing)
-- WARNING: This will delete ALL data in the database!
TRUNCATE TABLE users CASCADE;

-- Step 3: Alter users table ID column type from INTEGER to VARCHAR
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS users_id_seq;
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR USING id::VARCHAR;

-- Step 4: Alter all user_id columns in other tables to VARCHAR
ALTER TABLE IF EXISTS tasks ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS categories ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS time_entries ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS task_templates ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS notifications ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS notifications ALTER COLUMN related_user_id TYPE VARCHAR USING related_user_id::VARCHAR;
ALTER TABLE IF EXISTS password_reset_tokens ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS attachments ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS comments ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;
ALTER TABLE IF EXISTS oauth_accounts ALTER COLUMN user_id TYPE VARCHAR USING user_id::VARCHAR;

-- Step 5: Recreate foreign key constraints
ALTER TABLE IF EXISTS tasks ADD CONSTRAINT tasks_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS categories ADD CONSTRAINT categories_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS time_entries ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS task_templates ADD CONSTRAINT task_templates_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS password_reset_tokens ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS attachments ADD CONSTRAINT attachments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS oauth_accounts ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Create conversations and messages tables if they don't exist (Phase III)
CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);

-- Migration complete
COMMENT ON TABLE users IS 'Updated to use VARCHAR ID for Better Auth compatibility (Migration 010)';
