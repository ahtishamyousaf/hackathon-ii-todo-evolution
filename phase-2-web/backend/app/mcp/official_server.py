"""
Official MCP Server Implementation using mcp==1.25.0

This module migrates from custom MCP server to official Python SDK.
Exposes 5 task management tools via Model Context Protocol.

Architecture:
- Uses official mcp.Server from mcp==1.25.0
- Registers tools using @server.call_tool decorator
- Maintains user_id injection from JWT context
- Stateless design with database persistence

User Stories:
- US1 (Add Tasks): add_task tool
- US2 (View Tasks): list_tasks tool
- US3 (Manage Tasks): complete_task, delete_task, update_task tools
"""

from mcp import Server
from mcp.server import stdio_server
from mcp.server.models import InitializationOptions
from mcp.types import (
    Tool,
    TextContent,
    CallToolRequest,
    CallToolResult,
)
from typing import Any, Dict, Optional, List
import logging
from sqlmodel import Session

from app.database import get_session
from app.mcp.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

logger = logging.getLogger(__name__)


# Initialize official MCP server
mcp_server = Server("task-management-server")


@mcp_server.list_tools()
async def list_tools() -> List[Tool]:
    """
    Register all MCP tools with official SDK.

    Returns list of Tool definitions in MCP protocol format.
    """
    return [
        Tool(
            name="add_task",
            description="Create a new task for the authenticated user",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Task title",
                        "minLength": 1,
                        "maxLength": 200,
                    },
                    "description": {
                        "type": "string",
                        "description": "Optional task description",
                    },
                    "priority": {
                        "type": "string",
                        "description": "Task priority (low, medium, high)",
                        "enum": ["low", "medium", "high"],
                    },
                    "due_date": {
                        "type": "string",
                        "description": "Due date in ISO format (YYYY-MM-DD)",
                    },
                    "category_id": {
                        "type": "integer",
                        "description": "Category ID to assign task to",
                    },
                },
                "required": ["title"],
            },
        ),
        Tool(
            name="list_tasks",
            description="List all tasks for the authenticated user with optional filters",
            inputSchema={
                "type": "object",
                "properties": {
                    "status": {
                        "type": "string",
                        "description": "Filter by status",
                        "enum": ["all", "pending", "completed"],
                        "default": "all",
                    },
                    "category_id": {
                        "type": "integer",
                        "description": "Filter by category ID",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of tasks to return",
                        "default": 50,
                        "maximum": 100,
                    },
                },
            },
        ),
        Tool(
            name="complete_task",
            description="Mark a task as completed or uncompleted",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to complete",
                    },
                    "completed": {
                        "type": "boolean",
                        "description": "Set to true to mark complete, false to mark incomplete",
                        "default": True,
                    },
                },
                "required": ["task_id"],
            },
        ),
        Tool(
            name="delete_task",
            description="Permanently delete a task",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to delete",
                    },
                },
                "required": ["task_id"],
            },
        ),
        Tool(
            name="update_task",
            description="Update task title, description, priority, due date, or category",
            inputSchema={
                "type": "object",
                "properties": {
                    "task_id": {
                        "type": "integer",
                        "description": "ID of the task to update",
                    },
                    "title": {
                        "type": "string",
                        "description": "New task title",
                        "minLength": 1,
                        "maxLength": 200,
                    },
                    "description": {
                        "type": "string",
                        "description": "New task description",
                    },
                    "priority": {
                        "type": "string",
                        "description": "New task priority",
                        "enum": ["low", "medium", "high"],
                    },
                    "due_date": {
                        "type": "string",
                        "description": "New due date in ISO format",
                    },
                    "category_id": {
                        "type": "integer",
                        "description": "New category ID",
                    },
                },
                "required": ["task_id"],
            },
        ),
    ]


@mcp_server.call_tool()
async def call_tool(
    name: str,
    arguments: Dict[str, Any],
    user_context: Optional[Dict[str, Any]] = None,
) -> CallToolResult:
    """
    Execute MCP tool with user context injection.

    CRITICAL SECURITY: user_id is injected from JWT token context,
    NOT from tool arguments. This prevents users from impersonating others.

    Args:
        name: Tool name (add_task, list_tasks, etc.)
        arguments: Tool arguments from AI (WITHOUT user_id)
        user_context: Context dict with user_id from JWT

    Returns:
        CallToolResult with tool execution result

    Raises:
        ValueError: If tool not found or user_id missing
        Exception: If tool execution fails
    """
    if not user_context or "user_id" not in user_context:
        raise ValueError("User context with user_id is required")

    user_id = user_context["user_id"]

    # Get database session
    session_gen = get_session()
    session = next(session_gen)

    try:
        # Route to appropriate tool
        if name == "add_task":
            result = await add_task(
                user_id=user_id,
                session=session,
                **arguments
            )
        elif name == "list_tasks":
            result = await list_tasks(
                user_id=user_id,
                session=session,
                **arguments
            )
        elif name == "complete_task":
            result = await complete_task(
                user_id=user_id,
                session=session,
                **arguments
            )
        elif name == "delete_task":
            result = await delete_task(
                user_id=user_id,
                session=session,
                **arguments
            )
        elif name == "update_task":
            result = await update_task(
                user_id=user_id,
                session=session,
                **arguments
            )
        else:
            raise ValueError(f"Unknown tool: {name}")

        logger.info(f"Tool '{name}' executed successfully for user {user_id}")

        # Format result as MCP TextContent
        return CallToolResult(
            content=[TextContent(type="text", text=str(result))]
        )

    except Exception as e:
        logger.error(f"Tool '{name}' failed for user {user_id}: {str(e)}")
        raise

    finally:
        # Close database session
        try:
            next(session_gen)
        except StopIteration:
            pass


def get_official_mcp_server() -> Server:
    """
    Get the official MCP server instance.

    Returns:
        Official MCP Server for tool registration and execution
    """
    return mcp_server


async def run_stdio_server():
    """
    Run MCP server using stdio transport (for CLI/agent integration).

    This is used when MCP server runs as standalone process
    communicating via stdin/stdout with the AI agent.
    """
    async with stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="task-management-server",
                server_version="1.0.0",
            ),
        )
