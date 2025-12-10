"""Task management business logic."""

from datetime import datetime
from typing import List, Optional

from models import Task


class TaskManager:
    """Manages the todo task list.

    This class handles all CRUD operations for tasks, manages unique ID
    generation, and maintains the in-memory task storage.
    """

    def __init__(self) -> None:
        """Initialize with empty task list."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str, description: str = "") -> Task:
        """Create and add a new task.

        Args:
            title: Task title (required, non-empty, max 200 chars)
            description: Task description (optional, max 1000 chars)

        Returns:
            The created Task object

        Raises:
            ValueError: If title is invalid or description too long
        """
        # Validation
        if not title or len(title) > 200:
            raise ValueError("Invalid title: must be non-empty and max 200 characters")
        if len(description) > 1000:
            raise ValueError("Invalid description: max 1000 characters")

        # Create task
        now = datetime.now()
        task = Task(
            id=self._next_id,
            title=title,
            description=description,
            completed=False,
            created_at=now,
            updated_at=now
        )

        # Add to list and increment ID counter
        self._tasks.append(task)
        self._next_id += 1

        return task

    def get_all_tasks(self) -> List[Task]:
        """Get all tasks.

        Returns:
            List of all Task objects (copy of internal list)
        """
        return self._tasks.copy()

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """Get a task by ID.

        Args:
            task_id: ID of the task to retrieve

        Returns:
            Task object if found, None otherwise
        """
        for task in self._tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        description: Optional[str] = None
    ) -> Optional[Task]:
        """Update task title and/or description.

        Args:
            task_id: ID of task to update
            title: New title (None = keep current)
            description: New description (None = keep current)

        Returns:
            Updated Task object, or None if task not found

        Raises:
            ValueError: If new values are invalid
        """
        # Find task
        task = self.get_task_by_id(task_id)
        if not task:
            return None

        # Validate new values if provided
        if title is not None and (not title or len(title) > 200):
            raise ValueError("Invalid title: must be non-empty and max 200 characters")
        if description is not None and len(description) > 1000:
            raise ValueError("Invalid description: max 1000 characters")

        # Update fields
        if title is not None:
            task.title = title
        if description is not None:
            task.description = description

        # Always update timestamp if any field changed
        if title is not None or description is not None:
            task.updated_at = datetime.now()

        return task

    def delete_task(self, task_id: int) -> bool:
        """Delete a task by ID.

        Args:
            task_id: ID of task to delete

        Returns:
            True if task was deleted, False if task not found
        """
        # Find task
        task = self.get_task_by_id(task_id)
        if not task:
            return False

        # Remove from list
        self._tasks.remove(task)
        return True

    def toggle_complete(self, task_id: int) -> Optional[Task]:
        """Toggle task completion status.

        Args:
            task_id: ID of task to toggle

        Returns:
            Updated Task object, or None if task not found
        """
        # Find task
        task = self.get_task_by_id(task_id)
        if not task:
            return None

        # Toggle completed status
        task.completed = not task.completed

        # Update timestamp
        task.updated_at = datetime.now()

        return task

    def get_statistics(self) -> dict:
        """Get task statistics.

        Returns:
            Dictionary with total, completed, and pending counts
        """
        total = len(self._tasks)
        completed = sum(1 for task in self._tasks if task.completed)
        pending = total - completed

        return {
            "total": total,
            "completed": completed,
            "pending": pending
        }
