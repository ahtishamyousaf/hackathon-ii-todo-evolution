"""
Comment API router

Provides endpoints for managing task comments/notes.
"""

from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel

from app.models.comment import Comment
from app.models.task import Task
from app.models.user import User
from app.dependencies.database import get_session
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["comments"])


# Pydantic schemas for request/response
class CommentCreate(BaseModel):
    """Schema for creating a new comment."""
    content: str


class CommentUpdate(BaseModel):
    """Schema for updating an existing comment."""
    content: str


@router.post("/{task_id}/comments/", response_model=Comment, status_code=status.HTTP_201_CREATED)
def create_comment(
    task_id: int,
    comment_data: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new comment for a task.

    Verifies that the task belongs to the current user before creating the comment.
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

    # Create comment
    comment = Comment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment_data.content
    )

    session.add(comment)
    session.commit()
    session.refresh(comment)

    return comment


@router.get("/{task_id}/comments/", response_model=List[Comment])
def list_comments(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all comments for a task.

    Returns comments ordered by creation time (newest first).
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

    # Get comments
    statement = select(Comment).where(
        Comment.task_id == task_id
    ).order_by(Comment.created_at.desc())

    comments = session.exec(statement).all()
    return comments


@router.put("/{task_id}/comments/{comment_id}", response_model=Comment)
def update_comment(
    task_id: int,
    comment_id: int,
    comment_data: CommentUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Update a comment.

    Only the user who created the comment can update it.
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

    # Get comment
    comment = session.get(Comment, comment_id)
    if not comment or comment.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Verify user owns the comment
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this comment"
        )

    # Update comment
    comment.content = comment_data.content
    comment.updated_at = datetime.now(timezone.utc)

    session.add(comment)
    session.commit()
    session.refresh(comment)

    return comment


@router.delete("/{task_id}/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    task_id: int,
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a comment.

    Only the user who created the comment can delete it.
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

    # Get and delete comment
    comment = session.get(Comment, comment_id)
    if not comment or comment.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Verify user owns the comment
    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this comment"
        )

    session.delete(comment)
    session.commit()

    return None
