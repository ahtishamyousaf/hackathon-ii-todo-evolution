"""
Task dependency model for database.

Represents relationships between tasks where one task depends on another.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class TaskDependency(SQLModel, table=True):
    """
    Task dependency model for linking tasks together.

    Represents a relationship where task_id depends on depends_on_task_id.
    The dependent task should not be completable until its dependency is complete.
    """

    __tablename__ = "task_dependencies"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True, nullable=False)
    depends_on_task_id: int = Field(foreign_key="tasks.id", index=True, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    class Config:
        json_schema_extra = {
            "example": {
                "task_id": 2,
                "depends_on_task_id": 1
            }
        }
