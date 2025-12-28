"""
ChatKit server implementation for todo task management.

Integrates OpenAI Agents SDK with our MCP server tools.
"""

import logging
import os
from typing import Any, AsyncIterator, Dict
from datetime import datetime

from agents import Runner, Agent
from chatkit.server import ChatKitServer
from chatkit.agents import ResponseStreamConverter, stream_agent_response
from chatkit.types import (
    AssistantMessageItem,
    HiddenContextItem,
    StreamOptions,
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
    Attachment,
)
from openai.types.responses import ResponseInputContentParam

from .memory_store import MemoryStore
from .thread_item_converter import ThreadItemConverter
from ..mcp.server import get_mcp_tools

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TodoChatKitServer(ChatKitServer[Dict[str, Any]]):
    """
    ChatKit server for task management via natural language.

    Connects ChatKit UI → Agents SDK → MCP Tools → Database
    """

    def __init__(self) -> None:
        """Initialize the server with memory store and MCP tools."""
        self.store = MemoryStore()
        super().__init__(self.store)

        self.thread_item_converter = ThreadItemConverter()

        # Get MCP tools from our existing implementation
        self.mcp_tools = get_mcp_tools()

        # Create agent with MCP tools
        self.agent = Agent(
            name="Task Assistant",
            instructions="""You are a helpful task management assistant. You help users manage their todo tasks through natural language conversation.

You have access to these tools:
- add_task: Create a new task with title and optional description
- list_tasks: Show all tasks (optionally filter by status: all/pending/completed)
- complete_task: Mark a task as completed
- delete_task: Remove a task
- update_task: Modify task title or description

Always:
1. Confirm actions taken (e.g., "I've added the task 'Buy groceries'")
2. Be conversational and friendly
3. Ask for clarification if the user's request is ambiguous
4. Provide helpful suggestions when appropriate

Examples:
- "Add a task to buy groceries" → Use add_task with title="Buy groceries"
- "Show me my tasks" → Use list_tasks with status="all"
- "What's pending?" → Use list_tasks with status="pending"
- "Mark task 3 as done" → Use complete_task with task_id=3
- "Delete the meeting task" → First use list_tasks to find it, then delete_task
""",
            tools=self.mcp_tools,
        )

        logger.info("TodoChatKitServer initialized with MCP tools")

    async def respond(
        self,
        thread: ThreadMetadata,
        item: UserMessageItem | None,
        context: Dict[str, Any],
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Generate assistant response using OpenAI Agents SDK with MCP tools.

        Flow:
        1. Load conversation history from thread
        2. Convert to agent input format
        3. Run agent with MCP tools
        4. Stream response back to ChatKit
        """
        logger.info(f"Processing message for thread {thread.id}")

        # Extract user_id from context (set by our endpoint)
        user_id = context.get("user_id")
        if not user_id:
            logger.error("No user_id in context")
            # Yield error message
            error_message = AssistantMessageItem(
                id=self.store.generate_item_id("message", thread, context),
                thread_id=thread.id,
                created_at=datetime.now(),
                content=[{"type": "text", "text": "Authentication error: User not identified."}],
            )
            yield ThreadStreamEvent(type="thread_item_done", item=error_message)
            return

        # Create agent context with user_id for MCP tool calls
        agent_context = {"user_id": user_id, "thread": thread}

        # Load conversation history
        items_page = await self.store.load_thread_items(
            thread.id,
            after=None,
            limit=50,  # Last 50 messages
            order="desc",
            context=context,
        )

        # Reverse to get chronological order (oldest first)
        items = list(reversed(items_page.data))

        # Convert thread items to agent input
        input_messages = await self.thread_item_converter.to_agent_input(items)

        logger.info(f"Running agent with {len(input_messages)} messages")

        # Run agent with MCP tools
        try:
            result = Runner.run_streamed(
                self.agent,
                input_messages,
                context=agent_context,
            )

            # Stream agent response back to ChatKit
            async for event in stream_agent_response(
                agent_context,
                result,
                converter=ResponseStreamConverter(),
            ):
                yield event

        except Exception as e:
            logger.error(f"Agent execution error: {e}", exc_info=True)

            # Yield error message to user
            error_message = AssistantMessageItem(
                id=self.store.generate_item_id("message", thread, context),
                thread_id=thread.id,
                created_at=datetime.now(),
                content=[{
                    "type": "text",
                    "text": f"I encountered an error processing your request: {str(e)}. Please try again."
                }],
            )
            yield ThreadStreamEvent(type="thread_item_done", item=error_message)

    def get_stream_options(
        self, thread: ThreadMetadata, context: Dict[str, Any]
    ) -> StreamOptions:
        """Configure streaming options."""
        return StreamOptions(allow_cancel=True)

    async def to_message_content(
        self, _input: Attachment
    ) -> ResponseInputContentParam:
        """Handle file attachments (not supported in this version)."""
        raise RuntimeError("File attachments are not currently supported.")


def create_chatkit_server() -> TodoChatKitServer:
    """
    Factory function to create ChatKit server instance.

    Returns:
        Configured TodoChatKitServer instance
    """
    return TodoChatKitServer()
