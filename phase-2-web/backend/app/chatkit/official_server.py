"""
Official ChatKit Server Implementation using openai-chatkit==1.4.1

This module migrates from custom SimpleChatKitServer to official Python SDK.
Integrates with official MCP server for tool calling.

Architecture:
- Uses official openai_chatkit.ChatKit from openai-chatkit==1.4.1
- Connects to official MCP server for tool execution
- Maintains stateless design with conversation persistence
- Streaming support for real-time responses

User Stories:
- US1-US5 (Phase III): Natural language task management via chat
"""

from openai_chatkit import ChatKit, ChatKitConfig
from typing import List, Dict, Any, Optional
import logging

from app.mcp.official_server import get_official_mcp_server

logger = logging.getLogger(__name__)


class OfficialChatKitServer:
    """
    Official ChatKit server using openai-chatkit==1.4.1.

    Integrates with OpenAI GPT-4 and official MCP server for
    tool-based task management conversations.
    """

    def __init__(self, openai_api_key: str):
        """
        Initialize ChatKit server with official SDK.

        Args:
            openai_api_key: OpenAI API key for GPT-4 access
        """
        self.mcp_server = get_official_mcp_server()

        # Configure official ChatKit
        self.chatkit = ChatKit(
            config=ChatKitConfig(
                openai_api_key=openai_api_key,
                model="gpt-4-1106-preview",  # GPT-4 Turbo
                system_prompt=self._get_system_prompt(),
                stream=True,  # Enable streaming responses
            )
        )

        logger.info("Official ChatKit server initialized with MCP tools")

    def _get_system_prompt(self) -> str:
        """
        Get system prompt for AI task assistant.

        Returns:
            System prompt guiding AI behavior
        """
        return """You are a helpful task management assistant with access to the user's todo list.

You can help users:
- Add new tasks ("add a task to buy groceries")
- View their tasks ("show me all my tasks", "what's pending?")
- Complete tasks ("mark task 3 as done")
- Delete tasks ("delete the meeting task")
- Update tasks ("change task 1 to 'Call mom tonight'")

When users ask about their tasks:
1. Use the list_tasks tool to fetch current tasks
2. Present tasks in a clear, organized format with:
   - ✓ for completed tasks
   - □ for pending tasks
   - Priority badges (🔴 high, 🟡 medium, 🟢 low)
   - Due dates if set
   - Categories if assigned

When performing actions:
1. Confirm what you're doing ("I'll add 'Buy groceries' to your tasks")
2. Execute the appropriate tool (add_task, update_task, etc.)
3. Confirm success ("Done! I've added 'Buy groceries' to your list")

For delete operations:
- Always confirm before deleting ("Are you sure you want to delete 'Meeting with Bob'?")
- Wait for user confirmation
- Then execute delete_task

Be concise, friendly, and helpful. Focus on task management - if users ask unrelated questions, politely redirect them to task-related topics.
"""

    async def process_message(
        self,
        message: str,
        user_id: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Process user message and return AI response.

        Args:
            message: User's message
            user_id: Authenticated user ID (from JWT)
            conversation_history: Previous messages in conversation

        Returns:
            AI assistant's response text
        """
        # Build messages array for ChatKit
        messages = conversation_history or []
        messages.append({"role": "user", "content": message})

        # Add user context for MCP tools (CRITICAL SECURITY)
        user_context = {"user_id": user_id}

        try:
            # Call official ChatKit with streaming
            response_chunks = []

            async for chunk in self.chatkit.chat_stream(
                messages=messages,
                tools=self.mcp_server.list_tools(),
                tool_executor=lambda name, args: self.mcp_server.call_tool(
                    name=name,
                    arguments=args,
                    user_context=user_context
                ),
            ):
                response_chunks.append(chunk)

            # Combine streaming chunks
            response_text = "".join(response_chunks)

            logger.info(f"ChatKit processed message for user {user_id}")
            return response_text

        except Exception as e:
            logger.error(f"ChatKit processing failed for user {user_id}: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}. Please try again."


# Global instance
_chatkit_server: Optional[OfficialChatKitServer] = None


def initialize_official_chatkit(openai_api_key: str) -> None:
    """
    Initialize global ChatKit server instance.

    Args:
        openai_api_key: OpenAI API key
    """
    global _chatkit_server
    _chatkit_server = OfficialChatKitServer(openai_api_key)
    logger.info("Official ChatKit server initialized")


def get_official_chatkit_server() -> OfficialChatKitServer:
    """
    Get the global ChatKit server instance.

    Returns:
        Official ChatKit server

    Raises:
        RuntimeError: If server not initialized
    """
    if _chatkit_server is None:
        raise RuntimeError(
            "Official ChatKit server not initialized. "
            "Call initialize_official_chatkit() first."
        )
    return _chatkit_server
