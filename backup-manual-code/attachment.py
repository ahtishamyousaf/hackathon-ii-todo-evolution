"""
Attachment Model

An attachment represents a file uploaded to a task.
Each attachment belongs to a task and is uploaded by a user.
"""

from typing import Optional
from datetime import datetime, timezone
from sqlmodel import Field, SQLModel


class Attachment(SQLModel, table=True):
    """
    Attachment model for file uploads on tasks.

    Attributes:
        id: Unique identifier for the attachment
        task_id: Foreign key to parent task
        user_id: Foreign key to user who uploaded the file
        filename: Original filename
        file_path: Server path to the file
        file_size: Size of file in bytes
        file_type: MIME type of the file
        created_at: When the attachment was uploaded
    """
    __tablename__ = "attachments"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True, nullable=False)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    filename: str = Field(max_length=255, nullable=False)
    file_path: str = Field(max_length=500, nullable=False)
    file_size: int = Field(nullable=False)  # Size in bytes
    file_type: str = Field(max_length=100, nullable=False)  # MIME type
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
