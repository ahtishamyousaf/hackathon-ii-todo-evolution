"""
MCP Tool: add_task

Creates a new task for the authenticated user via natural language.

User Story: US1 (Add Tasks via Natural Language)
"""

from typing import Dict, Any, Optional
from sqlmodel import Session
from app.models.task import Task
import logging

logger = logging.getLogger(__name__)


async def add_task(
    title: str,
    user_id: str,
    session: Session,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    category_id: Optional[int] = None
) -> Dict[str, Any]:
    """
    Create a new task for the authenticated user.

    CRITICAL SECURITY: user_id is injected by MCP server from JWT token,
    NOT from AI parameters. This prevents user impersonation.

    Args:
        title: Task title (required, 1-200 characters)
        user_id: User ID from JWT token (injected by server)
        session: Database session (injected by server)
        description: Optional task description
        priority: Optional priority (low, medium, high)
        due_date: Optional due date (ISO format string)
        category_id: Optional category ID

    Returns:
        Dict with task_id, status, and title

    Example:
        result = await add_task(
            title="Buy groceries",
            description="Milk, eggs, bread",
            user_id="user_123",  # From JWT
            session=db_session   # From dependency
        )
        # Returns: {"task_id": 15, "status": "created", "title": "Buy groceries"}

    Raises:
        ValueError: If title is invalid
        Exception: If database operation fails
    """
    # Validate title
    if not title or not title.strip():
        raise ValueError("Task title cannot be empty")

    if len(title) > 200:
        raise ValueError("Task title cannot exceed 200 characters")

    # Validate priority if provided
    valid_priorities = {"low", "medium", "high"}
    if priority and priority not in valid_priorities:
        logger.warning(f"Invalid priority '{priority}', defaulting to 'medium'")
        priority = "medium"

    try:
        # Create task with user_id from JWT (CRITICAL SECURITY)
        task = Task(
            title=title.strip(),
            description=description.strip() if description else None,
            user_id=user_id,
            priority=priority or "medium",
            due_date=due_date,
            category_id=category_id,
            completed=False
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        logger.info(f"Task created: id={task.id}, user={user_id}, title='{task.title}'")

        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title
        }

    except Exception as e:
        session.rollback()
        logger.error(f"Failed to create task for user {user_id}: {str(e)}")
        raise Exception(f"Failed to create task: {str(e)}")


# Tool schema for OpenAI function calling
ADD_TASK_SCHEMA = {
    "type": "function",
    "function": {
        "name": "add_task",
        "description": "Create a new task for the authenticated user",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title (required, 1-200 characters)",
                    "minLength": 1,
                    "maxLength": 200
                },
                "description": {
                    "type": "string",
                    "description": "Optional task description"
                },
                "priority": {
                    "type": "string",
                    "enum": ["low", "medium", "high"],
                    "description": "Optional task priority (defaults to medium)"
                },
                "due_date": {
                    "type": "string",
                    "description": "Optional due date in ISO format (YYYY-MM-DD)"
                },
                "category_id": {
                    "type": "integer",
                    "description": "Optional category ID to assign task to"
                }
            },
            "required": ["title"]
        }
    }
}
