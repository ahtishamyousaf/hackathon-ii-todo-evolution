"""
Task Agent for Phase III: AI-Powered Todo Chatbot

This module configures the OpenAI agent that interprets natural language
and calls MCP tools to manage tasks.

Architecture:
- Uses OpenAI Python SDK (standard library with function calling)
- Stateless: No conversation state stored in agent
- System prompts guide AI behavior for task management
- Function calling with MCP tools
"""

import os
import logging
import time
from typing import List, Dict, Any, Optional
from openai import OpenAI, RateLimitError, APIError, APIConnectionError

logger = logging.getLogger(__name__)

# OpenAI client configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    logger.warning("OPENAI_API_KEY not set - AI agent will not function")
    client = None
else:
    client = OpenAI(api_key=OPENAI_API_KEY)

# Model configuration
MODEL = "gpt-4"  # Can be changed to gpt-4-turbo or gpt-3.5-turbo

# System prompt for task management agent
SYSTEM_PROMPT = """You are a helpful task management assistant. Your role is to help users manage their todo lists through natural conversation.

You have access to these tools:
- add_task: Create a new task with a title and optional description
- list_tasks: View tasks with optional filtering by status (all, pending, completed)
- complete_task: Mark a task as complete by its ID
- delete_task: Delete a task by its ID
- update_task: Update a task's title or description by its ID

Guidelines:
1. Always be friendly and conversational
2. Confirm actions after completing them (e.g., "I've added 'Buy groceries' to your tasks!")
3. When listing tasks, format them clearly with numbers or bullet points
4. If a user asks to delete/complete/update a task but doesn't provide an ID, list their tasks first
5. IMPORTANT: For delete operations, confirm with the user before calling delete_task (e.g., "Are you sure you want to delete task 5: Buy groceries?")
6. Extract task details from natural language (e.g., "remind me to call mom" → title: "Call mom")
7. Handle ambiguity by asking clarifying questions
8. Keep responses concise but helpful

Examples:
- "Add a task to buy groceries" → Call add_task with title "Buy groceries"
- "What's on my list?" → Call list_tasks with status "all"
- "Mark task 3 as done" → Call complete_task with task_id=3
- "Delete the grocery task" → First list_tasks, then confirm which task to delete

User Stories this supports:
- US1: Add tasks via natural language
- US2: View tasks through conversation
- US3: Manage tasks (complete, delete, update) via chat
"""


def retry_with_exponential_backoff(
    func,
    max_retries: int = 3,
    initial_delay: float = 1.0,
    exponential_base: float = 2.0,
    jitter: bool = True
):
    """
    Retry a function with exponential backoff.

    This decorator handles transient OpenAI API failures (rate limits, server errors)
    with exponential backoff retry logic.

    Args:
        func: Function to retry
        max_retries: Maximum number of retry attempts (default: 3)
        initial_delay: Initial delay in seconds (default: 1.0)
        exponential_base: Backoff multiplier (default: 2.0)
        jitter: Add randomness to delay (default: True)

    Returns:
        Wrapped function with retry logic

    Example:
        >>> @retry_with_exponential_backoff
        >>> def call_openai():
        >>>     return client.chat.completions.create(...)
    """
    def wrapper(*args, **kwargs):
        num_retries = 0
        delay = initial_delay

        while True:
            try:
                return func(*args, **kwargs)

            except RateLimitError as e:
                # Rate limit hit - retry with backoff
                num_retries += 1
                if num_retries > max_retries:
                    logger.error(f"Max retries ({max_retries}) exceeded for rate limit")
                    raise Exception("OpenAI rate limit exceeded. Please try again later.")

                # Calculate delay with jitter
                sleep_time = delay * (exponential_base ** (num_retries - 1))
                if jitter:
                    import random
                    sleep_time = sleep_time * (1 + random.random() * 0.1)

                logger.warning(f"Rate limit hit. Retrying in {sleep_time:.2f}s (attempt {num_retries}/{max_retries})")
                time.sleep(sleep_time)

            except (APIError, APIConnectionError) as e:
                # Server error or connection error - retry with backoff
                num_retries += 1
                if num_retries > max_retries:
                    logger.error(f"Max retries ({max_retries}) exceeded for API error: {str(e)}")
                    raise Exception("OpenAI API is temporarily unavailable. Please try again later.")

                # Calculate delay with jitter
                sleep_time = delay * (exponential_base ** (num_retries - 1))
                if jitter:
                    import random
                    sleep_time = sleep_time * (1 + random.random() * 0.1)

                logger.warning(f"API error: {str(e)}. Retrying in {sleep_time:.2f}s (attempt {num_retries}/{max_retries})")
                time.sleep(sleep_time)

            except Exception as e:
                # Unexpected error - don't retry
                logger.error(f"Unexpected error in OpenAI call: {str(e)}")
                raise

    return wrapper


async def get_agent_response(
    messages: List[Dict[str, str]],
    tools: List[Dict[str, Any]],
    tool_executor: Any
) -> tuple[str, Optional[List[Dict[str, Any]]]]:
    """
    Get AI agent response with tool calling.

    This function:
    1. Sends conversation history to OpenAI
    2. Receives response (may include tool calls)
    3. Executes any requested tools
    4. Gets final response from AI
    5. Returns response text and tool call details

    Args:
        messages: Conversation history (list of {role: str, content: str})
        tools: Tool schemas for function calling
        tool_executor: Async function to execute tools

    Returns:
        Tuple of (response_text, tool_calls_list)

    Example:
        response, tool_calls = await get_agent_response(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": "Add a task to buy milk"}
            ],
            tool_schemas,
            execute_tool_func
        )
        # Returns: ("I've added 'Buy milk' to your tasks!", [{tool: "add_task", ...}])
    """
    # Check if OpenAI client is available
    if client is None:
        raise ValueError("OpenAI API key not configured - AI chat is unavailable")

    try:
        # Add system prompt if not present
        if not messages or messages[0].get("role") != "system":
            messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages

        # Initial API call with retry logic
        @retry_with_exponential_backoff
        def make_api_call():
            return client.chat.completions.create(
                model=MODEL,
                messages=messages,
                tools=tools if tools else None,
                tool_choice="auto"
            )

        response = make_api_call()

        response_message = response.choices[0].message
        tool_calls_made = []

        # Handle tool calls if any
        if response_message.tool_calls:
            # Add assistant's tool call request to conversation
            messages.append({
                "role": "assistant",
                "content": response_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in response_message.tool_calls
                ]
            })

            # Execute each tool call
            for tool_call in response_message.tool_calls:
                import json
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                logger.info(f"Executing tool: {tool_name} with args: {tool_args}")

                # Execute tool
                try:
                    result = await tool_executor(tool_name, tool_args)

                    # Record tool call details
                    tool_calls_made.append({
                        "tool": tool_name,
                        "parameters": tool_args,
                        "result": result
                    })

                    # Add tool result to conversation
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps(result)
                    })

                except Exception as e:
                    logger.error(f"Tool execution failed: {str(e)}")
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": tool_name,
                        "content": json.dumps({"error": str(e)})
                    })

            # Get final response after tool execution with retry logic
            @retry_with_exponential_backoff
            def make_final_call():
                return client.chat.completions.create(
                    model=MODEL,
                    messages=messages
                )

            final_response = make_final_call()

            final_text = final_response.choices[0].message.content

            return final_text, tool_calls_made if tool_calls_made else None

        else:
            # No tool calls - direct response
            return response_message.content, None

    except Exception as e:
        logger.error(f"Agent response failed: {str(e)}")
        raise Exception(f"Failed to get AI response: {str(e)}")


def get_openai_client() -> OpenAI:
    """
    Get configured OpenAI client instance.

    Returns:
        OpenAI client for making API calls
    """
    return client
