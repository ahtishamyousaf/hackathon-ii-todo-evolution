"""Pytest configuration and fixtures."""

import sys
from pathlib import Path

import pytest

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from models import Task
from task_manager import TaskManager


@pytest.fixture
def manager():
    """Create a fresh TaskManager instance for each test."""
    return TaskManager()


@pytest.fixture
def manager_with_tasks():
    """Create a TaskManager with 3 sample tasks."""
    mgr = TaskManager()
    mgr.add_task("Buy groceries", "Milk, eggs, bread")
    mgr.add_task("Write report", "Q4 summary")
    mgr.add_task("Call dentist", "")
    return mgr


@pytest.fixture
def sample_task(manager):
    """Create a single task and return it."""
    task = manager.add_task("Sample Task", "Sample description")
    return task
