"""
Attachment API router

Provides endpoints for file uploads and downloads on tasks.
"""

import os
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlmodel import Session, select

from app.models.attachment import Attachment
from app.models.task import Task
from app.models.user import User
from app.dependencies.database import get_session
from app.dependencies.auth import get_current_user


router = APIRouter(prefix="/api/tasks", tags=["attachments"])

# Upload directory configuration
UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", ".gif",
    ".xlsx", ".xls", ".csv", ".zip", ".md"
}


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return os.path.splitext(filename)[1].lower()


@router.post("/{task_id}/attachments/", response_model=Attachment, status_code=status.HTTP_201_CREATED)
async def upload_attachment(
    task_id: int,
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a file attachment to a task.

    Args:
        task_id: Task ID
        file: File to upload
        session: Database session
        current_user: Authenticated user

    Returns:
        Attachment: The created attachment record

    Raises:
        HTTPException: 400 if file is invalid, 403 if unauthorized, 404 if task not found
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

    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    file_ext = get_file_extension(file.filename)
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file_ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    file_content = await file.read()
    file_size = len(file_content)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save file
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Create attachment record
    attachment = Attachment(
        task_id=task_id,
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        file_type=file.content_type or "application/octet-stream"
    )

    session.add(attachment)
    session.commit()
    session.refresh(attachment)

    return attachment


@router.get("/{task_id}/attachments/", response_model=List[Attachment])
def list_attachments(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Get all attachments for a task.

    Returns attachments ordered by creation time (newest first).
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

    # Get attachments
    statement = select(Attachment).where(
        Attachment.task_id == task_id
    ).order_by(Attachment.created_at.desc())

    attachments = session.exec(statement).all()
    return attachments


@router.get("/{task_id}/attachments/{attachment_id}/download")
async def download_attachment(
    task_id: int,
    attachment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Download an attachment file.

    Returns the file with appropriate headers for download.
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

    # Get attachment
    attachment = session.get(Attachment, attachment_id)
    if not attachment or attachment.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    # Check if file exists
    if not os.path.exists(attachment.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )

    return FileResponse(
        path=attachment.file_path,
        filename=attachment.filename,
        media_type=attachment.file_type
    )


@router.delete("/{task_id}/attachments/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(
    task_id: int,
    attachment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Delete an attachment.

    Removes both the database record and the physical file.
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

    # Get and delete attachment
    attachment = session.get(Attachment, attachment_id)
    if not attachment or attachment.task_id != task_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attachment not found"
        )

    # Delete physical file
    if os.path.exists(attachment.file_path):
        os.remove(attachment.file_path)

    # Delete database record
    session.delete(attachment)
    session.commit()

    return None
