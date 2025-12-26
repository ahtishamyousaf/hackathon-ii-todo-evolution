"""
Dashboard API router

Provides endpoints for dashboard statistics and analytics.
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, and_
from pydantic import BaseModel

from app.models.task import Task
from app.models.category import Category
from app.models.subtask import Subtask
from app.models.comment import Comment
from app.models.user import User
from app.dependencies.database import get_session
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


# Response schemas
class TasksByPriority(BaseModel):
    """Tasks grouped by priority."""
    high: int
    medium: int
    low: int


class TasksByCategory(BaseModel):
    """Tasks grouped by category."""
    category_id: int | None
    category_name: str
    count: int


class CompletionTrend(BaseModel):
    """Completion trend data point."""
    date: str
    completed: int
    created: int


class DashboardStats(BaseModel):
    """Dashboard statistics response."""
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    total_subtasks: int
    completed_subtasks: int
    total_comments: int
    tasks_by_priority: TasksByPriority
    tasks_by_category: List[TasksByCategory]
    completion_trends: List[CompletionTrend]


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get comprehensive dashboard statistics for the current user.

    Returns:
        - Task counts (total, completed, pending, overdue)
        - Completion rate
        - Subtask statistics
        - Comment count
        - Tasks grouped by priority
        - Tasks grouped by category
        - Completion trends over last 7 days
    """
    user_id = current_user.id

    # Get all user's tasks
    all_tasks = session.exec(
        select(Task).where(Task.user_id == user_id)
    ).all()

    # Basic counts
    total_tasks = len(all_tasks)
    completed_tasks = len([t for t in all_tasks if t.completed])
    pending_tasks = total_tasks - completed_tasks

    # Calculate overdue tasks
    today = datetime.now(timezone.utc).date()
    overdue_tasks = len([
        t for t in all_tasks
        if not t.completed and t.due_date and t.due_date < today
    ])

    # Completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Subtask statistics
    total_subtasks = 0
    completed_subtasks = 0
    comment_count = 0

    if total_tasks > 0:
        task_ids = [t.id for t in all_tasks]

        # Get subtask counts
        all_subtasks = session.exec(
            select(Subtask).where(Subtask.task_id.in_(task_ids))
        ).all()

        total_subtasks = len(all_subtasks)
        completed_subtasks = len([s for s in all_subtasks if s.completed])

        # Comment count
        comment_count = session.exec(
            select(func.count(Comment.id)).where(
                Comment.task_id.in_(task_ids)
            )
        ).first() or 0

    # Tasks by priority
    tasks_by_priority = TasksByPriority(
        high=len([t for t in all_tasks if t.priority == "high"]),
        medium=len([t for t in all_tasks if t.priority == "medium"]),
        low=len([t for t in all_tasks if t.priority == "low"])
    )

    # Tasks by category
    categories = session.exec(
        select(Category).where(Category.user_id == user_id)
    ).all()

    tasks_by_category = []

    # Uncategorized tasks
    uncategorized_count = len([t for t in all_tasks if t.category_id is None])
    if uncategorized_count > 0:
        tasks_by_category.append(TasksByCategory(
            category_id=None,
            category_name="Uncategorized",
            count=uncategorized_count
        ))

    # Categorized tasks
    for category in categories:
        count = len([t for t in all_tasks if t.category_id == category.id])
        if count > 0:
            tasks_by_category.append(TasksByCategory(
                category_id=category.id,
                category_name=category.name,
                count=count
            ))

    # Completion trends (last 7 days)
    completion_trends = []
    for i in range(6, -1, -1):  # Last 7 days
        date = (datetime.now(timezone.utc) - timedelta(days=i)).date()

        # Tasks completed on this date
        completed_on_date = len([
            t for t in all_tasks
            if t.updated_at.date() == date and t.completed
        ])

        # Tasks created on this date
        created_on_date = len([
            t for t in all_tasks
            if t.created_at.date() == date
        ])

        completion_trends.append(CompletionTrend(
            date=date.isoformat(),
            completed=completed_on_date,
            created=created_on_date
        ))

    return DashboardStats(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        overdue_tasks=overdue_tasks,
        completion_rate=round(completion_rate, 1),
        total_subtasks=total_subtasks,
        completed_subtasks=completed_subtasks,
        total_comments=comment_count,
        tasks_by_priority=tasks_by_priority,
        tasks_by_category=tasks_by_category,
        completion_trends=completion_trends
    )
