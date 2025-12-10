"""Data models for the Todo Console App."""

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Task:
    """Represents a todo task.

    Attributes:
        id: Unique identifier (auto-generated, sequential)
        title: Task title (required, 1-200 characters)
        description: Task description (optional, 0-1000 characters)
        completed: Completion status (True/False)
        created_at: Timestamp when task was created (immutable)
        updated_at: Timestamp when task was last modified
    """
    id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    def __str__(self) -> str:
        """Return human-readable string representation.

        Returns:
            String in format: [ID] STATUS Title
        """
        status = "✓" if self.completed else "○"
        return f"[{self.id}] {status} {self.title}"
