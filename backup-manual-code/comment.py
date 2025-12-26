"""
Comment Model

A comment represents a note or update added to a task.
Each comment belongs to a task and is created by a user.
"""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Comment(SQLModel, table=True):
    """
    Comment model for adding notes and updates to tasks.

    Attributes:
        id: Unique identifier for the comment
        task_id: Foreign key to parent task
        user_id: Foreign key to user who created the comment
        content: The comment text/content
        created_at: When the comment was created
        updated_at: When the comment was last updated
    """
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True, nullable=False)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
