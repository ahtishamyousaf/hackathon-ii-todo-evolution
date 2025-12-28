"""
OAuth Account model for storing social login connections.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel


class OAuthAccount(SQLModel, table=True):
    """
    OAuth account model for social login.

    Links user accounts to OAuth providers (Google, GitHub, etc.)
    Stores provider-specific user information and tokens.
    """

    __tablename__ = "oauth_accounts"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True, nullable=False)

    # OAuth provider information
    provider: str = Field(max_length=50, nullable=False, index=True)  # google, github, etc.
    provider_user_id: str = Field(max_length=255, nullable=False, index=True)  # User ID from provider

    # User information from provider
    email: Optional[str] = Field(default=None, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    avatar_url: Optional[str] = Field(default=None, max_length=500)

    # OAuth tokens (optional - for API access)
    access_token: Optional[str] = Field(default=None, max_length=500)
    refresh_token: Optional[str] = Field(default=None, max_length=500)
    token_expires_at: Optional[datetime] = Field(default=None)

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
                "provider": "google",
                "provider_user_id": "1234567890",
                "email": "user@gmail.com",
                "name": "John Doe"
            }
        }
