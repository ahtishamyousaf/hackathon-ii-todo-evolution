"""
Authentication service for user registration and login.
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlmodel import Session, select
from jose import jwt

from app.models.user import User
from app.schemas.user import UserRegister
from app.utils.password import hash_password, verify_password
from app.config import settings


def get_user_by_email(session: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by email address.

    Args:
        session: Database session
        email: User's email address

    Returns:
        User object if found, None otherwise
    """
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


def register_user(session: Session, user_data: UserRegister) -> User:
    """
    Register a new user with hashed password.

    Args:
        session: Database session
        user_data: User registration data (email, password)

    Returns:
        Newly created User object

    Raises:
        HTTPException: If email already exists
    """
    # Check if user already exists
    existing_user = get_user_by_email(session, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        password_hash=hashed_password,
        created_at=datetime.utcnow()
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return new_user


def authenticate_user(session: Session, email: str, password: str) -> User:
    """
    Authenticate a user with email and password.

    Args:
        session: Database session
        email: User's email address
        password: Plain text password

    Returns:
        User object if authentication successful

    Raises:
        HTTPException: If credentials are invalid
    """
    user = get_user_by_email(session, email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def create_access_token(user: User) -> str:
    """
    Create a JWT access token for a user.

    Args:
        user: User object

    Returns:
        Encoded JWT token string
    """
    # Calculate expiration time
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)

    # Create token payload
    payload = {
        "sub": str(user.id),  # Subject (user ID)
        "email": user.email,
        "exp": expire,  # Expiration time
        "iat": datetime.utcnow(),  # Issued at
    }

    # Encode and return token
    token = jwt.encode(
        payload,
        settings.better_auth_secret,
        algorithm=settings.algorithm
    )

    return token
