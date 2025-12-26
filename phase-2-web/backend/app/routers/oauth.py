"""
OAuth authentication router for social login (Google, GitHub).
"""

import httpx
import secrets
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from pydantic import BaseModel

from app.dependencies.database import get_session
from app.models.user import User
from app.models.oauth_account import OAuthAccount
from app.services.auth import create_access_token
from app.utils.password import hash_password
from app.config import oauth as oauth_config


router = APIRouter(prefix="/api/auth", tags=["OAuth"])


# ============================================
# Google OAuth
# ============================================

@router.get("/google/login")
def google_login():
    """
    Initiate Google OAuth login flow.

    Redirects user to Google's authorization page.
    """
    if not oauth_config.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )

    # Build Google OAuth URL
    params = {
        "client_id": oauth_config.GOOGLE_CLIENT_ID,
        "redirect_uri": oauth_config.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(oauth_config.GOOGLE_SCOPES),
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"{oauth_config.GOOGLE_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(url=auth_url)


@router.get("/google/callback")
async def google_callback(code: str, session: Session = Depends(get_session)):
    """
    Handle Google OAuth callback.

    Exchanges authorization code for access token,
    fetches user info, and creates/links account.
    """
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            oauth_config.GOOGLE_TOKEN_URL,
            data={
                "client_id": oauth_config.GOOGLE_CLIENT_ID,
                "client_secret": oauth_config.GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": oauth_config.GOOGLE_REDIRECT_URI,
            },
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code"
            )

        tokens = token_response.json()
        access_token = tokens.get("access_token")

        # Fetch user info from Google
        userinfo_response = await client.get(
            oauth_config.GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user info"
            )

        userinfo = userinfo_response.json()

    # Process OAuth login
    jwt_token = process_oauth_login(
        session=session,
        provider="google",
        provider_user_id=userinfo["id"],
        email=userinfo.get("email"),
        name=userinfo.get("name"),
        avatar_url=userinfo.get("picture"),
    )

    # Redirect to frontend with token
    redirect_url = f"{oauth_config.FRONTEND_URL}/auth/callback?token={jwt_token}"
    return RedirectResponse(url=redirect_url)


# ============================================
# GitHub OAuth
# ============================================

@router.get("/github/login")
def github_login():
    """
    Initiate GitHub OAuth login flow.

    Redirects user to GitHub's authorization page.
    """
    if not oauth_config.GITHUB_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
        )

    # Build GitHub OAuth URL
    params = {
        "client_id": oauth_config.GITHUB_CLIENT_ID,
        "redirect_uri": oauth_config.GITHUB_REDIRECT_URI,
        "scope": " ".join(oauth_config.GITHUB_SCOPES),
    }

    auth_url = f"{oauth_config.GITHUB_AUTH_URL}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(url=auth_url)


@router.get("/github/callback")
async def github_callback(code: str, session: Session = Depends(get_session)):
    """
    Handle GitHub OAuth callback.

    Exchanges authorization code for access token,
    fetches user info, and creates/links account.
    """
    # Exchange code for access token
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            oauth_config.GITHUB_TOKEN_URL,
            data={
                "client_id": oauth_config.GITHUB_CLIENT_ID,
                "client_secret": oauth_config.GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": oauth_config.GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to exchange authorization code"
            )

        tokens = token_response.json()
        access_token = tokens.get("access_token")

        # Fetch user info from GitHub
        userinfo_response = await client.get(
            oauth_config.GITHUB_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

        if userinfo_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to fetch user info"
            )

        userinfo = userinfo_response.json()

        # Fetch user email if not public
        email = userinfo.get("email")
        if not email:
            emails_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
            if emails_response.status_code == 200:
                emails = emails_response.json()
                primary_email = next((e for e in emails if e.get("primary")), None)
                if primary_email:
                    email = primary_email.get("email")

    # Process OAuth login
    jwt_token = process_oauth_login(
        session=session,
        provider="github",
        provider_user_id=str(userinfo["id"]),
        email=email,
        name=userinfo.get("name") or userinfo.get("login"),
        avatar_url=userinfo.get("avatar_url"),
    )

    # Redirect to frontend with token
    redirect_url = f"{oauth_config.FRONTEND_URL}/auth/callback?token={jwt_token}"
    return RedirectResponse(url=redirect_url)


# ============================================
# Helper Functions
# ============================================

def process_oauth_login(
    session: Session,
    provider: str,
    provider_user_id: str,
    email: Optional[str],
    name: Optional[str],
    avatar_url: Optional[str],
) -> str:
    """
    Process OAuth login - create or link user account.

    Args:
        session: Database session
        provider: OAuth provider (google, github)
        provider_user_id: User ID from provider
        email: User email from provider
        name: User name from provider
        avatar_url: User avatar URL from provider

    Returns:
        JWT access token for our application
    """
    # Check if OAuth account already exists
    statement = select(OAuthAccount).where(
        OAuthAccount.provider == provider,
        OAuthAccount.provider_user_id == provider_user_id
    )
    oauth_account = session.exec(statement).first()

    if oauth_account:
        # Existing OAuth account - get linked user
        user = session.get(User, oauth_account.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account not found"
            )
    else:
        # New OAuth account - check if user exists by email
        user = None
        if email:
            statement = select(User).where(User.email == email)
            user = session.exec(statement).first()

        # Create new user if doesn't exist
        if not user:
            if not email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email is required for account creation"
                )

            # Generate random password (user won't use it for OAuth login)
            random_password = secrets.token_urlsafe(32)

            user = User(
                email=email,
                password_hash=hash_password(random_password)
            )
            session.add(user)
            session.commit()
            session.refresh(user)

        # Create OAuth account link
        oauth_account = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
            email=email,
            name=name,
            avatar_url=avatar_url,
        )
        session.add(oauth_account)
        session.commit()

    # Generate JWT token for our application
    jwt_token = create_access_token(user)
    return jwt_token
