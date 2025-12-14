"""
User model for authentication and user management.
"""

from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """
    User model representing authenticated users in the system.

    Attributes:
        id: Primary key, auto-generated
        email: Unique email address for the user
        password_hash: Bcrypt hashed password
        created_at: Timestamp when the user was created
    """
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "created_at": "2025-01-15T10:30:00"
            }
        }
