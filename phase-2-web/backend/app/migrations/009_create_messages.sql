-- Migration 009: Create messages table
-- Feature: Phase III AI-Powered Todo Chatbot
-- Date: 2025-12-27
-- Description: Creates messages table for individual chat messages in conversations

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    conversation_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_message_conversation
        FOREIGN KEY (conversation_id)
        REFERENCES conversations(id)
        ON DELETE CASCADE
);

-- Index for fetching conversation history
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Index for user isolation
CREATE INDEX idx_messages_user ON messages(user_id);

-- Composite index for optimized history queries (conversation + timestamp)
CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE messages IS 'Individual messages in chat conversations (Phase III)';
COMMENT ON COLUMN messages.user_id IS 'Owner of message (for user isolation)';
COMMENT ON COLUMN messages.conversation_id IS 'Parent conversation (foreign key to conversations.id)';
COMMENT ON COLUMN messages.role IS 'Message sender: user or assistant';
COMMENT ON COLUMN messages.content IS 'Message text content';
COMMENT ON COLUMN messages.created_at IS 'Timestamp when message was created';
