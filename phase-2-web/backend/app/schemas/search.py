"""
Search and filter schemas for task management system.

This module defines schemas for advanced search and filtering operations,
supporting query syntax like "is:completed priority:high due:today".

Feature: 005-quick-wins-ux (Enhanced Search & Filters)
"""

from sqlmodel import SQLModel
from typing import Optional, List
from datetime import date
from enum import Enum


class DueFilter(str, Enum):
    """Due date filter options."""
    TODAY = "today"
    OVERDUE = "overdue"
    THIS_WEEK = "this_week"
    THIS_MONTH = "this_month"
    NO_DATE = "no_date"


class StatusFilter(str, Enum):
    """Task status filter options."""
    COMPLETED = "completed"
    ACTIVE = "active"
    ALL = "all"


class FilterParams(SQLModel):
    """
    Structured filter parameters for task search.

    All fields are optional. Multiple filters combine with AND logic.

    Example:
        {
            "status": "active",
            "priority": "high",
            "category_name": "work",
            "due_filter": "today"
        }
    """
    status: Optional[StatusFilter] = None
    priority: Optional[str] = None  # "low", "medium", "high"
    category_id: Optional[int] = None
    category_name: Optional[str] = None  # Filter by category name
    due_filter: Optional[DueFilter] = None
    has_due_date: Optional[bool] = None
    is_recurring: Optional[bool] = None


class SearchRequest(SQLModel):
    """
    Search request with query string and filters.

    Supports both free-text search and structured filters.

    Example:
        {
            "query": "buy groceries",
            "filters": {
                "status": "active",
                "priority": "high"
            },
            "limit": 50,
            "offset": 0
        }
    """
    query: Optional[str] = None  # Free-text search
    filters: Optional[FilterParams] = None
    limit: int = 50
    offset: int = 0
    sort_by: Optional[str] = "sort_order"  # Field to sort by
    sort_desc: bool = False  # Sort descending


class SearchResponse(SQLModel):
    """
    Search response with matching tasks and metadata.

    Returns tasks matching the search criteria with pagination info.
    """
    tasks: List[dict]  # List of TaskRead dicts
    total_count: int
    limit: int
    offset: int
    has_more: bool
