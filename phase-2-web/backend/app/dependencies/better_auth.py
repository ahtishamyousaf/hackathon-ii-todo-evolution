"""
Better Auth session validation for FastAPI.

Validates Better Auth session tokens by checking the session table.
"""

from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, text
from datetime import datetime

from app.dependencies.database import get_session
from app.models.user import User

# HTTP Bearer token scheme
security = HTTPBearer()


def get_current_user_from_better_auth(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    session: Annotated[Session, Depends(get_session)]
) -> User:
    """
    Validate Better Auth session token and return user.

    Better Auth uses session tokens stored in the 'session' table.
    We validate the token against the Better Auth database.
    """
    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        # Better Auth v1.4.7 uses signed tokens: {session_id}.{signature}
        # Extract just the session_id part (before the first period)
        session_id = token.split('.')[0] if '.' in token else token

        # Query Better Auth session table
        query = text("""
            SELECT u.id, u.email, u.name, u."createdAt"
            FROM "user" u
            INNER JOIN "session" s ON s."userId" = u.id
            WHERE s.token = :token
            AND s."expiresAt" > NOW()
        """)

        result = session.exec(query.bindparams(token=session_id)).first()

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Map Better Auth user to FastAPI User model
        # Better Auth uses TEXT id, we convert to int
        user_id_str, email, name, created_at = result

        # Try to find or create corresponding user in FastAPI users table
        fastapi_user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if not fastapi_user:
            # Create FastAPI user from Better Auth user
            fastapi_user = User(
                id=user_id_str,  # Use Better Auth user ID
                email=email,
                password_hash="",  # Better Auth handles passwords
                created_at=created_at or datetime.utcnow()
            )
            session.add(fastapi_user)
            session.commit()
            session.refresh(fastapi_user)

        return fastapi_user

    except HTTPException:
        raise
    except Exception as e:
        print(f"Better Auth validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Type alias for dependency injection
CurrentUserBetterAuth = Annotated[User, Depends(get_current_user_from_better_auth)]
