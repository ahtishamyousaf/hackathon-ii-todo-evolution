"""
MCP Tool: update_task

Updates a task's details for the authenticated user.

User Story: US3 - Manage Tasks via Chat
"""

from typing import Dict, Any, Optional
from sqlmodel import Session
from app.models.task import Task
from datetime import datetime


async def update_task(
    task_id: int,
    user_id: str,  # Injected by MCP server from JWT token
    session: Session,  # Injected by MCP server
    title: Optional[str] = None,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    category_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Update a task's details.

    This function is called by the AI agent when users say things like:
    - "Change task 3 to 'Call mom tonight'"
    - "Update task 5's description to 'Buy milk, eggs, and bread'"
    - "Set task 2's priority to high"
    - "Change the due date of task 1 to tomorrow"

    CRITICAL SECURITY: user_id is injected from JWT token by the MCP server,
    NOT from AI-provided parameters. This prevents users from modifying
    other users' tasks.

    Args:
        task_id: ID of the task to update
        user_id: User ID from JWT token (injected, not from AI)
        session: Database session (injected by MCP server)
        title: New task title (optional)
        description: New task description (optional)
        priority: New priority: "low", "medium", or "high" (optional)
        due_date: New due date in ISO format (optional)
        category_id: New category ID (optional)

    Returns:
        Dict containing:
        - task_id: ID of the updated task
        - status: "updated"
        - title: Updated task title
        - updated_fields: List of fields that were changed

    Raises:
        ValueError: If task not found, user not authorized, or invalid parameters

    Example AI query: "Change task 3 to 'Call mom tonight'"
    Example tool parameters: {"task_id": 3, "title": "Call mom tonight"}
    """
    # Fetch task with user isolation check (CRITICAL SECURITY)
    task = session.get(Task, task_id)

    if not task:
        raise ValueError(f"Task {task_id} not found")

    # User isolation check (CRITICAL SECURITY)
    if task.user_id != user_id:
        raise ValueError(f"Not authorized to modify task {task_id}")

    # Track which fields were updated
    updated_fields = []

    # Update title
    if title is not None:
        if not title.strip():
            raise ValueError("Task title cannot be empty")
        task.title = title.strip()
        updated_fields.append("title")

    # Update description
    if description is not None:
        task.description = description.strip() if description.strip() else None
        updated_fields.append("description")

    # Update priority
    if priority is not None:
        if priority not in ("low", "medium", "high"):
            raise ValueError(f"Invalid priority: {priority}. Must be 'low', 'medium', or 'high'")
        task.priority = priority
        updated_fields.append("priority")

    # Update due date
    if due_date is not None:
        # Parse ISO format date string
        try:
            from dateutil import parser
            task.due_date = parser.parse(due_date)
            updated_fields.append("due_date")
        except Exception as e:
            raise ValueError(f"Invalid due date format: {due_date}. Use ISO format (YYYY-MM-DD)")

    # Update category
    if category_id is not None:
        task.category_id = category_id
        updated_fields.append("category_id")

    # Update timestamp
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "task_id": task.id,
        "status": "updated",
        "title": task.title,
        "updated_fields": updated_fields,
        "message": f"Task '{task.title}' updated successfully ({', '.join(updated_fields)} changed)"
    }


# MCP Tool Schema (OpenAPI format for OpenAI function calling)
UPDATE_TASK_SCHEMA = {
    "type": "function",
    "function": {
        "name": "update_task",
        "description": (
            "Update a task's details (title, description, priority, due date, or category). "
            "Use this when the user wants to modify an existing task. "
            "Examples: 'Change task 3 to Call mom tonight', 'Update task 5 description', "
            "'Set task 2 priority to high', 'Change task 1 due date to tomorrow'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": (
                        "The ID of the task to update. "
                        "If the user doesn't provide an ID, ask them which task they mean "
                        "or list their tasks first."
                    )
                },
                "title": {
                    "type": "string",
                    "description": "New task title (if user wants to change it)"
                },
                "description": {
                    "type": "string",
                    "description": "New task description (if user wants to change it)"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "New priority level (if user wants to change it)"
                },
                "due_date": {
                    "type": "string",
                    "description": (
                        "New due date in ISO format YYYY-MM-DD (if user wants to change it). "
                        "Convert relative dates like 'tomorrow' or 'next week' to ISO format."
                    )
                },
                "category_id": {
                    "type": "integer",
                    "description": "New category ID (if user wants to change category)"
                }
            },
            "required": ["task_id"]
        }
    }
}
