"""
Conversation model for Phase III: AI-Powered Todo Chatbot

Represents a chat session between a user and the AI assistant.
"""

from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional


class Conversation(SQLModel, table=True):
    """
    Chat conversation between user and AI assistant.

    User Stories:
    - US4 (Conversation Persistence): Enables resuming conversations across sessions
    - US5 (Authentication Integration): Ensures user isolation for conversations

    Relationships:
    - User 1:N Conversation (one user, many conversations)
    - Conversation 1:N Message (one conversation, many messages)
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Note: Relationships commented out to avoid circular imports
    # Uncomment if needed for joins:
    # from typing import List
    # messages: List["Message"] = Relationship(back_populates="conversation")
