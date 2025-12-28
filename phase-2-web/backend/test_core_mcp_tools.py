#!/usr/bin/env python3
"""
Comprehensive test for core MCP tools (Task Management).

Tests the 5 required MCP tools for Phase III compliance.
"""
import asyncio
import sys
from sqlmodel import Session, create_engine, select
from app.models.task import Task
from app.models.user import User
from app.database import get_session
from app.utils.password import hash_password
from app.mcp.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)


TEST_USER_ID = "test_mcp_user_12345"


def create_test_user(session: Session):
    """Create a test user in the database."""
    print("📝 Creating test user...")

    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.id == TEST_USER_ID)
    ).first()

    if existing_user:
        print(f"   ✅ Test user already exists: {TEST_USER_ID}")
        return

    # Create new test user with hashed password
    test_user = User(
        id=TEST_USER_ID,
        email="test_mcp@example.com",
        password_hash=hash_password("test_password_12345")
    )

    session.add(test_user)
    session.commit()
    print(f"   ✅ Test user created: {TEST_USER_ID}")


async def test_add_task(session: Session):
    """Test add_task MCP tool."""
    print("🧪 Test 1: add_task")

    result = await add_task(
        user_id=TEST_USER_ID,
        title="Test Task 1",
        description="This is a test task created by MCP tool",
        session=session
    )

    if result["status"] == "created" and result["task_id"]:
        print(f"   ✅ Task created: ID {result['task_id']}, Title: {result['title']}")
        return result["task_id"], True
    else:
        print(f"   ❌ Failed: {result}")
        return None, False


async def test_list_tasks(session: Session):
    """Test list_tasks MCP tool."""
    print("\n🧪 Test 2: list_tasks")

    result = await list_tasks(
        user_id=TEST_USER_ID,
        status="all",
        session=session
    )

    if "tasks" in result and result["count"] >= 1:
        print(f"   ✅ Found {result['count']} task(s)")
        for task in result["tasks"][:3]:  # Show first 3
            status_icon = "✓" if task["completed"] else "□"
            print(f"      {status_icon} Task {task['id']}: {task['title']}")
        return True
    else:
        print(f"   ❌ Failed: {result}")
        return False


async def test_complete_task(session: Session, task_id: int):
    """Test complete_task MCP tool."""
    print(f"\n🧪 Test 3: complete_task (Task ID: {task_id})")

    result = await complete_task(
        user_id=TEST_USER_ID,
        task_id=task_id,
        session=session
    )

    if result["status"] == "completed":
        print(f"   ✅ Task marked as complete: {result['title']}")
        return True
    else:
        print(f"   ❌ Failed: {result}")
        return False


async def test_update_task(session: Session, task_id: int):
    """Test update_task MCP tool."""
    print(f"\n🧪 Test 4: update_task (Task ID: {task_id})")

    result = await update_task(
        user_id=TEST_USER_ID,
        task_id=task_id,
        title="Updated Test Task",
        description="This task was updated by MCP tool",
        session=session
    )

    if result["status"] == "updated":
        print(f"   ✅ Task updated: {result['title']}")
        print(f"      Updated fields: {', '.join(result['updated_fields'])}")
        return True
    else:
        print(f"   ❌ Failed: {result}")
        return False


async def test_delete_task(session: Session, task_id: int):
    """Test delete_task MCP tool."""
    print(f"\n🧪 Test 5: delete_task (Task ID: {task_id})")

    result = await delete_task(
        user_id=TEST_USER_ID,
        task_id=task_id,
        session=session
    )

    if result["status"] == "deleted":
        print(f"   ✅ Task deleted: {result['title']}")
        return True
    else:
        print(f"   ❌ Failed: {result}")
        return False


async def test_list_tasks_pending(session: Session):
    """Test list_tasks with status filter."""
    print("\n🧪 Test 6: list_tasks (status=pending)")

    result = await list_tasks(
        user_id=TEST_USER_ID,
        status="pending",
        session=session
    )

    if "tasks" in result:
        print(f"   ✅ Found {result['count']} pending task(s)")
        return True
    else:
        print(f"   ❌ Failed: {result}")
        return False


async def cleanup_test_tasks(session: Session):
    """Clean up test tasks."""
    print("\n🧹 Cleaning up test tasks...")

    # Delete all test tasks
    tasks = session.exec(
        select(Task).where(Task.user_id == TEST_USER_ID)
    ).all()

    for task in tasks:
        session.delete(task)

    session.commit()
    print(f"   ✅ Deleted {len(tasks)} test task(s)")


async def main():
    """Run all MCP tool tests."""
    print("=" * 70)
    print("Core MCP Tools - Comprehensive Test")
    print("=" * 70)
    print(f"Test User ID: {TEST_USER_ID}\n")

    results = []
    task_id = None

    # Get database session
    session_gen = get_session()
    session = next(session_gen)

    try:
        # Create test user if it doesn't exist
        create_test_user(session)

        # Test 1: Add task
        task_id, success = await test_add_task(session)
        results.append(success)

        if not task_id:
            print("\n❌ Cannot continue tests without task_id")
            return 1

        # Test 2: List tasks
        success = await test_list_tasks(session)
        results.append(success)

        # Test 3: Complete task
        success = await test_complete_task(session, task_id)
        results.append(success)

        # Test 4: Update task
        success = await test_update_task(session, task_id)
        results.append(success)

        # Test 5: Delete task
        success = await test_delete_task(session, task_id)
        results.append(success)

        # Test 6: List pending tasks
        success = await test_list_tasks_pending(session)
        results.append(success)

        # Cleanup
        await cleanup_test_tasks(session)

        # Summary
        print("\n" + "=" * 70)
        print("Test Results Summary")
        print("=" * 70)
        passed = sum(results)
        total = len(results)

        print(f"✅ Passed: {passed}/{total}")
        print(f"❌ Failed: {total - passed}/{total}")

        if passed == total:
            print("\n🎉 All core MCP tools working perfectly!")
            print("✅ Phase III: 100% COMPLIANT")
            return 0
        else:
            print(f"\n⚠️  {total - passed} test(s) failed!")
            return 1

    finally:
        try:
            next(session_gen)
        except StopIteration:
            pass


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
