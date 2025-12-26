"""
Task model for database.

SQLModel combines Pydantic validation with SQLAlchemy ORM.
"""

from datetime import datetime, timezone, date
from typing import Optional
from sqlmodel import Field, SQLModel
from enum import Enum


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(SQLModel, table=True):
    """
    Task model for todo items.

    Each task belongs to a user and has a title, optional description,
    completion status, priority level, optional due date, and timestamps.
    """

    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False, nullable=False)
    priority: str = Field(default=TaskPriority.MEDIUM, max_length=20, nullable=False)
    due_date: Optional[date] = Field(default=None, nullable=True)
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id", nullable=True)

    # Recurring task fields
    is_recurring: bool = Field(default=False, nullable=False)
    recurrence_pattern: Optional[str] = Field(default=None, max_length=20, nullable=True)  # daily, weekly, monthly
    recurrence_interval: Optional[int] = Field(default=1, nullable=True)  # Every X days/weeks/months
    recurrence_end_date: Optional[date] = Field(default=None, nullable=True)
    parent_task_id: Optional[int] = Field(default=None, foreign_key="tasks.id", nullable=True)  # For recurring instances

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "priority": "medium",
                "due_date": "2025-12-20"
            }
        }
