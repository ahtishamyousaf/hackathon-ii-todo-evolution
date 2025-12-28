"""
ChatKit router for Phase III: OpenAI ChatKit Integration

Handles POST /chatkit endpoint for ChatKit UI integration.
This endpoint processes chat messages and returns AI responses.
"""

from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict

from app.chatkit.simple_server import create_simple_chatkit_server, SimpleChatKitServer
from app.dependencies.better_auth import get_current_user_from_better_auth
from app.models.user import User

import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chatkit"])


class ChatMessage(BaseModel):
    """Chat message request schema."""
    message: str
    conversation_history: List[Dict[str, str]] = []


class ChatResponse(BaseModel):
    """Chat message response schema."""
    response: str


_chatkit_server: SimpleChatKitServer | None = None


def get_chatkit_server() -> SimpleChatKitServer:
    """
    Get or create the ChatKit server instance.

    Returns:
        SimpleChatKitServer instance

    Raises:
        HTTPException: If ChatKit dependencies are missing
    """
    global _chatkit_server

    if _chatkit_server is None:
        try:
            _chatkit_server = create_simple_chatkit_server()
            logger.info("SimpleChatKitServer created successfully")
        except Exception as e:
            logger.error(f"Failed to create ChatKit server: {e}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    "ChatKit server is unavailable. Please ensure OpenAI Agents SDK "
                    "and MCP tools are properly configured."
                ),
            )

    return _chatkit_server


@router.post("/chatkit", response_model=ChatResponse)
async def chatkit_endpoint(
    chat_message: ChatMessage,
    current_user: User = Depends(get_current_user_from_better_auth),
) -> ChatResponse:
    """
    ChatKit chat endpoint.

    This endpoint:
    1. Authenticates the user via Better Auth JWT
    2. Processes the chat message with AI agent
    3. Injects user_id into context for MCP tool calls
    4. Returns assistant response

    Authentication:
        Requires Bearer token from Better Auth

    Args:
        chat_message: User's message and conversation history
        current_user: Authenticated user from Better Auth token

    Returns:
        ChatResponse with assistant's message

    Raises:
        HTTPException 401: If authentication fails
        HTTPException 503: If ChatKit server is unavailable
        HTTPException 500: If message processing fails
    """
    server = get_chatkit_server()

    logger.info(f"Processing chat message for user {current_user.id}: {chat_message.message[:50]}...")

    try:
        # Process message with AI agent
        response_text = await server.process_message(
            message=chat_message.message,
            user_id=str(current_user.id),
            conversation_history=chat_message.conversation_history
        )

        logger.info(f"Generated response: {response_text[:100]}...")

        return ChatResponse(response=response_text)

    except Exception as e:
        logger.error(f"ChatKit endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}",
        )
