"""
Chat router for Phase III: AI-Powered Todo Chatbot

Handles POST /api/chat endpoint for natural language task management.

User Stories:
- US1 (Add Tasks via Natural Language)
- US2 (View Tasks Through Conversation) - to be added
- US3 (Manage Tasks via Chat) - to be added
- US4 (Conversation Persistence)
- US5 (Seamless Authentication Integration)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime
import logging

from app.database import get_session
from app.dependencies.better_auth import get_current_user_from_better_auth
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.chat import ChatRequest, ChatResponse, ToolCall
from app.mcp.server import get_mcp_server
from app.agents.task_agent import get_agent_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user_from_better_auth),
    session: Session = Depends(get_session)
) -> ChatResponse:
    """
    Process chat message and return AI response with optional tool calls.

    This endpoint:
    1. Creates or retrieves conversation
    2. Stores user message in database
    3. Fetches conversation history
    4. Calls OpenAI agent with MCP tools
    5. Stores AI response in database
    6. Returns response with tool call details

    User Stories:
    - US1: Enables "Add a task to buy groceries" → calls add_task tool
    - US4: Persists conversation history in database
    - US5: Enforces user isolation via JWT authentication

    Args:
        request: ChatRequest with optional conversation_id and message
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        ChatResponse with conversation_id, response text, and optional tool_calls

    Raises:
        HTTPException 403: If conversation_id belongs to another user
        HTTPException 404: If conversation_id doesn't exist
        HTTPException 500: If agent processing fails

    Example:
        Request:
            POST /api/chat
            {"message": "Add a task to buy groceries"}

        Response:
            {
                "conversation_id": 1,
                "response": "I've added 'Buy groceries' to your tasks!",
                "tool_calls": [
                    {
                        "tool": "add_task",
                        "parameters": {"title": "Buy groceries"},
                        "result": {"task_id": 15, "status": "created"}
                    }
                ]
            }
    """
    user_id = str(current_user.id)

    # Step 1: Get or create conversation
    if request.conversation_id:
        # Retrieve existing conversation
        conversation = session.get(Conversation, request.conversation_id)

        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation {request.conversation_id} not found"
            )

        # User isolation check (CRITICAL SECURITY)
        if conversation.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to access this conversation"
            )

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)

    else:
        # Create new conversation
        conversation = Conversation(user_id=user_id)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)

        logger.info(f"Created new conversation {conversation.id} for user {user_id}")

    # Step 2: Store user message
    user_message = Message(
        user_id=user_id,
        conversation_id=conversation.id,
        role="user",
        content=request.message
    )
    session.add(user_message)
    session.commit()

    # Step 3: Fetch conversation history
    # Get last 20 messages for context (pagination handled in US4)
    history_query = (
        select(Message)
        .where(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.desc())
        .limit(20)
    )
    history_messages = session.exec(history_query).all()
    history_messages.reverse()  # Oldest first

    # Convert to OpenAI format
    messages = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
    ]

    # Step 4: Get MCP tools and call agent
    try:
        mcp_server = get_mcp_server()
        tool_schemas = mcp_server.get_tool_schemas()

        # Create tool executor that injects user_id and session
        async def tool_executor(tool_name: str, parameters: dict):
            return await mcp_server.execute_tool(
                tool_name=tool_name,
                parameters=parameters,
                user_id=user_id,
                db_session=session
            )

        # Get AI response with tool calling
        response_text, tool_calls = await get_agent_response(
            messages=messages,
            tools=tool_schemas,
            tool_executor=tool_executor
        )

        # Step 5: Store assistant response
        assistant_message = Message(
            user_id=user_id,
            conversation_id=conversation.id,
            role="assistant",
            content=response_text
        )
        session.add(assistant_message)
        session.commit()

        logger.info(
            f"Chat completed for user {user_id}, conversation {conversation.id}, "
            f"tools called: {len(tool_calls) if tool_calls else 0}"
        )

        # Step 6: Return response
        return ChatResponse(
            conversation_id=conversation.id,
            response=response_text,
            tool_calls=[ToolCall(**tc) for tc in tool_calls] if tool_calls else None
        )

    except Exception as e:
        logger.error(f"Chat processing failed for user {user_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process chat message: {str(e)}"
        )


@router.get("/conversations", status_code=status.HTTP_200_OK)
async def list_conversations(
    current_user: User = Depends(get_current_user_from_better_auth),
    session: Session = Depends(get_session)
):
    """
    List all conversations for the authenticated user.

    User Story: US4 (Conversation Persistence)

    Returns:
        List of conversations with metadata (ordered by most recent first)
    """
    user_id = str(current_user.id)

    # Get all user's conversations
    query = (
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    conversations = session.exec(query).all()

    return {"conversations": [
        {
            "id": conv.id,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat()
        }
        for conv in conversations
    ]}


@router.get("/conversations/{conversation_id}/messages", status_code=status.HTTP_200_OK)
async def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user_from_better_auth),
    session: Session = Depends(get_session)
):
    """
    Get all messages for a specific conversation.

    User Story: US4 (Conversation Persistence)

    Args:
        conversation_id: ID of the conversation to retrieve messages for

    Returns:
        List of messages in the conversation (ordered chronologically)

    Raises:
        HTTPException 404: If conversation not found
        HTTPException 403: If user not authorized to access conversation
    """
    user_id = str(current_user.id)

    # Check conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found"
        )

    # User isolation check (CRITICAL SECURITY)
    if conversation.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )

    # Get all messages for conversation
    query = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())  # Chronological order
    )
    messages = session.exec(query).all()

    return {"messages": [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]}
