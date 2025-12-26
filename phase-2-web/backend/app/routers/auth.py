"""
Authentication router for user registration and login.
"""

import secrets
from datetime import datetime, timezone
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr

from app.dependencies.database import get_session
from app.dependencies.auth import CurrentUser
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import AuthResponse
from app.services.auth import register_user, authenticate_user, create_access_token
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.utils.email import send_password_reset_email
from app.utils.password import hash_password


# Request/Response schemas for password reset
class ForgotPasswordRequest(BaseModel):
    """Request schema for forgot password."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Request schema for password reset."""
    token: str
    new_password: str


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str


router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password"
)
def register(
    user_data: UserRegister,
    session: Annotated[Session, Depends(get_session)]
) -> AuthResponse:
    """
    Register a new user and return access token.

    Args:
        user_data: User registration data (email, password)
        session: Database session

    Returns:
        AuthResponse with access token and user information

    Raises:
        HTTPException 400: If email already exists
    """
    # Create new user
    user = register_user(session, user_data)

    # Generate access token
    access_token = create_access_token(user)

    # Return auth response
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email and password",
    description="Authenticate user and return access token"
)
def login(
    credentials: UserLogin,
    session: Annotated[Session, Depends(get_session)]
) -> AuthResponse:
    """
    Authenticate user and return access token.

    Args:
        credentials: User login credentials (email, password)
        session: Database session

    Returns:
        AuthResponse with access token and user information

    Raises:
        HTTPException 401: If credentials are invalid
    """
    # Authenticate user
    user = authenticate_user(session, credentials.email, credentials.password)

    # Generate access token
    access_token = create_access_token(user)

    # Return auth response
    return AuthResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Retrieve the currently authenticated user's information"
)
def get_me(current_user: CurrentUser) -> UserResponse:
    """
    Get the currently authenticated user.

    Args:
        current_user: Current authenticated user (from JWT token)

    Returns:
        UserResponse with user information

    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Request password reset",
    description="Send password reset email to user"
)
def forgot_password(
    request: ForgotPasswordRequest,
    session: Annotated[Session, Depends(get_session)]
) -> MessageResponse:
    """
    Send password reset email.

    Args:
        request: Email address for password reset
        session: Database session

    Returns:
        Success message (always returns success for security)

    Note:
        Always returns success message even if email doesn't exist
        to prevent email enumeration attacks.
    """
    # Find user by email
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()

    if user:
        # Generate secure random token
        reset_token = secrets.token_urlsafe(32)

        # Create password reset token record
        token_record = PasswordResetToken(
            user_id=user.id,
            token=reset_token,
            expires_at=PasswordResetToken.create_expiry_time(hours=1)
        )

        session.add(token_record)
        session.commit()

        # Send password reset email
        send_password_reset_email(user.email, reset_token)

    # Always return success message (security: don't reveal if email exists)
    return MessageResponse(
        message="If an account exists with that email, a password reset link has been sent."
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Reset password with token",
    description="Reset user password using reset token from email"
)
def reset_password(
    request: ResetPasswordRequest,
    session: Annotated[Session, Depends(get_session)]
) -> MessageResponse:
    """
    Reset password using token from email.

    Args:
        request: Reset token and new password
        session: Database session

    Returns:
        Success message

    Raises:
        HTTPException 400: If token is invalid, expired, or already used
    """
    # Find token in database
    statement = select(PasswordResetToken).where(
        PasswordResetToken.token == request.token
    )
    token_record = session.exec(statement).first()

    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Validate token
    if not token_record.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Get user
    user = session.get(User, token_record.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found"
        )

    # Update password
    user.password_hash = hash_password(request.new_password)
    session.add(user)

    # Mark token as used
    token_record.used_at = datetime.now(timezone.utc)
    session.add(token_record)

    session.commit()

    return MessageResponse(
        message="Password has been reset successfully. You can now log in with your new password."
    )
