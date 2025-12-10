"""Tests for Task model."""

from datetime import datetime

import pytest

from models import Task


class TestTaskModel:
    """Test suite for Task dataclass."""

    def test_task_creation(self):
        """Test creating a task with all fields."""
        now = datetime.now()
        task = Task(
            id=1,
            title="Test Task",
            description="Test description",
            completed=False,
            created_at=now,
            updated_at=now
        )

        assert task.id == 1
        assert task.title == "Test Task"
        assert task.description == "Test description"
        assert task.completed is False
        assert task.created_at == now
        assert task.updated_at == now

    def test_task_str_pending(self):
        """Test __str__ representation for pending task."""
        now = datetime.now()
        task = Task(
            id=1,
            title="My Task",
            description="Description",
            completed=False,
            created_at=now,
            updated_at=now
        )

        result = str(task)
        assert "[1]" in result
        assert "○" in result  # Pending indicator
        assert "My Task" in result

    def test_task_str_completed(self):
        """Test __str__ representation for completed task."""
        now = datetime.now()
        task = Task(
            id=2,
            title="Done Task",
            description="Description",
            completed=True,
            created_at=now,
            updated_at=now
        )

        result = str(task)
        assert "[2]" in result
        assert "✓" in result  # Completed indicator
        assert "Done Task" in result

    def test_task_empty_description(self):
        """Test task with empty description."""
        now = datetime.now()
        task = Task(
            id=1,
            title="Title Only",
            description="",
            completed=False,
            created_at=now,
            updated_at=now
        )

        assert task.description == ""

    def test_task_special_characters(self):
        """Test task with special characters and emojis."""
        now = datetime.now()
        task = Task(
            id=1,
            title="React & Vue: Comparison 🚀",
            description="Test @#$%",
            completed=False,
            created_at=now,
            updated_at=now
        )

        assert "🚀" in task.title
        assert "&" in task.title
        assert "@#$%" in task.description
