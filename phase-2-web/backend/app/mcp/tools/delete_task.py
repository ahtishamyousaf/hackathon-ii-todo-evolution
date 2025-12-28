"""
MCP Tool: delete_task

Deletes a task for the authenticated user.

User Story: US3 - Manage Tasks via Chat
"""

from typing import Dict, Any
from sqlmodel import Session
from app.models.task import Task


async def delete_task(
    task_id: int,
    user_id: str,  # Injected by MCP server from JWT token
    session: Session  # Injected by MCP server
) -> Dict[str, Any]:
    """
    Delete a task permanently.

    This function is called by the AI agent when users say things like:
    - "Delete task 5"
    - "Remove the grocery task"
    - "Delete the meeting task"

    CRITICAL SECURITY: user_id is injected from JWT token by the MCP server,
    NOT from AI-provided parameters. This prevents users from deleting
    other users' tasks.

    Args:
        task_id: ID of the task to delete
        user_id: User ID from JWT token (injected, not from AI)
        session: Database session (injected by MCP server)

    Returns:
        Dict containing:
        - task_id: ID of the deleted task
        - status: "deleted"
        - title: Task title for confirmation

    Raises:
        ValueError: If task not found or user not authorized

    Example AI query: "Delete task 5"
    Example tool parameters: {"task_id": 5}
    """
    # Fetch task with user isolation check (CRITICAL SECURITY)
    task = session.get(Task, task_id)

    if not task:
        raise ValueError(f"Task {task_id} not found")

    # User isolation check (CRITICAL SECURITY)
    if task.user_id != user_id:
        raise ValueError(f"Not authorized to delete task {task_id}")

    # Store title for confirmation message before deletion
    task_title = task.title
    task_id_copy = task.id

    # Delete task
    session.delete(task)
    session.commit()

    return {
        "task_id": task_id_copy,
        "status": "deleted",
        "title": task_title,
        "message": f"Task '{task_title}' has been deleted"
    }


# MCP Tool Schema (OpenAPI format for OpenAI function calling)
DELETE_TASK_SCHEMA = {
    "type": "function",
    "function": {
        "name": "delete_task",
        "description": (
            "Permanently delete a task. "
            "Use this when the user wants to remove a task completely. "
            "Examples: 'Delete task 5', 'Remove the grocery task', 'Delete that task'. "
            "IMPORTANT: This is a destructive action - confirm with the user if unclear."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": (
                        "The ID of the task to delete. "
                        "If the user says 'delete the grocery task' without an ID, "
                        "you should first call list_tasks to find the task ID, "
                        "then confirm with the user before deleting."
                    )
                }
            },
            "required": ["task_id"]
        }
    }
}
