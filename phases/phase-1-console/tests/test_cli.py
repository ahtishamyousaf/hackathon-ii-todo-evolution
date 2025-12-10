"""Tests for CLI functionality."""

import pytest
from io import StringIO
from unittest.mock import patch

from cli import (
    format_task_list,
    display_error,
    display_success,
)


class TestFormatTaskList:
    """Test suite for task list formatting."""

    def test_format_empty_list(self, manager):
        """Test 2.1: Empty list formatting."""
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        # Empty list returns formatted output with headers
        assert "ID" in result or result == ""

    def test_format_single_task(self, manager):
        """Test 2.2: Format single task."""
        task = manager.add_task("My Task", "Description")
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        assert "ID" in result  # Header
        assert "Status" in result
        assert "Title" in result
        assert "My Task" in result
        assert "○ Pending" in result or "Pending" in result
        assert "Total: 1 task" in result

    def test_format_multiple_tasks(self, manager_with_tasks):
        """Test 2.3: Format multiple tasks."""
        tasks = manager_with_tasks.get_all_tasks()
        result = format_task_list(tasks)

        assert "Buy groceries" in result
        assert "Write report" in result
        assert "Call dentist" in result
        assert "Total: 3 tasks" in result

    def test_format_long_title_truncation(self, manager):
        """Test 2.4: Long title truncation."""
        long_title = "This is a very long title that exceeds twenty-five characters"
        manager.add_task(long_title, "")
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        # Should be truncated with "..."
        assert "..." in result
        # Full title should not appear
        lines = result.split("\n")
        for line in lines:
            if "This is a very long" in line:
                # Check line length is reasonable (not showing full title)
                assert len(line) < 150  # Reasonable line length

    def test_format_mixed_status(self, manager_with_tasks):
        """Test 2.5: Mixed completion statuses."""
        manager_with_tasks.toggle_complete(2)
        tasks = manager_with_tasks.get_all_tasks()
        result = format_task_list(tasks)

        # Should show both pending and completed indicators
        assert ("○" in result or "Pending" in result)
        assert ("✓" in result or "Done" in result or "Complete" in result)
        assert "1 completed" in result
        assert "2 pending" in result

    def test_format_statistics_accuracy(self, manager_with_tasks):
        """Test 5.10: Statistics accuracy."""
        manager_with_tasks.toggle_complete(1)
        manager_with_tasks.toggle_complete(3)
        tasks = manager_with_tasks.get_all_tasks()
        result = format_task_list(tasks)

        assert "Total: 3 tasks" in result
        assert "2 completed" in result
        assert "1 pending" in result

    def test_format_date_consistency(self, manager):
        """Test 2.7: Date format consistency."""
        manager.add_task("Task 1", "")
        manager.add_task("Task 2", "")
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        # Check for date format YYYY-MM-DD HH:MM
        import re
        date_pattern = r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}'
        matches = re.findall(date_pattern, result)
        assert len(matches) >= 2  # At least 2 dates shown


class TestDisplayFunctions:
    """Test suite for display helper functions."""

    def test_display_error(self):
        """Test error message display."""
        with patch('sys.stdout', new=StringIO()) as fake_output:
            display_error("Test error message")
            output = fake_output.getvalue()

            assert "❌" in output or "Error" in output
            assert "Test error message" in output

    def test_display_success(self):
        """Test success message display."""
        with patch('sys.stdout', new=StringIO()) as fake_output:
            display_success("Test success message")
            output = fake_output.getvalue()

            assert "✓" in output or "Success" in output or "✅" in output
            assert "Test success message" in output


class TestUnicodeSupport:
    """Test suite for unicode and special character support."""

    def test_unicode_in_title(self, manager):
        """Test 2.8: Unicode characters in title."""
        manager.add_task("مثال", "")  # Arabic
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        assert "مثال" in result

    def test_emoji_in_title(self, manager):
        """Test emoji in title."""
        manager.add_task("Task 🚀", "Description")
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        assert "🚀" in result

    def test_special_characters(self, manager):
        """Test special characters in content."""
        manager.add_task("React & Vue", "Test @#$%")
        tasks = manager.get_all_tasks()
        result = format_task_list(tasks)

        assert "&" in result
