"""
Bulk operation schemas for task management system.

This module defines schemas for bulk operations on multiple tasks,
including bulk updates and bulk deletes.

Feature: 005-quick-wins-ux (Bulk Task Operations)
"""

from sqlmodel import SQLModel
from typing import Optional, List
from datetime import date


class BulkUpdateRequest(SQLModel):
    """
    Schema for bulk update operations on multiple tasks.

    Allows updating multiple tasks at once with the same changes.
    At least one update field must be provided.

    Example:
        {
            "task_ids": [1, 2, 3],
            "updates": {
                "completed": true,
                "priority": "high"
            }
        }
    """
    task_ids: List[int]
    updates: dict  # Contains any TaskUpdate fields


class BulkUpdateResponse(SQLModel):
    """
    Response schema for bulk update operations.

    Returns count of updated tasks and their IDs.
    """
    updated_count: int
    task_ids: List[int]
    message: str


class BulkDeleteRequest(SQLModel):
    """
    Schema for bulk delete operations on multiple tasks.

    Example:
        {
            "task_ids": [1, 2, 3]
        }
    """
    task_ids: List[int]


class BulkDeleteResponse(SQLModel):
    """
    Response schema for bulk delete operations.

    Returns count of deleted tasks and their IDs.
    """
    deleted_count: int
    task_ids: List[int]
    message: str
