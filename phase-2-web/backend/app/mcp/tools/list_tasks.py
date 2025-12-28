"""
MCP Tool: list_tasks

Retrieves tasks for the authenticated user with optional filtering.

User Story: US2 - View Tasks Through Conversation
"""

from typing import Dict, Any, Optional, List
from sqlmodel import Session, select
from app.models.task import Task


async def list_tasks(
    user_id: str,  # Injected by MCP server from JWT token
    session: Session,  # Injected by MCP server
    status: Optional[str] = None,  # "all", "pending", "completed"
    category_id: Optional[int] = None,
    limit: int = 20
) -> Dict[str, Any]:
    """
    List tasks for the authenticated user.

    This function is called by the AI agent when users ask about their tasks
    with queries like "What's on my list?", "Show me my tasks", etc.

    CRITICAL SECURITY: user_id is injected from JWT token by the MCP server,
    NOT from AI-provided parameters. This prevents users from viewing
    other users' tasks.

    Args:
        user_id: User ID from JWT token (injected, not from AI)
        session: Database session (injected by MCP server)
        status: Filter by status - "all", "pending", "completed" (from AI)
        category_id: Filter by category ID (from AI)
        limit: Maximum number of tasks to return (default 20)

    Returns:
        Dict containing:
        - tasks: List of task dictionaries
        - count: Total number of tasks matching filters
        - filters_applied: Dict of filters used

    Example AI query: "What's on my todo list?"
    Example tool parameters: {"status": "pending"}
    """
    # Build base query with user isolation (CRITICAL SECURITY)
    query = select(Task).where(Task.user_id == user_id)

    # Apply status filter
    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)
    # "all" or None = no filter on completed status

    # Apply category filter
    if category_id is not None:
        query = query.where(Task.category_id == category_id)

    # Order by: incomplete first, then by due date, then by created date
    query = (
        query
        .order_by(Task.completed.asc())  # False (0) before True (1)
        .order_by(Task.due_date.asc())
        .order_by(Task.created_at.desc())
        .limit(limit)
    )

    # Execute query
    tasks = session.exec(query).all()

    # Convert tasks to dictionaries for AI consumption
    task_list = []
    for task in tasks:
        task_dict = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "category_id": task.category_id,
            "created_at": task.created_at.isoformat()
        }
        task_list.append(task_dict)

    # Build response
    filters_applied = {}
    if status:
        filters_applied["status"] = status
    if category_id is not None:
        filters_applied["category_id"] = category_id

    return {
        "tasks": task_list,
        "count": len(task_list),
        "filters_applied": filters_applied,
        "message": f"Found {len(task_list)} task(s)" + (
            f" (showing max {limit})" if len(task_list) == limit else ""
        )
    }


# MCP Tool Schema (OpenAPI format for OpenAI function calling)
LIST_TASKS_SCHEMA = {
    "type": "function",
    "function": {
        "name": "list_tasks",
        "description": (
            "Retrieve the user's tasks with optional filtering. "
            "Use this when the user asks to see their tasks, todo list, "
            "or wants to know what's pending/completed. "
            "Examples: 'What's on my list?', 'Show me my tasks', "
            "'What do I need to do?', 'What have I completed?'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": (
                        "Filter tasks by completion status. "
                        "Use 'pending' for incomplete tasks, "
                        "'completed' for finished tasks, "
                        "'all' for both. Default is 'all'."
                    )
                },
                "category_id": {
                    "type": "integer",
                    "description": (
                        "Filter tasks by category ID. "
                        "Only include if user specifies a category."
                    )
                },
                "limit": {
                    "type": "integer",
                    "description": (
                        "Maximum number of tasks to return. "
                        "Default is 20. Use higher values only if requested."
                    ),
                    "default": 20
                }
            },
            "required": []  # All parameters are optional
        }
    }
}
