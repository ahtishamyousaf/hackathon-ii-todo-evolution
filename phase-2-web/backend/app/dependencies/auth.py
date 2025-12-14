"""
Authentication dependencies for FastAPI routes.
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session

from app.dependencies.database import get_session
from app.models.user import User
from app.utils.jwt import verify_token
from app.services.auth import get_user_by_email


# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """
    Dependency to get the current authenticated user from JWT token.

    Args:
        credentials: HTTP Authorization credentials (Bearer token)
        session: Database session

    Returns:
        Current authenticated User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    # Extract token from credentials
    token = credentials.credentials

    # Verify and decode token
    payload = verify_token(token)

    # Extract user email from token payload
    email = payload.get("email")
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing email",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Retrieve user from database
    user = get_user_by_email(session, email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


# Type alias for dependency injection
CurrentUser = Annotated[User, Depends(get_current_user)]
