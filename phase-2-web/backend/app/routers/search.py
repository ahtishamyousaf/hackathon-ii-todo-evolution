"""
Search router for advanced task search endpoints.

Feature: 005-quick-wins-ux (US6: Enhanced Search & Filters)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.database import get_session
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.search import SearchRequest, SearchResponse
from app.services.search_service import search_tasks

router = APIRouter(prefix="/api/tasks/search", tags=["search"])


@router.post("", response_model=SearchResponse)
async def search_tasks_endpoint(
    search_request: SearchRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Search tasks with advanced filters and pagination.

    Supports filter syntax:
    - is:completed / is:active
    - priority:high / priority:medium / priority:low
    - category:name
    - due:today / due:overdue / due:this_week

    Returns paginated results with metadata.
    """
    return await search_tasks(session, current_user.id, search_request)
