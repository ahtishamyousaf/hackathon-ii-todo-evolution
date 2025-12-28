"""
MCP Tool: complete_task

Marks a task as completed for the authenticated user.

User Story: US3 - Manage Tasks via Chat
"""

from typing import Dict, Any
from sqlmodel import Session
from app.models.task import Task
from datetime import datetime


async def complete_task(
    task_id: int,
    user_id: str,  # Injected by MCP server from JWT token
    session: Session,  # Injected by MCP server
    completed: bool = True  # Allow toggling (default: mark as complete)
) -> Dict[str, Any]:
    """
    Mark a task as completed (or toggle completion status).

    This function is called by the AI agent when users say things like:
    - "Mark task 5 as done"
    - "Complete task 3"
    - "I finished task 2"
    - "Mark task 1 as incomplete" (with completed=False)

    CRITICAL SECURITY: user_id is injected from JWT token by the MCP server,
    NOT from AI-provided parameters. This prevents users from modifying
    other users' tasks.

    Args:
        task_id: ID of the task to mark as completed
        user_id: User ID from JWT token (injected, not from AI)
        session: Database session (injected by MCP server)
        completed: True to mark complete, False to mark incomplete (default: True)

    Returns:
        Dict containing:
        - task_id: ID of the updated task
        - status: "completed" or "incomplete"
        - title: Task title for confirmation

    Raises:
        ValueError: If task not found or user not authorized

    Example AI query: "Mark task 5 as done"
    Example tool parameters: {"task_id": 5}
    """
    # Fetch task with user isolation check (CRITICAL SECURITY)
    task = session.get(Task, task_id)

    if not task:
        raise ValueError(f"Task {task_id} not found")

    # User isolation check (CRITICAL SECURITY)
    if task.user_id != user_id:
        raise ValueError(f"Not authorized to modify task {task_id}")

    # Update completion status
    task.completed = completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "task_id": task.id,
        "status": "completed" if task.completed else "incomplete",
        "title": task.title,
        "message": f"Task '{task.title}' marked as {'completed' if completed else 'incomplete'}"
    }


# MCP Tool Schema (OpenAPI format for OpenAI function calling)
COMPLETE_TASK_SCHEMA = {
    "type": "function",
    "function": {
        "name": "complete_task",
        "description": (
            "Mark a task as completed or toggle its completion status. "
            "Use this when the user indicates they finished a task or wants to mark it as done. "
            "Examples: 'Mark task 5 as done', 'Complete task 3', 'I finished task 2', "
            "'Mark task 1 as incomplete'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": (
                        "The ID of the task to mark as completed. "
                        "If the user doesn't provide an ID, ask them which task they mean "
                        "or list their tasks first."
                    )
                },
                "completed": {
                    "type": "boolean",
                    "description": (
                        "True to mark as completed (default), "
                        "False to mark as incomplete. "
                        "Use False when user says 'mark as incomplete' or 'undo completion'."
                    ),
                    "default": True
                }
            },
            "required": ["task_id"]
        }
    }
}
