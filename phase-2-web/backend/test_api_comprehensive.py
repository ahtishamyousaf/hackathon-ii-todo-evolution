#!/usr/bin/env python3
"""
Comprehensive API Testing Script

Tests all features of the task management application:
- Authentication (register, login)
- Categories (CRUD)
- Tasks (CRUD with priority, due dates, recurring)
- Subtasks (CRUD)
- Comments (CRUD)
- Attachments (upload, download, delete)
- Task Dependencies (create, list, circular detection)
- Dashboard (stats and trends)
"""

import requests
import json
import io
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(test_name, passed, message=""):
    """Log test result."""
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"

    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    test_results.append(result)
    print(result)

def test_authentication():
    """Test user registration and login."""
    print("\n" + "="*60)
    print("TESTING AUTHENTICATION")
    print("="*60)

    # Register new user
    email = f"test_{datetime.now().timestamp()}@example.com"
    password = "TestPassword123"

    response = requests.post(
        f"{API_URL}/auth/register",
        json={"email": email, "password": password}
    )
    log_test("Register User", response.status_code == 201, f"Status: {response.status_code}")

    # Login
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"email": email, "password": password}
    )
    log_test("Login User", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token")
        log_test("Access Token Received", token is not None, f"Token length: {len(token) if token else 0}")
        return token, email

    return None, None

def test_categories(token):
    """Test category CRUD operations."""
    print("\n" + "="*60)
    print("TESTING CATEGORIES")
    print("="*60)

    headers = {"Authorization": f"Bearer {token}"}

    # Create category
    response = requests.post(
        f"{API_URL}/categories",
        headers=headers,
        json={"name": "Test Category", "color": "#FF5733"}
    )
    log_test("Create Category", response.status_code == 201, f"Status: {response.status_code}")

    category_id = None
    if response.status_code == 201:
        category_id = response.json().get("id")

    # List categories
    response = requests.get(f"{API_URL}/categories", headers=headers)
    log_test("List Categories", response.status_code == 200, f"Status: {response.status_code}")

    # Update category
    if category_id:
        response = requests.put(
            f"{API_URL}/categories/{category_id}",
            headers=headers,
            json={"name": "Updated Category"}
        )
        log_test("Update Category", response.status_code == 200, f"Status: {response.status_code}")

    return category_id

def test_tasks(token, category_id):
    """Test task CRUD operations with advanced features."""
    print("\n" + "="*60)
    print("TESTING TASKS")
    print("="*60)

    headers = {"Authorization": f"Bearer {token}"}

    # Create task with priority and due date
    due_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    response = requests.post(
        f"{API_URL}/tasks",
        headers=headers,
        json={
            "title": "Test High Priority Task",
            "description": "This is a test task with priority",
            "priority": "high",
            "due_date": due_date,
            "category_id": category_id
        }
    )
    log_test("Create Task with Priority", response.status_code == 201, f"Status: {response.status_code}")

    task_id = None
    if response.status_code == 201:
        task_id = response.json().get("id")

    # Create recurring task
    response = requests.post(
        f"{API_URL}/tasks",
        headers=headers,
        json={
            "title": "Daily Recurring Task",
            "is_recurring": True,
            "recurrence_pattern": "daily",
            "recurrence_interval": 1
        }
    )
    log_test("Create Recurring Task", response.status_code == 201, f"Status: {response.status_code}")

    recurring_task_id = None
    if response.status_code == 201:
        recurring_task_id = response.json().get("id")

    # List all tasks
    response = requests.get(f"{API_URL}/tasks", headers=headers)
    log_test("List All Tasks", response.status_code == 200, f"Status: {response.status_code}")

    # Filter by priority
    response = requests.get(f"{API_URL}/tasks?priority=high", headers=headers)
    log_test("Filter Tasks by Priority", response.status_code == 200, f"Status: {response.status_code}")

    # Search tasks
    response = requests.get(f"{API_URL}/tasks?search=High Priority", headers=headers)
    log_test("Search Tasks", response.status_code == 200, f"Status: {response.status_code}")

    # Update task
    if task_id:
        response = requests.put(
            f"{API_URL}/tasks/{task_id}",
            headers=headers,
            json={"completed": True}
        )
        log_test("Update Task (Mark Complete)", response.status_code == 200, f"Status: {response.status_code}")

    return task_id, recurring_task_id

def test_subtasks(token, task_id):
    """Test subtask operations."""
    print("\n" + "="*60)
    print("TESTING SUBTASKS")
    print("="*60)

    if not task_id:
        log_test("Subtasks (Skipped)", False, "No task_id available")
        return None

    headers = {"Authorization": f"Bearer {token}"}

    # Create subtask
    response = requests.post(
        f"{API_URL}/tasks/{task_id}/subtasks/",
        headers=headers,
        json={"title": "First subtask", "order": 1}
    )
    log_test("Create Subtask", response.status_code == 201, f"Status: {response.status_code}")

    subtask_id = None
    if response.status_code == 201:
        subtask_id = response.json().get("id")

    # Create another subtask
    response = requests.post(
        f"{API_URL}/tasks/{task_id}/subtasks/",
        headers=headers,
        json={"title": "Second subtask", "order": 2}
    )
    log_test("Create Second Subtask", response.status_code == 201, f"Status: {response.status_code}")

    # List subtasks
    response = requests.get(f"{API_URL}/tasks/{task_id}/subtasks/", headers=headers)
    log_test("List Subtasks", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        subtasks = response.json()
        log_test("Subtask Count", len(subtasks) == 2, f"Expected 2, got {len(subtasks)}")

    # Update subtask
    if subtask_id:
        response = requests.put(
            f"{API_URL}/tasks/{task_id}/subtasks/{subtask_id}",
            headers=headers,
            json={"completed": True}
        )
        log_test("Update Subtask (Mark Complete)", response.status_code == 200, f"Status: {response.status_code}")

    return subtask_id

def test_comments(token, task_id):
    """Test comment operations."""
    print("\n" + "="*60)
    print("TESTING COMMENTS")
    print("="*60)

    if not task_id:
        log_test("Comments (Skipped)", False, "No task_id available")
        return None

    headers = {"Authorization": f"Bearer {token}"}

    # Create comment
    response = requests.post(
        f"{API_URL}/tasks/{task_id}/comments",
        headers=headers,
        json={"content": "This is a test comment"}
    )
    log_test("Create Comment", response.status_code == 201, f"Status: {response.status_code}")

    comment_id = None
    if response.status_code == 201:
        comment_id = response.json().get("id")

    # Create another comment
    response = requests.post(
        f"{API_URL}/tasks/{task_id}/comments",
        headers=headers,
        json={"content": "Another comment for testing"}
    )
    log_test("Create Second Comment", response.status_code == 201, f"Status: {response.status_code}")

    # List comments
    response = requests.get(f"{API_URL}/tasks/{task_id}/comments", headers=headers)
    log_test("List Comments", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        comments = response.json()
        log_test("Comment Count", len(comments) == 2, f"Expected 2, got {len(comments)}")

    # Update comment
    if comment_id:
        response = requests.put(
            f"{API_URL}/tasks/{task_id}/comments/{comment_id}",
            headers=headers,
            json={"content": "Updated comment content"}
        )
        log_test("Update Comment", response.status_code == 200, f"Status: {response.status_code}")

    return comment_id

def test_attachments(token, task_id):
    """Test file attachment operations."""
    print("\n" + "="*60)
    print("TESTING ATTACHMENTS")
    print("="*60)

    if not task_id:
        log_test("Attachments (Skipped)", False, "No task_id available")
        return None

    headers = {"Authorization": f"Bearer {token}"}

    # Create a test file
    test_file_content = b"This is a test file content for attachment testing."
    test_file = io.BytesIO(test_file_content)

    # Upload attachment
    files = {"file": ("test_document.txt", test_file, "text/plain")}
    response = requests.post(
        f"{API_URL}/tasks/{task_id}/attachments",
        headers=headers,
        files=files
    )
    log_test("Upload Attachment", response.status_code == 201, f"Status: {response.status_code}")

    attachment_id = None
    if response.status_code == 201:
        attachment_id = response.json().get("id")
        filename = response.json().get("filename")
        log_test("Attachment Filename Saved", filename is not None, f"Filename: {filename}")

    # List attachments
    response = requests.get(f"{API_URL}/tasks/{task_id}/attachments", headers=headers)
    log_test("List Attachments", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        attachments = response.json()
        log_test("Attachment Count", len(attachments) >= 1, f"Got {len(attachments)} attachments")

    # Download attachment
    if attachment_id:
        response = requests.get(
            f"{API_URL}/tasks/{task_id}/attachments/{attachment_id}/download",
            headers=headers
        )
        log_test("Download Attachment", response.status_code == 200, f"Status: {response.status_code}")

        if response.status_code == 200:
            log_test("Downloaded Content Match", response.content == test_file_content,
                    f"Size: {len(response.content)} bytes")

    return attachment_id

def test_task_dependencies(token, task_id, recurring_task_id):
    """Test task dependency operations."""
    print("\n" + "="*60)
    print("TESTING TASK DEPENDENCIES")
    print("="*60)

    if not task_id or not recurring_task_id:
        log_test("Task Dependencies (Skipped)", False, "Missing task IDs")
        return None

    headers = {"Authorization": f"Bearer {token}"}

    # Create dependency
    response = requests.post(
        f"{API_URL}/task-dependencies",
        headers=headers,
        json={"task_id": task_id, "depends_on_task_id": recurring_task_id}
    )
    log_test("Create Task Dependency", response.status_code == 201, f"Status: {response.status_code}")

    dependency_id = None
    if response.status_code == 201:
        dependency_id = response.json().get("id")

    # List dependencies for task
    response = requests.get(f"{API_URL}/task-dependencies/task/{task_id}", headers=headers)
    log_test("List Task Dependencies", response.status_code == 200, f"Status: {response.status_code}")

    # Test circular dependency prevention
    response = requests.post(
        f"{API_URL}/task-dependencies",
        headers=headers,
        json={"task_id": recurring_task_id, "depends_on_task_id": task_id}
    )
    log_test("Circular Dependency Prevention", response.status_code == 400,
            f"Status: {response.status_code} (should be 400)")

    return dependency_id

def test_dashboard(token):
    """Test dashboard statistics."""
    print("\n" + "="*60)
    print("TESTING DASHBOARD")
    print("="*60)

    headers = {"Authorization": f"Bearer {token}"}

    # Get dashboard stats
    response = requests.get(f"{API_URL}/dashboard/stats", headers=headers)
    log_test("Get Dashboard Stats", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        stats = response.json()

        # Verify stats structure
        has_stats = all(key in stats for key in [
            "total_tasks", "completed_tasks", "pending_tasks",
            "completion_rate", "tasks_by_priority"
        ])
        log_test("Dashboard Stats Structure", has_stats, f"Keys present: {', '.join(stats.keys())}")

        # Verify 7-day trends
        has_trends = "completion_trends" in stats and len(stats["completion_trends"]) == 7
        log_test("7-Day Completion Trend", has_trends,
                f"Trend days: {len(stats.get('completion_trends', []))}")

        print("\nDashboard Summary:")
        print(f"  Total Tasks: {stats.get('total_tasks', 0)}")
        print(f"  Completed: {stats.get('completed_tasks', 0)}")
        print(f"  Pending: {stats.get('pending_tasks', 0)}")
        print(f"  Completion Rate: {stats.get('completion_rate', 0):.1f}%")

def cleanup_tests(token, task_id, subtask_id, comment_id, attachment_id, dependency_id, category_id):
    """Clean up test data."""
    print("\n" + "="*60)
    print("CLEANUP")
    print("="*60)

    headers = {"Authorization": f"Bearer {token}"}

    # Delete dependency
    if dependency_id:
        response = requests.delete(f"{API_URL}/task-dependencies/{dependency_id}", headers=headers)
        log_test("Delete Dependency", response.status_code == 204, f"Status: {response.status_code}")

    # Delete attachment
    if attachment_id and task_id:
        response = requests.delete(
            f"{API_URL}/tasks/{task_id}/attachments/{attachment_id}",
            headers=headers
        )
        log_test("Delete Attachment", response.status_code == 204, f"Status: {response.status_code}")

    # Delete comment
    if comment_id and task_id:
        response = requests.delete(
            f"{API_URL}/tasks/{task_id}/comments/{comment_id}",
            headers=headers
        )
        log_test("Delete Comment", response.status_code == 204, f"Status: {response.status_code}")

    # Delete subtask
    if subtask_id and task_id:
        response = requests.delete(
            f"{API_URL}/tasks/{task_id}/subtasks/{subtask_id}",
            headers=headers
        )
        log_test("Delete Subtask", response.status_code == 204, f"Status: {response.status_code}")

    # Delete task (will cascade delete remaining subtasks/comments/attachments)
    if task_id:
        response = requests.delete(f"{API_URL}/tasks/{task_id}", headers=headers)
        log_test("Delete Task", response.status_code == 204, f"Status: {response.status_code}")

    # Delete category
    if category_id:
        response = requests.delete(f"{API_URL}/categories/{category_id}", headers=headers)
        log_test("Delete Category", response.status_code == 204, f"Status: {response.status_code}")

def main():
    """Run all tests."""
    print("\n" + "="*70)
    print("COMPREHENSIVE API TEST SUITE")
    print("="*70)
    print(f"Testing API at: {BASE_URL}")
    print(f"Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Run tests
    token, email = test_authentication()

    if not token:
        print("\n❌ CRITICAL: Authentication failed. Cannot continue tests.")
        return

    category_id = test_categories(token)
    task_id, recurring_task_id = test_tasks(token, category_id)
    subtask_id = test_subtasks(token, task_id)
    comment_id = test_comments(token, task_id)
    attachment_id = test_attachments(token, task_id)
    dependency_id = test_task_dependencies(token, task_id, recurring_task_id)
    test_dashboard(token)

    # Cleanup
    cleanup_tests(token, task_id, subtask_id, comment_id, attachment_id, dependency_id, category_id)

    # Print summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Tests Passed: {tests_passed}")
    print(f"Tests Failed: {tests_failed}")
    print(f"Total Tests: {tests_passed + tests_failed}")
    print(f"Success Rate: {(tests_passed/(tests_passed+tests_failed)*100):.1f}%")
    print("\nDetailed Results:")
    for result in test_results:
        print(f"  {result}")

    print("\n" + "="*70)
    if tests_failed == 0:
        print("🎉 ALL TESTS PASSED!")
    else:
        print(f"⚠️  {tests_failed} test(s) failed. Review above for details.")
    print("="*70)

if __name__ == "__main__":
    main()
