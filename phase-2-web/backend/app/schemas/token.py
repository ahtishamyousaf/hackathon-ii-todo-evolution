"""
Pydantic schemas for authentication tokens.
"""

from pydantic import BaseModel, Field
from app.schemas.user import UserResponse


class Token(BaseModel):
    """
    Schema for JWT access token response.

    Attributes:
        access_token: JWT access token
        token_type: Token type (typically "bearer")
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }


class TokenData(BaseModel):
    """
    Schema for token payload data.

    Attributes:
        user_id: User's unique identifier from token
        email: User's email address from token
    """
    user_id: int = Field(..., description="User's unique identifier")
    email: str = Field(..., description="User's email address")


class AuthResponse(BaseModel):
    """
    Schema for authentication response (login/register).

    Attributes:
        access_token: JWT access token
        token_type: Token type (typically "bearer")
        user: User information
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "email": "user@example.com",
                    "created_at": "2025-01-15T10:30:00"
                }
            }
        }
