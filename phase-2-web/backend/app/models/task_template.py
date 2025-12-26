"""
Task Template Model

Allows users to save tasks as reusable templates.
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import Field, SQLModel, Column
from sqlalchemy import JSON


class TaskTemplate(SQLModel, table=True):
    """
    Template for creating tasks from predefined patterns.
    """
    __tablename__ = "task_templates"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)

    name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)

    # Template data stored as JSON
    template_data: Dict[str, Any] = Field(sa_column=Column(JSON))

    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
