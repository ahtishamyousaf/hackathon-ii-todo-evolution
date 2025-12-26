"""
Category model for organizing tasks.

SQLModel combines Pydantic validation with SQLAlchemy ORM.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class Category(SQLModel, table=True):
    """
    Category model for organizing tasks.

    Each category belongs to a user and has a name and color.
    """

    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    name: str = Field(max_length=50, nullable=False)
    color: str = Field(max_length=7, default="#3B82F6", nullable=False)  # Hex color code
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "name": "Work",
                "color": "#3B82F6"
            }
        }
