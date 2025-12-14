"""
Authentication router for user registration and login.
"""

from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.dependencies.database import get_session
from app.dependencies.auth import CurrentUser
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.schemas.token import AuthResponse
from app.services.auth import register_user, authenticate_user, create_access_token


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
