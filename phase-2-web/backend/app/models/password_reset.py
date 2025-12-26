"""
Password Reset Token model for handling password reset requests.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlmodel import Field, SQLModel


class PasswordResetToken(SQLModel, table=True):
    """
    Password reset token model.

    Stores tokens for password reset requests with expiration.
    Tokens are single-use and expire after 1 hour.
    """

    __tablename__ = "password_reset_tokens"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True, nullable=False)
    token: str = Field(max_length=255, unique=True, index=True, nullable=False)
    expires_at: datetime = Field(nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    used_at: Optional[datetime] = Field(default=None, nullable=True)

    def is_expired(self) -> bool:
        """Check if token has expired."""
        return datetime.now(timezone.utc) > self.expires_at

    def is_used(self) -> bool:
        """Check if token has been used."""
        return self.used_at is not None

    def is_valid(self) -> bool:
        """Check if token is valid (not expired and not used)."""
        return not self.is_expired() and not self.is_used()

    @staticmethod
    def create_expiry_time(hours: int = 1) -> datetime:
        """Create expiry timestamp (default 1 hour from now)."""
        return datetime.now(timezone.utc) + timedelta(hours=hours)
