"""
Simplified server implementation that works with ChatKit frontend.

Since the ChatKit Python SDK isn't publicly available yet, this implementation
uses the OpenAI Agents SDK directly and creates responses compatible with the
ChatKit frontend UI component.
"""

import logging
import json
from typing import Any, Dict, List
from datetime import datetime

from agents import Runner, Agent
from openai import OpenAI

from ..mcp.server import get_mcp_tools

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleChatKitServer:
    """
    Simplified ChatKit-compatible server for task management.

    Uses OpenAI Agents SDK with MCP tools to process chat messages
    and returns responses in a format compatible with ChatKit frontend.
    """

    def __init__(self):
        """Initialize the server with MCP tools and agent."""
        self.mcp_tools = get_mcp_tools()

        # Create agent with MCP tools
        self.agent = Agent(
            name="Task Assistant",
            instructions="""You are a helpful task management assistant with browser automation capabilities. You help users manage their todo tasks through natural language conversation and can also interact with websites.

You have access to these tools:

**Task Management:**
- add_task: Create a new task with title and optional description
- list_tasks: Show all tasks (optionally filter by status: all/pending/completed)
- complete_task: Mark a task as completed
- delete_task: Remove a task
- update_task: Modify task title or description

**Browser Automation:**
- navigate_to_url: Navigate to a URL and get the page title
- take_screenshot: Capture a screenshot of a webpage (optionally full page)
- extract_page_text: Extract text content from a webpage (optionally from a specific CSS selector)

Always:
1. Confirm actions taken (e.g., "I've added the task 'Buy groceries'")
2. Be conversational and friendly
3. Ask for clarification if the user's request is ambiguous
4. Provide helpful suggestions when appropriate
5. For browser automation, confirm the URL before navigating to ensure user intent

Examples:
- "Add a task to buy groceries" → Use add_task with title="Buy groceries"
- "Show me all my tasks" → Use list_tasks with status="all"
- "What's pending?" → Use list_tasks with status="pending"
- "Mark task 3 as done" → Use complete_task with task_id=3
- "Delete the meeting task" → First use list_tasks to find it, then delete_task
- "Take a screenshot of my tasks page" → Use take_screenshot with url="http://localhost:3001/tasks"
- "Check if google.com is loading" → Use navigate_to_url with url="https://google.com"
- "What does example.com say?" → Use extract_page_text with url="https://example.com"
""",
            tools=self.mcp_tools,
        )

        logger.info("SimpleChatKitServer initialized with MCP tools")

    async def process_message(
        self,
        message: str,
        user_id: str,
        conversation_history: List[Dict[str, str]] = None
    ) -> str:
        """
        Process a chat message and return assistant response.

        Args:
            message: User's message
            user_id: Authenticated user ID
            conversation_history: Previous messages in conversation

        Returns:
            Assistant's response text
        """
        logger.info(f"Processing message for user {user_id}: {message[:50]}...")

        # Build message history
        messages = conversation_history or []
        messages.append({"role": "user", "content": message})

        # Create agent context with user_id for MCP tool calls
        agent_context = {"user_id": user_id}

        try:
            # Run agent with MCP tools (await the coroutine!)
            result = await Runner.run(
                self.agent,
                messages,
                context=agent_context,
            )

            # Extract response
            if hasattr(result, 'messages') and result.messages:
                response = result.messages[-1].content
                logger.info(f"Agent response: {response[:100]}...")
                return response
            else:
                logger.warning("No response from agent")
                return "I'm sorry, I couldn't process that request. Please try again."

        except Exception as e:
            logger.error(f"Agent execution error: {e}", exc_info=True)
            return f"I encountered an error: {str(e)}. Please try again."


def create_simple_chatkit_server() -> SimpleChatKitServer:
    """
    Factory function to create simplified ChatKit server instance.

    Returns:
        Configured SimpleChatKitServer instance
    """
    return SimpleChatKitServer()
