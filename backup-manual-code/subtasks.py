"""
Subtask API router

Provides endpoints for managing subtasks (checklists within tasks).
"""

from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.models.subtask import Subtask
from app.models.task import Task
from app.models.user import User
from app.dependencies.database import get_session
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["subtasks"])


# Pydantic schemas for request/response
class SubtaskCreate(BaseModel):
    """Schema for creating a new subtask."""
    title: str
    completed: bool = False
    order: int = 0


class SubtaskUpdate(BaseModel):
    """Schema for updating an existing subtask."""
    title: str | None = None
    completed: bool | None = None
    order: int | None = None


@router.post("/{task_id}/subtasks/", response_model=Subtask, status_code=status.HTTP_201_CREATED)
def create_subtask(
    task_id: int,
    subtask_data: SubtaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new subtask for a task.

    Verifies that the task belongs to the current user before creating the subtask.
    """
    # Verify task exists and belongs to current user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    # Create subtask
    subtask = Subtask(
        task_id=task_id,
        title=subtask_data.title,
        completed=subtask_data.completed,
        order=subtask_data.order
    )

    session.add(subtask)
    session.commit()
    session.refresh(subtask)

    return subtask


@router.get("/{task_id}/subtasks/", response_model=List[Subtask])
def list_subtasks(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all subtasks for a task.

    Returns subtasks ordered by their order field.
    """
    # Verify task exists and belongs to current user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    # Get subtasks
    statement = select(Subtask).where(
        Subtask.task_id == task_id
    ).order_by(Subtask.order, Subtask.created_at)

    subtasks = session.exec(statement).all()
    return subtasks


@router.put("/{task_id}/subtasks/{subtask_id}", response_model=Subtask)
def update_subtask(
    task_id: int,
    subtask_id: int,
    subtask_data: SubtaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a subtask.

    Verifies that the parent task belongs to the current user.
    """
    # Verify task exists and belongs to current user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    # Get subtask
    subtask = session.get(Subtask, subtask_id)
    if not subtask or subtask.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    # Update subtask fields
    if subtask_data.title is not None:
        subtask.title = subtask_data.title
    if subtask_data.completed is not None:
        subtask.completed = subtask_data.completed
    if subtask_data.order is not None:
        subtask.order = subtask_data.order

    subtask.updated_at = datetime.now(timezone.utc)

    session.add(subtask)
    session.commit()
    session.refresh(subtask)

    return subtask


@router.delete("/{task_id}/subtasks/{subtask_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subtask(
    task_id: int,
    subtask_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a subtask.

    Verifies that the parent task belongs to the current user.
    """
    # Verify task exists and belongs to current user
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    # Get and delete subtask
    subtask = session.get(Subtask, subtask_id)
    if not subtask or subtask.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subtask not found"
        )

    session.delete(subtask)
    session.commit()

    return None
