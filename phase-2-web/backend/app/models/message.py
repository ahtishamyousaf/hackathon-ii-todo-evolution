"""
Message model for Phase III: AI-Powered Todo Chatbot

Represents individual messages in a chat conversation.
"""

from sqlmodel import SQLModel, Field
from pydantic import field_validator
from datetime import datetime
from typing import Optional


class Message(SQLModel, table=True):
    """
    Individual message in a chat conversation.

    User Stories:
    - US1 (Add Tasks): Store user requests and AI responses
    - US2 (View Tasks): Store task queries and formatted responses
    - US3 (Manage Tasks): Store task management commands and confirmations
    - US4 (Conversation Persistence): Enable full conversation history

    Relationships:
    - Conversation 1:N Message (one conversation, many messages)
    - User 1:N Message (for user isolation and denormalization)
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True)
    role: str = Field(max_length=20)  # 'user' or 'assistant'
    content: str  # Message text content
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Validation
    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        """
        Validate that role is either 'user' or 'assistant'.

        Args:
            v: Role value to validate

        Returns:
            Validated role string

        Raises:
            ValueError: If role is not 'user' or 'assistant'
        """
        if v not in ("user", "assistant"):
            raise ValueError("Role must be 'user' or 'assistant'")
        return v

    # Note: Relationships commented out to avoid circular imports
    # Uncomment if needed for joins:
    # conversation: Optional["Conversation"] = Relationship(back_populates="messages")
