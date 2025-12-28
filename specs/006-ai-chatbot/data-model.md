# Data Model: AI-Powered Todo Chatbot

**Feature**: Phase III Chat Integration
**Date**: 2025-12-26
**Database**: Neon PostgreSQL (existing)

---

## Entity Relationship Diagram

```
User (existing - Better Auth managed)
  │
  ├──< Tasks (existing Phase II)
  ├──< Categories (existing Phase II)
  └──< Conversations (NEW)
         └──< Messages (NEW)
```

---

## New Entities

### 1. Conversation

**Purpose**: Represents a chat session between user and AI assistant

**Table**: `conversations`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment conversation ID |
| user_id | VARCHAR | NOT NULL, FOREIGN KEY → users(id) | Owner of conversation |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When conversation started |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last message timestamp |

**Indexes**:
- `idx_conversations_user` ON `user_id` (user isolation queries)

**Constraints**:
- ON DELETE CASCADE (delete user → delete conversations)

**SQL Definition**:
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_conversations_user ON conversations(user_id);
```

**SQLModel Class**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Conversation(SQLModel, table=True):
    """
    Chat conversation between user and AI assistant.

    User Stories: US4 (Conversation Persistence), US5 (Authentication)
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships (for joins, not serialization)
    # messages: List["Message"] = Relationship(back_populates="conversation")
```

---

### 2. Message

**Purpose**: Individual message in a conversation (user or assistant)

**Table**: `messages`

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Auto-increment message ID |
| user_id | VARCHAR | NOT NULL, FOREIGN KEY → users(id) | Message belongs to user |
| conversation_id | INTEGER | NOT NULL, FOREIGN KEY → conversations(id) | Parent conversation |
| role | VARCHAR(20) | NOT NULL, CHECK IN ('user', 'assistant') | Who sent the message |
| content | TEXT | NOT NULL | Message text |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Message timestamp |

**Indexes**:
- `idx_messages_conversation` ON `conversation_id` (history fetching)
- `idx_messages_user` ON `user_id` (user isolation)
- `idx_messages_conversation_created` ON `(conversation_id, created_at DESC)` (optimized history queries)

**Constraints**:
- ON DELETE CASCADE (delete conversation → delete messages)
- CHECK role IN ('user', 'assistant')

**SQL Definition**:
```sql
CREATE TABLE messages (
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

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);
```

**SQLModel Class**:
```python
class Message(SQLModel, table=True):
    """
    Individual message in a conversation.

    User Stories: US1-US4 (All chat interactions)
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str  # Message text
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Validation
    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ("user", "assistant"):
            raise ValueError("Role must be 'user' or 'assistant'")
        return v
```

---

## Existing Entities (UNCHANGED)

### User (Better Auth)
- Managed by Better Auth
- Not modified in Phase III

### Task
- Existing Phase II entity
- No schema changes
- MCP tools interact with existing Task model

### Category
- Existing Phase II entity
- No schema changes

### Subtask, Comment, Attachment, TaskDependency
- Existing Phase II entities
- No schema changes

---

## Relationships Summary

**New Relationships**:
- `User 1:N Conversation` (one user, many conversations)
- `Conversation 1:N Message` (one conversation, many messages)
- `User 1:N Message` (for denormalization/user isolation)

**Existing Relationships** (preserved):
- `User 1:N Task`
- `User 1:N Category`
- `Task 1:N Subtask`
- `Task 1:N Comment`
- `Task 1:N Attachment`
- `Task N:N Task` (dependencies)

---

## Data Integrity Rules

1. **Cascade Deletes**:
   - Delete User → Delete Conversations → Delete Messages
   - Delete Conversation → Delete Messages
   - Task deletions do NOT affect conversations (separate concerns)

2. **Immutability**:
   - Messages are append-only (NO UPDATE operations)
   - Preserves conversation history integrity
   - Only INSERT and SELECT operations on messages table

3. **User Isolation**:
   - Every query MUST filter by user_id
   - Conversations and Messages have user_id for double isolation
   - Foreign key constraints enforce referential integrity

4. **Timestamps**:
   - created_at is set once at creation (immutable)
   - Conversation updated_at refreshed on new message
   - Messages have created_at only (no updates)

---

## Migration Files

**File**: `phase-2-web/backend/migrations/008_create_conversations.sql`
```sql
-- Phase III: Create conversations table
-- Migration 008
-- Date: 2025-12-26

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

CREATE INDEX idx_conversations_user ON conversations(user_id);

COMMENT ON TABLE conversations IS 'Chat conversations between users and AI assistant (Phase III)';
COMMENT ON COLUMN conversations.user_id IS 'Owner of the conversation (user isolation)';
COMMENT ON COLUMN conversations.updated_at IS 'Updated on every new message in conversation';
```

**File**: `phase-2-web/backend/migrations/009_create_messages.sql`
```sql
-- Phase III: Create messages table
-- Migration 009
-- Date: 2025-12-26

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

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_user ON messages(user_id);
CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

COMMENT ON TABLE messages IS 'Individual messages in conversations (Phase III)';
COMMENT ON COLUMN messages.role IS 'Message sender: "user" or "assistant"';
COMMENT ON COLUMN messages.content IS 'Message text (immutable after creation)';
COMMENT ON INDEX idx_messages_conversation_created IS 'Optimized for fetching recent messages in conversation';
```

---

## Query Examples

### 1. Create Conversation
```sql
INSERT INTO conversations (user_id)
VALUES ($1)
RETURNING id, user_id, created_at, updated_at;
```

### 2. Fetch Conversation History (Last 20 Messages)
```sql
SELECT id, role, content, created_at
FROM messages
WHERE conversation_id = $1 AND user_id = $2
ORDER BY created_at DESC
LIMIT 20;
```

### 3. Store User Message
```sql
INSERT INTO messages (user_id, conversation_id, role, content)
VALUES ($1, $2, 'user', $3)
RETURNING id, created_at;

-- Update conversation timestamp
UPDATE conversations
SET updated_at = CURRENT_TIMESTAMP
WHERE id = $2;
```

### 4. Store Assistant Response
```sql
INSERT INTO messages (user_id, conversation_id, role, content)
VALUES ($1, $2, 'assistant', $3)
RETURNING id, created_at;
```

### 5. List User's Conversations
```sql
SELECT c.id, c.created_at, c.updated_at,
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
FROM conversations c
WHERE c.user_id = $1
ORDER BY c.updated_at DESC
LIMIT 20;
```

---

## Performance Considerations

1. **Index Strategy**:
   - Composite index on `(conversation_id, created_at DESC)` for efficient history queries
   - Single column indexes on `user_id` for user isolation
   - Expected query time: <10ms for 20 messages

2. **Data Volume Estimates**:
   - Average conversation: 10-20 messages
   - Average user: 10-50 conversations
   - 1000 users × 30 conversations × 15 messages = 450,000 rows (manageable)

3. **Pagination**:
   - Load most recent 20 messages by default
   - Client can request older messages via offset
   - Prevents loading entire history for long conversations

4. **Connection Pooling**:
   - Neon serverless handles pooling automatically
   - No additional configuration needed

---

**Phase 1 Complete**: Data model defined and migration files documented
