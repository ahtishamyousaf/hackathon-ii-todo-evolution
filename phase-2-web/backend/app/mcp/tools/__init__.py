"""
MCP Tools for Phase III: AI-Powered Todo Chatbot

This module exports all MCP tools and their schemas for registration
with the MCP server and OpenAI agent.

User Stories:
- US1 (Add Tasks): add_task tool
- US2 (View Tasks): list_tasks tool
- US3 (Manage Tasks): complete_task, delete_task, update_task tools
- Browser Automation: navigate_to_url, take_screenshot, extract_page_text tools
"""

from app.mcp.tools.add_task import add_task, ADD_TASK_SCHEMA
from app.mcp.tools.list_tasks import list_tasks, LIST_TASKS_SCHEMA
from app.mcp.tools.complete_task import complete_task, COMPLETE_TASK_SCHEMA
from app.mcp.tools.delete_task import delete_task, DELETE_TASK_SCHEMA
from app.mcp.tools.update_task import update_task, UPDATE_TASK_SCHEMA
from app.mcp.tools.playwright_tools import (
    navigate_to_url,
    NAVIGATE_TO_URL_SCHEMA,
    take_screenshot,
    TAKE_SCREENSHOT_SCHEMA,
    extract_page_text,
    EXTRACT_PAGE_TEXT_SCHEMA,
)

__all__ = [
    "add_task",
    "ADD_TASK_SCHEMA",
    "list_tasks",
    "LIST_TASKS_SCHEMA",
    "complete_task",
    "COMPLETE_TASK_SCHEMA",
    "delete_task",
    "DELETE_TASK_SCHEMA",
    "update_task",
    "UPDATE_TASK_SCHEMA",
    "navigate_to_url",
    "NAVIGATE_TO_URL_SCHEMA",
    "take_screenshot",
    "TAKE_SCREENSHOT_SCHEMA",
    "extract_page_text",
    "EXTRACT_PAGE_TEXT_SCHEMA",
]
