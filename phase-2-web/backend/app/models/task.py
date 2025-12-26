"""
Task model and schemas for task management system.

This module defines the Task entity with SQLModel for database ORM
and Pydantic validation. Includes schemas for create, update, and read operations.

Feature: 003-task-crud
"""

from sqlmodel import SQLModel, Field
from datetime import datetime, date, timezone
from typing import Optional
from enum import Enum


class TaskPriority(str, Enum):
    """Task priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(SQLModel):
    """
    Base model for Task containing shared fields.

    Used as foundation for TaskCreate and Task models.
    """
    title: str = Field(
        max_length=200,
        min_length=1,
        description="Task title (required, 1-200 characters)"
    )
    description: Optional[str] = Field(
        default="",
        max_length=1000,
        description="Task description (optional, max 1000 characters)"
    )
    completed: bool = Field(
        default=False,
        description="Task completion status (default: false)"
    )
    priority: str = Field(
        default=TaskPriority.MEDIUM,
        max_length=20,
        description="Task priority (low, medium, high)"
    )
    due_date: Optional[date] = Field(
        default=None,
        description="Optional due date for the task"
    )
    category_id: Optional[int] = Field(
        default=None,
        description="Category ID (optional, null = uncategorized)"
    )
    is_recurring: bool = Field(
        default=False,
        description="Whether this is a recurring task"
    )
    recurrence_pattern: Optional[str] = Field(
        default=None,
        max_length=20,
        description="Recurrence pattern (daily, weekly, monthly)"
    )
    recurrence_interval: Optional[int] = Field(
        default=1,
        description="Recurrence interval (every X days/weeks/months)"
    )
    recurrence_end_date: Optional[date] = Field(
        default=None,
        description="When to stop recurring"
    )
    sort_order: Optional[int] = Field(
        default=None,
        description="User-defined sort position (null for tasks created before this feature)"
    )


class Task(TaskBase, table=True):
    """
    Database model for Task entity.

    Represents a single todo item with title, description, and completion status.
    Each task belongs to a user (user_id foreign key).

    Table name: tasks
    Indexes: user_id, (user_id, created_at DESC)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(
        default=None,
        primary_key=True,
        description="Unique task identifier (auto-generated)"
    )
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        description="Owner user ID (from JWT token)"
    )
    parent_task_id: Optional[int] = Field(
        default=None,
        foreign_key="tasks.id",
        description="Parent task ID for recurring instances"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Task creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Last update timestamp (UTC, auto-updated)"
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


class TaskCreate(TaskBase):
    """
    Schema for creating new tasks.

    Excludes auto-generated fields (id, user_id, timestamps).
    User ID is extracted from JWT token, not provided in request body.

    Validation:
    - title: required, 1-200 characters
    - description: optional, max 1000 characters
    - completed: optional, defaults to false
    - priority: optional, defaults to medium
    - due_date: optional
    - category_id: optional
    - is_recurring: optional, defaults to false
    - recurrence_pattern: optional (daily, weekly, monthly)
    - recurrence_interval: optional, defaults to 1
    - recurrence_end_date: optional
    """
    pass


class TaskUpdate(SQLModel):
    """
    Schema for updating existing tasks.

    All fields are optional to allow partial updates.
    At least one field must be provided.

    Validation:
    - title: if provided, must be 1-200 characters
    - description: if provided, must be max 1000 characters
    - completed: if provided, must be boolean
    - priority: if provided, must be low/medium/high
    - due_date: if provided, must be valid date
    - category_id: if provided, must reference valid category or null
    - is_recurring: if provided, must be boolean
    - recurrence_pattern: if provided, must be daily/weekly/monthly
    - recurrence_interval: if provided, must be positive integer
    - recurrence_end_date: if provided, must be valid date
    - sort_order: if provided, must be integer
    """
    title: Optional[str] = Field(
        default=None,
        max_length=200,
        min_length=1,
        description="Updated task title"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Updated task description"
    )
    completed: Optional[bool] = Field(
        default=None,
        description="Updated completion status"
    )
    priority: Optional[str] = Field(
        default=None,
        description="Updated priority (low, medium, high)"
    )
    due_date: Optional[date] = Field(
        default=None,
        description="Updated due date"
    )
    category_id: Optional[int] = Field(
        default=None,
        description="Updated category ID (null = uncategorized)"
    )
    is_recurring: Optional[bool] = Field(
        default=None,
        description="Updated recurring status"
    )
    recurrence_pattern: Optional[str] = Field(
        default=None,
        description="Updated recurrence pattern"
    )
    recurrence_interval: Optional[int] = Field(
        default=None,
        description="Updated recurrence interval"
    )
    recurrence_end_date: Optional[date] = Field(
        default=None,
        description="Updated recurrence end date"
    )
    sort_order: Optional[int] = Field(
        default=None,
        description="Updated sort order position"
    )


class TaskRead(TaskBase):
    """
    Schema for reading tasks (API response).

    Includes all fields including auto-generated ones.
    Used for API responses to ensure clients get complete task data.
    """
    id: int
    user_id: int
    parent_task_id: Optional[int]
    created_at: datetime
    updated_at: datetime
