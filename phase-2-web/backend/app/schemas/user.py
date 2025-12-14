"""
Pydantic schemas for user authentication and management.
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """
    Schema for user registration.

    Attributes:
        email: Valid email address
        password: Plain text password (min 8 characters)
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="User's password (min 8 characters)")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserLogin(BaseModel):
    """
    Schema for user login.

    Attributes:
        email: User's email address
        password: User's password
    """
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePass123!"
            }
        }


class UserResponse(BaseModel):
    """
    Schema for user response (without password).

    Attributes:
        id: User's unique identifier
        email: User's email address
        created_at: Account creation timestamp
    """
    id: int = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "email": "user@example.com",
                "created_at": "2025-01-15T10:30:00"
            }
        }
