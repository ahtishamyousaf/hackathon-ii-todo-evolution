"""
OAuth provider configuration.

Set these environment variables for OAuth to work:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET
- FRONTEND_URL (for OAuth callbacks)
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Frontend URL for OAuth callbacks
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = f"{BACKEND_URL}/api/auth/google/callback"
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

# GitHub OAuth configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = f"{BACKEND_URL}/api/auth/github/callback"
GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"

# OAuth scopes
GOOGLE_SCOPES = ["openid", "email", "profile"]
GITHUB_SCOPES = ["read:user", "user:email"]
