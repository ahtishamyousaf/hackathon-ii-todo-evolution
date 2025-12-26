"""
Query builder utility for advanced task search and filtering.

This module provides utilities to parse filter syntax and build SQLModel queries.
Supports syntax like "is:completed priority:high due:today category:work".

Feature: 005-quick-wins-ux (Enhanced Search & Filters)
"""

from sqlmodel import select, or_, and_, col
from typing import List, Optional, Tuple
from datetime import date, datetime, timedelta, timezone
import re

from app.models.task import Task
from app.schemas.search import FilterParams, DueFilter, StatusFilter


def parse_filter_query(query: str) -> Tuple[str, FilterParams]:
    """
    Parse advanced filter syntax from search query.

    Extracts filter tokens (is:completed, priority:high, etc.) and returns
    the remaining text query plus structured filter parameters.

    Args:
        query: Search query with optional filter syntax

    Returns:
        Tuple of (text_query, filter_params)

    Examples:
        >>> parse_filter_query("buy milk is:completed priority:high")
        ("buy milk", FilterParams(status="completed", priority="high"))

        >>> parse_filter_query("is:active category:work due:today")
        ("", FilterParams(status="active", category_name="work", due_filter="today"))
    """
    filter_params = FilterParams()
    text_parts = []

    # Pattern to match filter tokens like "key:value"
    filter_pattern = r'(\w+):(\w+)'

    # Split query into tokens
    tokens = query.split()

    for token in tokens:
        match = re.match(filter_pattern, token)
        if match:
            key, value = match.groups()

            # Parse status filters (is:completed, is:active)
            if key == "is":
                if value == "completed":
                    filter_params.status = StatusFilter.COMPLETED
                elif value == "active":
                    filter_params.status = StatusFilter.ACTIVE

            # Parse priority filters (priority:high, priority:medium, priority:low)
            elif key == "priority":
                filter_params.priority = value.lower()

            # Parse category filters (category:work, category:personal)
            elif key == "category":
                filter_params.category_name = value

            # Parse due date filters (due:today, due:overdue, due:this_week)
            elif key == "due":
                if value == "today":
                    filter_params.due_filter = DueFilter.TODAY
                elif value == "overdue":
                    filter_params.due_filter = DueFilter.OVERDUE
                elif value.replace("_", "") == "thisweek":
                    filter_params.due_filter = DueFilter.THIS_WEEK
                elif value.replace("_", "") == "thismonth":
                    filter_params.due_filter = DueFilter.THIS_MONTH
                elif value.replace("_", "") == "nodate":
                    filter_params.due_filter = DueFilter.NO_DATE

            # Unknown filter key - treat as text
            else:
                text_parts.append(token)
        else:
            # Not a filter token - add to text query
            text_parts.append(token)

    text_query = " ".join(text_parts).strip()
    return text_query, filter_params


def apply_filters(query_stmt, filters: FilterParams, user_id: int):
    """
    Apply filter parameters to a SQLModel select query.

    Args:
        query_stmt: Base SQLModel select statement
        filters: FilterParams with filter criteria
        user_id: Current user ID for ownership filter

    Returns:
        Modified select statement with filters applied
    """
    conditions = [Task.user_id == user_id]

    # Status filter (completed/active)
    if filters.status == StatusFilter.COMPLETED:
        conditions.append(Task.completed == True)
    elif filters.status == StatusFilter.ACTIVE:
        conditions.append(Task.completed == False)

    # Priority filter
    if filters.priority:
        conditions.append(Task.priority == filters.priority)

    # Category filter (by ID)
    if filters.category_id is not None:
        conditions.append(Task.category_id == filters.category_id)

    # Recurring filter
    if filters.is_recurring is not None:
        conditions.append(Task.is_recurring == filters.is_recurring)

    # Has due date filter
    if filters.has_due_date is not None:
        if filters.has_due_date:
            conditions.append(Task.due_date != None)
        else:
            conditions.append(Task.due_date == None)

    # Due date filters
    if filters.due_filter:
        today = date.today()

        if filters.due_filter == DueFilter.TODAY:
            conditions.append(Task.due_date == today)

        elif filters.due_filter == DueFilter.OVERDUE:
            conditions.append(Task.due_date < today)
            conditions.append(Task.completed == False)

        elif filters.due_filter == DueFilter.THIS_WEEK:
            week_end = today + timedelta(days=7)
            conditions.append(Task.due_date >= today)
            conditions.append(Task.due_date <= week_end)

        elif filters.due_filter == DueFilter.THIS_MONTH:
            month_end = today + timedelta(days=30)
            conditions.append(Task.due_date >= today)
            conditions.append(Task.due_date <= month_end)

        elif filters.due_filter == DueFilter.NO_DATE:
            conditions.append(Task.due_date == None)

    return query_stmt.where(and_(*conditions))


def apply_text_search(query_stmt, text_query: str):
    """
    Apply text search to title and description fields.

    Args:
        query_stmt: Base SQLModel select statement
        text_query: Text to search for

    Returns:
        Modified select statement with text search applied
    """
    if not text_query:
        return query_stmt

    # Case-insensitive search in title and description
    search_pattern = f"%{text_query}%"
    return query_stmt.where(
        or_(
            col(Task.title).ilike(search_pattern),
            col(Task.description).ilike(search_pattern)
        )
    )


def build_search_query(
    user_id: int,
    query: Optional[str] = None,
    filters: Optional[FilterParams] = None,
    sort_by: str = "sort_order",
    sort_desc: bool = False
):
    """
    Build complete search query with filters, text search, and sorting.

    Args:
        user_id: Current user ID
        query: Optional text search query (may include filter syntax)
        filters: Optional structured filter parameters
        sort_by: Field to sort by (default: sort_order)
        sort_desc: Sort descending (default: False)

    Returns:
        SQLModel select statement ready for execution

    Example:
        >>> stmt = build_search_query(
        ...     user_id=1,
        ...     query="buy milk is:active priority:high",
        ...     sort_by="due_date",
        ...     sort_desc=True
        ... )
    """
    # Start with base query
    stmt = select(Task)

    # Parse query string if provided
    text_query = ""
    parsed_filters = FilterParams()

    if query:
        text_query, parsed_filters = parse_filter_query(query)

    # Merge filters (structured filters override parsed filters)
    if filters:
        # Copy fields from structured filters if they're set
        if filters.status is not None:
            parsed_filters.status = filters.status
        if filters.priority is not None:
            parsed_filters.priority = filters.priority
        if filters.category_id is not None:
            parsed_filters.category_id = filters.category_id
        if filters.category_name is not None:
            parsed_filters.category_name = filters.category_name
        if filters.due_filter is not None:
            parsed_filters.due_filter = filters.due_filter
        if filters.has_due_date is not None:
            parsed_filters.has_due_date = filters.has_due_date
        if filters.is_recurring is not None:
            parsed_filters.is_recurring = filters.is_recurring

    # Apply filters
    stmt = apply_filters(stmt, parsed_filters, user_id)

    # Apply text search
    stmt = apply_text_search(stmt, text_query)

    # Apply sorting
    if sort_by:
        sort_col = getattr(Task, sort_by, Task.sort_order)
        if sort_desc:
            stmt = stmt.order_by(sort_col.desc())
        else:
            stmt = stmt.order_by(sort_col.asc())

        # Secondary sort by created_at for consistency
        stmt = stmt.order_by(Task.created_at.desc())

    return stmt
