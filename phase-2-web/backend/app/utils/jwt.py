"""
JWT token verification utilities.

Handles verification of JWT tokens issued by Better Auth from the frontend.
Uses shared BETTER_AUTH_SECRET for token validation.
"""

from jose import jwt, JWTError
from fastapi import HTTPException, status
from app.config import settings


def verify_token(token: str) -> dict:
    """
    Verify and decode JWT token issued by Better Auth.

    Args:
        token: JWT token string (without 'Bearer ' prefix)

    Returns:
        dict: Decoded token payload containing user_id and other claims

    Raises:
        HTTPException: If token is invalid, expired, or malformed

    Token payload structure (from Better Auth):
        {
            "sub": "user_id",  # User ID
            "email": "user@example.com",
            "iat": 1234567890,  # Issued at
            "exp": 1234657890,  # Expiration
        }
    """
    try:
        # Decode and verify token using shared BETTER_AUTH_SECRET
        payload = jwt.decode(
            token,
            settings.better_auth_secret,
            algorithms=[settings.algorithm]
        )

        # Extract user ID from 'sub' claim
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def validate_user_id_match(url_user_id: str, jwt_user_id: int) -> None:
    """
    Validate that user_id in URL matches user_id from JWT token.

    This prevents users from accessing other users' resources by
    ensuring the URL user_id matches the authenticated user's ID.

    Args:
        url_user_id: User ID from URL path parameter
        jwt_user_id: User ID from JWT token payload

    Raises:
        HTTPException: If user IDs don't match (403 Forbidden)

    Example:
        # In route handler:
        @router.get("/api/{user_id}/tasks")
        def get_tasks(
            user_id: str,
            current_user = Depends(get_current_user)
        ):
            validate_user_id_match(user_id, current_user.id)
            # User is authorized to access this resource
    """
    try:
        # Convert URL user_id string to int for comparison
        url_id = int(url_user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format in URL"
        )

    if url_id != jwt_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )


def create_access_token(data: dict) -> str:
    """
    Create a new JWT access token.

    Note: In Phase II, Better Auth handles token creation on the frontend.
    This function is provided for completeness and may be used for
    backend-only token generation if needed.

    Args:
        data: Payload data to encode in token (should include 'sub' with user_id)

    Returns:
        str: Encoded JWT token

    Example:
        token = create_access_token({"sub": str(user.id), "email": user.email})
    """
    to_encode = data.copy()

    # Encode JWT token
    encoded_jwt = jwt.encode(
        to_encode,
        settings.better_auth_secret,
        algorithm=settings.algorithm
    )

    return encoded_jwt
