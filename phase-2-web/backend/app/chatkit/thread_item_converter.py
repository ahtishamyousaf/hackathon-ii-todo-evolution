"""
Convert ChatKit thread items to OpenAI Agents SDK input format.
"""

from typing import List
from chatkit.types import ThreadItem, UserMessageItem, AssistantMessageItem
from openai.types.responses import ResponseInputContentParam


class ThreadItemConverter:
    """Converts ChatKit thread items to agent input format."""

    async def to_agent_input(
        self, items: List[ThreadItem]
    ) -> List[ResponseInputContentParam]:
        """
        Convert ChatKit thread items to agent input messages.

        Args:
            items: List of thread items (messages, widgets, etc.)

        Returns:
            List of messages formatted for OpenAI Agents SDK
        """
        agent_messages: List[ResponseInputContentParam] = []

        for item in items:
            if isinstance(item, UserMessageItem):
                # User message
                agent_messages.append({
                    "role": "user",
                    "content": item.content.text,
                })

            elif isinstance(item, AssistantMessageItem):
                # Assistant message
                content_parts = []
                for content in item.content:
                    if hasattr(content, "text"):
                        content_parts.append(content.text)

                if content_parts:
                    agent_messages.append({
                        "role": "assistant",
                        "content": " ".join(content_parts),
                    })

        return agent_messages
