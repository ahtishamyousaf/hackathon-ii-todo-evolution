"""
ChatKit integration for Phase III: AI-Powered Todo Chatbot.

This module provides the ChatKit server implementation that connects
the ChatKit UI to our MCP tools via the OpenAI Agents SDK.
"""

from .simple_server import SimpleChatKitServer, create_simple_chatkit_server

__all__ = [
    "SimpleChatKitServer",
    "create_simple_chatkit_server",
]
