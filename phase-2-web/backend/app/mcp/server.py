"""
MCP Server for Phase III: AI-Powered Todo Chatbot

This module provides the Model Context Protocol server that exposes
task management operations as tools for the OpenAI agent.

Architecture:
- Stateless design: No in-memory state between requests
- User isolation: All tools filter by user_id from JWT context
- Tool registration: Tools are registered and made available to AI agent
"""

from typing import Dict, Any, Callable, List
import logging
from agents.tool import function_tool, FunctionTool
from agents.run_context import RunContextWrapper

logger = logging.getLogger(__name__)


class MCPServer:
    """
    MCP Server managing tool registration and execution.

    This server:
    1. Registers MCP tools (add_task, list_tasks, etc.)
    2. Provides tool definitions for OpenAI function calling
    3. Executes tools with user context injection
    4. Handles errors and returns structured responses

    User Stories:
    - US1 (Add Tasks): Exposes add_task tool
    - US2 (View Tasks): Exposes list_tasks tool
    - US3 (Manage Tasks): Exposes complete_task, delete_task, update_task tools
    - US5 (Authentication): Injects user_id from JWT context
    """

    def __init__(self):
        """Initialize MCP server with empty tool registry."""
        self.tools: Dict[str, Callable] = {}
        self.tool_schemas: Dict[str, Dict[str, Any]] = {}
        logger.info("MCP Server initialized")

    def register_tool(
        self,
        name: str,
        func: Callable,
        schema: Dict[str, Any]
    ) -> None:
        """
        Register an MCP tool with its execution function and OpenAPI schema.

        Args:
            name: Tool name (e.g., "add_task")
            func: Callable function that executes the tool
            schema: OpenAPI schema for function calling (type, description, parameters)

        Example:
            server.register_tool(
                "add_task",
                add_task_handler,
                {
                    "type": "function",
                    "function": {
                        "name": "add_task",
                        "description": "Create a new task for the authenticated user",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string", "description": "Task title"},
                                "description": {"type": "string", "description": "Task description"}
                            },
                            "required": ["title"]
                        }
                    }
                }
            )
        """
        self.tools[name] = func
        self.tool_schemas[name] = schema
        logger.info(f"Registered MCP tool: {name}")

    def get_tool_schemas(self) -> List[Dict[str, Any]]:
        """
        Get all registered tool schemas for OpenAI function calling.

        Returns:
            List of tool schemas in OpenAI format

        Example return:
            [
                {
                    "type": "function",
                    "function": {
                        "name": "add_task",
                        "description": "Create a new task",
                        "parameters": {...}
                    }
                }
            ]
        """
        return list(self.tool_schemas.values())

    async def execute_tool(
        self,
        tool_name: str,
        parameters: Dict[str, Any],
        user_id: str,
        db_session: Any
    ) -> Dict[str, Any]:
        """
        Execute an MCP tool with user context injection.

        CRITICAL SECURITY: user_id is injected from JWT token context,
        NOT from parameters. This prevents users from impersonating others.

        Args:
            tool_name: Name of tool to execute (e.g., "add_task")
            parameters: Tool parameters from AI (WITHOUT user_id)
            user_id: User ID from JWT token (injected by server)
            db_session: Database session for tool execution

        Returns:
            Tool execution result

        Raises:
            ValueError: If tool not found
            Exception: If tool execution fails

        Example:
            result = await server.execute_tool(
                "add_task",
                {"title": "Buy groceries"},
                "user_123",  # From JWT token
                session
            )
            # Returns: {"task_id": 15, "status": "created", "title": "Buy groceries"}
        """
        if tool_name not in self.tools:
            raise ValueError(f"Tool '{tool_name}' not found")

        tool_func = self.tools[tool_name]

        try:
            # Log tool execution start with parameters (excluding session for readability)
            safe_params = {k: v for k, v in parameters.items() if k not in ['session', 'password']}
            logger.info(f"🔧 Executing tool '{tool_name}' for user {user_id} with params: {safe_params}")

            # Inject user_id into parameters (CRITICAL SECURITY)
            # This ensures all operations are isolated to the authenticated user
            parameters_with_user = {
                **parameters,
                "user_id": user_id,
                "session": db_session
            }

            # Execute tool
            result = await tool_func(**parameters_with_user)

            # Log successful execution with result summary
            result_summary = {k: v for k, v in result.items() if k in ['task_id', 'status', 'title', 'count']} if isinstance(result, dict) else str(result)[:100]
            logger.info(f"✅ Tool '{tool_name}' executed successfully for user {user_id} → {result_summary}")
            return result

        except Exception as e:
            logger.error(f"❌ Tool '{tool_name}' failed for user {user_id}: {str(e)}", exc_info=True)
            raise


# Global MCP server instance
mcp_server = MCPServer()


def initialize_mcp_tools():
    """
    Register all MCP tools with the server.

    This function should be called at application startup to register
    all available tools with the MCP server.

    User Stories:
    - US1: Registers add_task tool
    - US2: Registers list_tasks tool
    - US3: Registers complete_task, delete_task, update_task tools
    - Browser Automation: Registers navigate_to_url, take_screenshot, extract_page_text tools
    """
    from app.mcp.tools import (
        add_task,
        ADD_TASK_SCHEMA,
        list_tasks,
        LIST_TASKS_SCHEMA,
        complete_task,
        COMPLETE_TASK_SCHEMA,
        delete_task,
        DELETE_TASK_SCHEMA,
        update_task,
        UPDATE_TASK_SCHEMA,
        navigate_to_url,
        NAVIGATE_TO_URL_SCHEMA,
        take_screenshot,
        TAKE_SCREENSHOT_SCHEMA,
        extract_page_text,
        EXTRACT_PAGE_TEXT_SCHEMA,
    )

    # Register User Story 1 tools (Add Tasks via Natural Language)
    mcp_server.register_tool("add_task", add_task, ADD_TASK_SCHEMA)

    # Register User Story 2 tools (View Tasks Through Conversation)
    mcp_server.register_tool("list_tasks", list_tasks, LIST_TASKS_SCHEMA)

    # Register User Story 3 tools (Manage Tasks via Chat)
    mcp_server.register_tool("complete_task", complete_task, COMPLETE_TASK_SCHEMA)
    mcp_server.register_tool("delete_task", delete_task, DELETE_TASK_SCHEMA)
    mcp_server.register_tool("update_task", update_task, UPDATE_TASK_SCHEMA)

    # Register Browser Automation tools (Playwright MCP)
    mcp_server.register_tool("navigate_to_url", navigate_to_url, NAVIGATE_TO_URL_SCHEMA)
    mcp_server.register_tool("take_screenshot", take_screenshot, TAKE_SCREENSHOT_SCHEMA)
    mcp_server.register_tool("extract_page_text", extract_page_text, EXTRACT_PAGE_TEXT_SCHEMA)

    logger.info("MCP tools initialized successfully")


def get_mcp_server() -> MCPServer:
    """
    Get the global MCP server instance.

    Returns:
        MCPServer instance for tool registration and execution
    """
    return mcp_server


def get_mcp_tools() -> List[Callable]:
    """
    Get MCP tools wrapped for OpenAI Agents SDK compatibility.

    The Agents SDK expects Python function tools with context access.
    This function wraps our MCP tools to work with the Agents SDK.

    Returns:
        List of callable tools for Agents SDK
    """
    from app.mcp.tools import (
        add_task,
        list_tasks,
        complete_task,
        delete_task,
        update_task
    )

    # Import database session dependency
    from app.database import engine
    from sqlmodel import Session

    # Wrap MCP tools to work with Agents SDK
    # The Agents SDK will inject RunContextWrapper with user_id
    async def wrapped_add_task(ctx: RunContextWrapper[Dict[str, Any]], title: str, description: str = ""):
        """Create a new task for the authenticated user.

        Args:
            title: The task title
            description: Optional task description
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        # Create session directly from engine (not using generator)
        with Session(engine) as session:
            result = await add_task(
                user_id=user_id,
                title=title,
                description=description,
                session=session
            )
            session.commit()
            return result

    async def wrapped_list_tasks(ctx: RunContextWrapper[Dict[str, Any]], status: str = "all"):
        """List all tasks for the authenticated user.

        Args:
            status: Filter by status - 'all', 'pending', or 'completed'
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await list_tasks(
                user_id=user_id,
                status=status,
                session=session
            )
            session.commit()
            return result

    async def wrapped_complete_task(ctx: RunContextWrapper[Dict[str, Any]], task_id: int):
        """Mark a task as completed.

        Args:
            task_id: The ID of the task to complete
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await complete_task(
                user_id=user_id,
                task_id=task_id,
                session=session
            )
            session.commit()
            return result

    async def wrapped_delete_task(ctx: RunContextWrapper[Dict[str, Any]], task_id: int):
        """Delete a task.

        Args:
            task_id: The ID of the task to delete
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await delete_task(
                user_id=user_id,
                task_id=task_id,
                session=session
            )
            session.commit()
            return result

    async def wrapped_update_task(
        ctx: RunContextWrapper[Dict[str, Any]],
        task_id: int,
        title: str = None,
        description: str = None
    ):
        """Update a task's title or description.

        Args:
            task_id: The ID of the task to update
            title: New task title (optional)
            description: New task description (optional)
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await update_task(
                user_id=user_id,
                task_id=task_id,
                title=title,
                description=description,
                session=session
            )
            session.commit()
            return result

    # Playwright browser automation tools
    async def wrapped_navigate_to_url(ctx: RunContextWrapper[Dict[str, Any]], url: str):
        """Navigate to a URL and get the page title.

        Args:
            url: The URL to navigate to
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await navigate_to_url(
                url=url,
                user_id=user_id,
                session=session
            )
            session.commit()
            return result

    async def wrapped_take_screenshot(
        ctx: RunContextWrapper[Dict[str, Any]],
        url: str,
        full_page: bool = False
    ):
        """Take a screenshot of a webpage.

        Args:
            url: The URL to screenshot
            full_page: If True, capture full page; if False, capture viewport only
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await take_screenshot(
                url=url,
                user_id=user_id,
                session=session,
                full_page=full_page
            )
            session.commit()
            return result

    async def wrapped_extract_page_text(
        ctx: RunContextWrapper[Dict[str, Any]],
        url: str,
        selector: str = None
    ):
        """Extract text content from a webpage.

        Args:
            url: The URL to extract text from
            selector: Optional CSS selector to extract text from specific element
        """
        user_id = ctx.context.get("user_id")
        if not user_id:
            raise ValueError("User not authenticated")

        with Session(engine) as session:
            result = await extract_page_text(
                url=url,
                user_id=user_id,
                session=session,
                selector=selector
            )
            session.commit()
            return result

    # Wrap functions with function_tool decorator for OpenAI Agents SDK
    return [
        function_tool(wrapped_add_task),
        function_tool(wrapped_list_tasks),
        function_tool(wrapped_complete_task),
        function_tool(wrapped_delete_task),
        function_tool(wrapped_update_task),
        function_tool(wrapped_navigate_to_url),
        function_tool(wrapped_take_screenshot),
        function_tool(wrapped_extract_page_text),
    ]
