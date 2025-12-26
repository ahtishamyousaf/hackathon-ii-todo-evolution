"""
Subtask Model

A subtask represents a smaller action item within a task.
Each subtask belongs to a parent task and can be marked complete/incomplete.
"""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Subtask(SQLModel, table=True):
    """
    Subtask model for breaking down tasks into smaller items.

    Attributes:
        id: Unique identifier for the subtask
        task_id: Foreign key to parent task
        title: Title of the subtask
        completed: Whether the subtask is completed
        order: Display order for sorting subtasks
        created_at: When the subtask was created
        updated_at: When the subtask was last updated
    """
    __tablename__ = "subtasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True, nullable=False)
    title: str = Field(max_length=200, nullable=False)
    completed: bool = Field(default=False, nullable=False)
    order: int = Field(default=0, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
