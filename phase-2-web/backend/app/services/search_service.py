"""
Search service for advanced task search and filtering.

Feature: 005-quick-wins-ux (US6: Enhanced Search & Filters)
"""

from sqlmodel import Session, select
from typing import List, Optional
from app.models.task import Task
from app.schemas.search import SearchRequest, SearchResponse, FilterParams
from app.utils.query_builder import build_search_query


async def search_tasks(
    session: Session,
    user_id: int,
    search_request: SearchRequest
) -> SearchResponse:
    """
    Search tasks with filters and pagination.

    Args:
        session: Database session
        user_id: Current user ID
        search_request: Search parameters

    Returns:
        SearchResponse with matching tasks
    """
    # Build query
    stmt = build_search_query(
        user_id=user_id,
        query=search_request.query,
        filters=search_request.filters,
        sort_by=search_request.sort_by or "sort_order",
        sort_desc=search_request.sort_desc
    )

    # Get total count
    count_stmt = select(Task).where(Task.user_id == user_id)
    total_result = session.exec(count_stmt)
    total_count = len(list(total_result))

    # Apply pagination
    stmt = stmt.offset(search_request.offset).limit(search_request.limit)

    # Execute query
    results = session.exec(stmt).all()

    # Convert to dicts
    tasks = [task.model_dump() for task in results]

    return SearchResponse(
        tasks=tasks,
        total_count=total_count,
        limit=search_request.limit,
        offset=search_request.offset,
        has_more=search_request.offset + len(tasks) < total_count
    )
