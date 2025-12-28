-- Migration 008: Create conversations table
-- Feature: Phase III AI-Powered Todo Chatbot
-- Date: 2025-12-27
-- Description: Creates conversations table for chat sessions between users and AI assistant

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index for user isolation queries
CREATE INDEX idx_conversations_user ON conversations(user_id);

-- Add comment for documentation
COMMENT ON TABLE conversations IS 'Chat conversations between users and AI assistant (Phase III)';
COMMENT ON COLUMN conversations.user_id IS 'Owner of conversation (foreign key to users.id)';
COMMENT ON COLUMN conversations.created_at IS 'Timestamp when conversation started';
COMMENT ON COLUMN conversations.updated_at IS 'Timestamp of last message in conversation';
