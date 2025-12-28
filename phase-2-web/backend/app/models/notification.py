"""
Notification Model

Stores in-app notifications for users.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Notification(SQLModel, table=True):
    """
    In-app notification for users.
    """
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)

    # Notification content
    type: str = Field(max_length=50)  # task_assigned, task_due, comment_added, etc.
    title: str = Field(max_length=200)
    message: str = Field(max_length=500)

    # Related entity
    related_task_id: Optional[int] = Field(default=None)
    related_user_id: Optional[str] = Field(default=None)

    # Status
    read: bool = Field(default=False)

    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
