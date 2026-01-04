"""
Simple chat endpoint for vanilla ChatKit

Much simpler than ChatKit protocol - just:
1. Receive message
2. Call AI agent
3. Return response
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from pydantic import BaseModel
from datetime import datetime, UTC
import logging

from app.database import get_session
from app.dependencies.auth import get_current_user
from app.models.conversation import Conversation
from app.models.message import Message
from app.agents.task_agent import get_agent_response
from app.mcp.server import get_mcp_server

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["simple-chat"])


class ChatRequest(BaseModel):
    """Simple chat request"""
    conversation_id: int | None = None
    message: str


class ChatResponse(BaseModel):
    """Simple chat response"""
    conversation_id: int
    response: str


@router.post("/chat", response_model=ChatResponse)
async def simple_chat(
    request: ChatRequest,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Simple chat endpoint - no complex protocol!

    1. Get or create conversation
    2. Save user message
    3. Call AI agent
    4. Save assistant response
    5. Return response
    """
    logger.info(f"[Chat] User {current_user} sent: {request.message[:100]}")

    try:
        # Get or create conversation
        if request.conversation_id:
            conversation = session.get(Conversation, request.conversation_id)
            if not conversation or conversation.user_id != current_user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found"
                )
        else:
            # Create new conversation
            conversation = Conversation(user_id=current_user)
            session.add(conversation)
            session.commit()
            session.refresh(conversation)
            logger.info(f"[Chat] Created conversation {conversation.id}")

        # Save user message
        user_message = Message(
            user_id=current_user,
            conversation_id=conversation.id,
            role="user",
            content=request.message
        )
        session.add(user_message)
        session.commit()

        # Get MCP server and call AI agent
        mcp_server = get_mcp_server()

        # Get conversation history (last 10 messages)
        from sqlmodel import select
        history_query = select(Message).where(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at.desc()).limit(10)

        history_messages = list(reversed(session.exec(history_query).all()))

        # Build conversation history for agent
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_messages[:-1]  # Exclude the message we just added
        ]

        # Call AI agent with tools
        response_text = await get_agent_response(
            user_id=current_user,
            message=request.message,
            conversation_history=conversation_history,
            mcp_server=mcp_server,
            db_session=session
        )

        logger.info(f"[Chat] AI response: {response_text[:100]}")

        # Save assistant response
        assistant_message = Message(
            user_id=current_user,
            conversation_id=conversation.id,
            role="assistant",
            content=response_text
        )
        session.add(assistant_message)
        session.commit()

        # Update conversation timestamp
        conversation.updated_at = datetime.now(UTC)
        session.add(conversation)
        session.commit()

        return ChatResponse(
            conversation_id=conversation.id,
            response=response_text
        )

    except Exception as e:
        logger.error(f"[Chat] Error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat error: {str(e)}"
        )
