"""
Chat schemas for Phase III: AI-Powered Todo Chatbot

Request/response schemas for chat API endpoints.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ChatRequest(BaseModel):
    """
    Request schema for POST /api/chat endpoint.

    Fields:
    - conversation_id: Optional ID to continue existing conversation
    - message: User's message text (required, 1-5000 characters)
    """
    conversation_id: Optional[int] = Field(
        default=None,
        description="Optional conversation ID (omit to create new conversation)"
    )
    message: str = Field(
        min_length=1,
        max_length=5000,
        description="User message text"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 42,
                "message": "Add a task to buy groceries"
            }
        }


class ToolCall(BaseModel):
    """
    Schema for MCP tool calls made by the AI assistant.

    Fields:
    - tool: Name of the MCP tool called
    - parameters: Parameters passed to the tool
    - result: Result returned by the tool
    """
    tool: str = Field(description="Name of tool called")
    parameters: Dict[str, Any] = Field(description="Parameters passed to tool")
    result: Dict[str, Any] = Field(description="Tool execution result")

    class Config:
        json_schema_extra = {
            "example": {
                "tool": "add_task",
                "parameters": {"title": "Buy groceries"},
                "result": {"task_id": 15, "status": "created", "title": "Buy groceries"}
            }
        }


class ChatResponse(BaseModel):
    """
    Response schema for POST /api/chat endpoint.

    Fields:
    - conversation_id: ID of conversation (newly created or existing)
    - response: AI assistant's response text
    - tool_calls: Optional list of tools called during processing
    """
    conversation_id: int = Field(description="Conversation ID (newly created or existing)")
    response: str = Field(description="AI assistant response")
    tool_calls: Optional[List[ToolCall]] = Field(
        default=None,
        description="Optional list of tools called by AI"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": 42,
                "response": "I've added 'Buy groceries' to your tasks!",
                "tool_calls": [
                    {
                        "tool": "add_task",
                        "parameters": {"title": "Buy groceries"},
                        "result": {"task_id": 15, "status": "created"}
                    }
                ]
            }
        }


class ConversationListItem(BaseModel):
    """
    Schema for individual conversation in list response.

    Fields:
    - id: Conversation ID
    - last_message: Preview of last message
    - last_updated: Timestamp of last activity
    - message_count: Total number of messages
    """
    id: int
    last_message: Optional[str] = None
    last_updated: str
    message_count: int

    model_config = {"from_attributes": True}


class ConversationListResponse(BaseModel):
    """
    Response schema for GET /api/conversations endpoint.

    Fields:
    - conversations: List of user's conversations
    """
    conversations: List[ConversationListItem]

    class Config:
        json_schema_extra = {
            "example": {
                "conversations": [
                    {
                        "id": 42,
                        "last_message": "I've added 'Buy groceries' to your tasks!",
                        "last_updated": "2025-12-27T10:30:00Z",
                        "message_count": 5
                    }
                ]
            }
        }
