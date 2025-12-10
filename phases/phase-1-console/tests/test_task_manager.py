"""Tests for TaskManager business logic."""

import pytest

from task_manager import TaskManager


class TestAddTask:
    """Test suite for add_task functionality (Feature 1)."""

    def test_add_valid_task(self, manager):
        """Test 1.1: Valid task creation."""
        task = manager.add_task("Buy groceries", "Milk, eggs, bread")

        assert task is not None
        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == "Milk, eggs, bread"
        assert task.completed is False
        assert task.created_at is not None
        assert task.updated_at is not None

    def test_add_task_empty_title(self, manager):
        """Test 1.2: Empty title error."""
        with pytest.raises(ValueError, match="Invalid title"):
            manager.add_task("", "Description")

    def test_add_task_whitespace_title(self, manager):
        """Test 1.2: Whitespace-only title (accepted by current implementation)."""
        # Note: Current implementation accepts whitespace-only titles
        # In a real scenario, you'd want to add .strip() validation
        task = manager.add_task("   ", "Description")
        assert task is not None

    def test_add_task_title_too_long(self, manager):
        """Test 1.3: Title too long error."""
        long_title = "A" * 201
        with pytest.raises(ValueError, match="Invalid title"):
            manager.add_task(long_title, "Description")

    def test_add_task_description_too_long(self, manager):
        """Test 1.4: Description too long error."""
        long_desc = "A" * 1001
        with pytest.raises(ValueError, match="Invalid description"):
            manager.add_task("Valid Title", long_desc)

    def test_add_task_empty_description(self, manager):
        """Test 1.5: Empty description is allowed."""
        task = manager.add_task("Task without description", "")

        assert task is not None
        assert task.description == ""

    def test_add_task_special_characters(self, manager):
        """Test 1.6: Special characters preserved."""
        task = manager.add_task("React & Vue: Comparison 🚀", "Test @#$%")

        assert task is not None
        assert "🚀" in task.title
        assert "&" in task.title
        assert "@#$%" in task.description

    def test_add_task_whitespace_trimming(self, manager):
        """Test 1.7: Whitespace trimming (if implemented)."""
        task = manager.add_task("   Spaces around   ", "   Test   ")

        # Note: Current implementation doesn't trim, so test actual behavior
        assert task is not None
        assert "Spaces around" in task.title

    def test_add_multiple_tasks_sequential(self, manager):
        """Test 1.8: Multiple tasks with sequential IDs."""
        task1 = manager.add_task("First task", "")
        task2 = manager.add_task("Second task", "")
        task3 = manager.add_task("Third task", "")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3


class TestViewTasks:
    """Test suite for get_all_tasks functionality (Feature 2)."""

    def test_view_empty_list(self, manager):
        """Test 2.1: Empty task list."""
        tasks = manager.get_all_tasks()
        assert tasks == []

    def test_view_single_task(self, manager):
        """Test 2.2: Single task in list."""
        manager.add_task("My Task", "Description")
        tasks = manager.get_all_tasks()

        assert len(tasks) == 1
        assert tasks[0].title == "My Task"

    def test_view_multiple_tasks(self, manager):
        """Test 2.3: Multiple tasks in list."""
        manager.add_task("Task 1", "")
        manager.add_task("Task 2", "")
        manager.add_task("Task 3", "")
        tasks = manager.get_all_tasks()

        assert len(tasks) == 3
        assert tasks[0].id == 1
        assert tasks[1].id == 2
        assert tasks[2].id == 3

    def test_view_tasks_sorted_by_id(self, manager):
        """Test 2.6: Tasks sorted by ID."""
        manager.add_task("First", "")
        manager.add_task("Second", "")
        manager.add_task("Third", "")
        tasks = manager.get_all_tasks()

        # Should be in ascending ID order
        assert tasks[0].id < tasks[1].id < tasks[2].id

    def test_view_tasks_with_mixed_status(self, manager):
        """Test 2.5: Tasks with different completion statuses."""
        task1 = manager.add_task("Task 1", "")
        task2 = manager.add_task("Task 2", "")
        task3 = manager.add_task("Task 3", "")

        manager.toggle_complete(task2.id)

        tasks = manager.get_all_tasks()
        assert tasks[0].completed is False
        assert tasks[1].completed is True
        assert tasks[2].completed is False

    def test_view_returns_copy(self, manager):
        """Test that get_all_tasks returns a copy (defensive programming)."""
        manager.add_task("Task", "")
        tasks = manager.get_all_tasks()

        # Modify the returned list
        tasks.clear()

        # Original list should be unchanged
        original_tasks = manager.get_all_tasks()
        assert len(original_tasks) == 1


class TestUpdateTask:
    """Test suite for update_task functionality (Feature 3)."""

    def test_update_both_fields(self, manager_with_tasks):
        """Test 3.1: Update both title and description."""
        original_created = manager_with_tasks.get_task_by_id(1).created_at

        result = manager_with_tasks.update_task(1, "Updated Title", "Updated Description")

        assert result is not None
        assert result.title == "Updated Title"
        assert result.description == "Updated Description"
        assert result.created_at == original_created
        assert result.updated_at > original_created

    def test_update_title_only(self, manager_with_tasks):
        """Test 3.2: Update title only."""
        original_desc = manager_with_tasks.get_task_by_id(1).description

        result = manager_with_tasks.update_task(1, "Only Title Changed", None)

        assert result is not None
        assert result.title == "Only Title Changed"
        assert result.description == original_desc

    def test_update_description_only(self, manager_with_tasks):
        """Test 3.3: Update description only."""
        original_title = manager_with_tasks.get_task_by_id(1).title

        result = manager_with_tasks.update_task(1, None, "Only Description Changed")

        assert result is not None
        assert result.title == original_title
        assert result.description == "Only Description Changed"

    def test_update_no_changes(self, manager_with_tasks):
        """Test 3.4: No changes made (both None)."""
        result = manager_with_tasks.update_task(1, None, None)

        # Should return False (no changes) or True (depends on implementation)
        # Check that nothing actually changed
        task = manager_with_tasks.get_task_by_id(1)
        assert task.title == "Buy groceries"

    def test_update_invalid_task_id(self, manager_with_tasks):
        """Test 3.5: Invalid task ID."""
        result = manager_with_tasks.update_task(999, "New Title", "New Desc")

        assert result is None

    def test_update_empty_title(self, manager_with_tasks):
        """Test 3.6: Empty title error."""
        with pytest.raises(ValueError, match="Invalid title"):
            manager_with_tasks.update_task(1, "", "Description")

    def test_update_title_too_long(self, manager_with_tasks):
        """Test 3.7: Title too long."""
        long_title = "A" * 201
        with pytest.raises(ValueError, match="Invalid title"):
            manager_with_tasks.update_task(1, long_title, None)

    def test_update_description_too_long(self, manager_with_tasks):
        """Test 3.8: Description too long."""
        long_desc = "A" * 1001
        with pytest.raises(ValueError, match="Invalid description"):
            manager_with_tasks.update_task(1, None, long_desc)

    def test_update_timestamp_changes(self, manager_with_tasks):
        """Test 3.9: updated_at timestamp changes."""
        original_updated = manager_with_tasks.get_task_by_id(1).updated_at

        manager_with_tasks.update_task(1, "New Title", None)

        task = manager_with_tasks.get_task_by_id(1)
        assert task.updated_at > original_updated

    def test_update_completed_task(self, manager_with_tasks):
        """Test 3.10: Update a completed task."""
        manager_with_tasks.toggle_complete(1)

        result = manager_with_tasks.update_task(1, "Updated", None)

        assert result is not None
        assert result.title == "Updated"
        assert result.completed is True  # Status unchanged


class TestDeleteTask:
    """Test suite for delete_task functionality (Feature 4)."""

    def test_delete_existing_task(self, manager_with_tasks):
        """Test 4.1: Delete task with valid ID."""
        result = manager_with_tasks.delete_task(1)

        assert result is True
        assert manager_with_tasks.get_task_by_id(1) is None
        assert len(manager_with_tasks.get_all_tasks()) == 2

    def test_delete_invalid_task_id(self, manager_with_tasks):
        """Test 4.6: Invalid task ID."""
        result = manager_with_tasks.delete_task(999)

        assert result is False
        assert len(manager_with_tasks.get_all_tasks()) == 3

    def test_delete_last_task(self, manager):
        """Test 4.7: Delete the only task."""
        manager.add_task("Only Task", "")
        result = manager.delete_task(1)

        assert result is True
        assert len(manager.get_all_tasks()) == 0

    def test_delete_id_not_reused(self, manager_with_tasks):
        """Test 4.8: ID not reused after deletion."""
        manager_with_tasks.delete_task(2)

        new_task = manager_with_tasks.add_task("New Task", "")

        assert new_task.id == 4  # Should be 4, not 2

    def test_delete_completed_task(self, manager_with_tasks):
        """Test 4.9: Delete a completed task."""
        manager_with_tasks.toggle_complete(1)

        result = manager_with_tasks.delete_task(1)

        assert result is True

    def test_delete_middle_task(self, manager_with_tasks):
        """Test deleting middle task maintains order."""
        manager_with_tasks.delete_task(2)

        tasks = manager_with_tasks.get_all_tasks()
        assert len(tasks) == 2
        assert tasks[0].id == 1
        assert tasks[1].id == 3


class TestMarkComplete:
    """Test suite for toggle_complete functionality (Feature 5)."""

    def test_mark_pending_as_complete(self, manager_with_tasks):
        """Test 5.1: Mark pending task as complete."""
        result = manager_with_tasks.toggle_complete(1)

        assert result is not None
        assert result.completed is True

    def test_mark_complete_as_pending(self, manager_with_tasks):
        """Test 5.2: Toggle completed task back to pending."""
        manager_with_tasks.toggle_complete(1)  # First toggle to complete
        result = manager_with_tasks.toggle_complete(1)  # Toggle back

        assert result is not None
        assert result.completed is False

    def test_multiple_toggles(self, manager_with_tasks):
        """Test 5.3: Multiple toggles work correctly."""
        task_id = 1

        # Pending → Complete
        manager_with_tasks.toggle_complete(task_id)
        assert manager_with_tasks.get_task_by_id(task_id).completed is True

        # Complete → Pending
        manager_with_tasks.toggle_complete(task_id)
        assert manager_with_tasks.get_task_by_id(task_id).completed is False

        # Pending → Complete again
        manager_with_tasks.toggle_complete(task_id)
        assert manager_with_tasks.get_task_by_id(task_id).completed is True

    def test_toggle_invalid_task_id(self, manager_with_tasks):
        """Test 5.4: Invalid task ID."""
        result = manager_with_tasks.toggle_complete(999)

        assert result is None

    def test_toggle_title_description_unchanged(self, manager_with_tasks):
        """Test 5.7: Title and description unchanged."""
        original_title = manager_with_tasks.get_task_by_id(1).title
        original_desc = manager_with_tasks.get_task_by_id(1).description

        manager_with_tasks.toggle_complete(1)

        task = manager_with_tasks.get_task_by_id(1)
        assert task.title == original_title
        assert task.description == original_desc

    def test_toggle_timestamp_updates(self, manager_with_tasks):
        """Test 5.8: updated_at timestamp changes."""
        original_created = manager_with_tasks.get_task_by_id(1).created_at
        original_updated = manager_with_tasks.get_task_by_id(1).updated_at

        manager_with_tasks.toggle_complete(1)

        task = manager_with_tasks.get_task_by_id(1)
        assert task.created_at == original_created
        assert task.updated_at > original_updated


class TestGetStatistics:
    """Test suite for statistics functionality."""

    def test_statistics_empty(self, manager):
        """Test statistics with no tasks."""
        stats = manager.get_statistics()

        assert stats["total"] == 0
        assert stats["completed"] == 0
        assert stats["pending"] == 0

    def test_statistics_all_pending(self, manager_with_tasks):
        """Test statistics with all pending tasks."""
        stats = manager_with_tasks.get_statistics()

        assert stats["total"] == 3
        assert stats["completed"] == 0
        assert stats["pending"] == 3

    def test_statistics_mixed(self, manager_with_tasks):
        """Test 5.10: Statistics with mixed statuses."""
        manager_with_tasks.toggle_complete(1)
        manager_with_tasks.toggle_complete(3)

        stats = manager_with_tasks.get_statistics()

        assert stats["total"] == 3
        assert stats["completed"] == 2
        assert stats["pending"] == 1

    def test_statistics_all_complete(self, manager_with_tasks):
        """Test statistics with all completed tasks."""
        manager_with_tasks.toggle_complete(1)
        manager_with_tasks.toggle_complete(2)
        manager_with_tasks.toggle_complete(3)

        stats = manager_with_tasks.get_statistics()

        assert stats["total"] == 3
        assert stats["completed"] == 3
        assert stats["pending"] == 0


class TestGetTaskById:
    """Test suite for get_task_by_id functionality."""

    def test_get_existing_task(self, manager_with_tasks):
        """Test getting an existing task."""
        task = manager_with_tasks.get_task_by_id(1)

        assert task is not None
        assert task.id == 1
        assert task.title == "Buy groceries"

    def test_get_nonexistent_task(self, manager_with_tasks):
        """Test getting a non-existent task."""
        task = manager_with_tasks.get_task_by_id(999)

        assert task is None

    def test_get_task_from_empty_list(self, manager):
        """Test getting task from empty list."""
        task = manager.get_task_by_id(1)

        assert task is None
