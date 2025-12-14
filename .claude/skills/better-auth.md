# Better Auth Skill

Quick reference for Better Auth authentication library used in Phase II.

## What is Better Auth?

Better Auth is a modern authentication library for TypeScript/JavaScript applications with built-in session management, password hashing, and security features.

## Installation

```bash
# Frontend (Next.js)
npm install better-auth

# Backend (Python) - Use alternative
# Better Auth is TypeScript-focused
# For Python backend, use: passlib + JWT
```

## Python Backend Alternative (Recommended)

Since Better Auth is TypeScript-focused, use this pattern for Python/FastAPI:

### Install Dependencies
```bash
pip install passlib[bcrypt] python-jose[cryptography] python-multipart
```

### Password Hashing
```python
# app/auth/password.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

### JWT Tokens
```python
# app/auth/jwt.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional

SECRET_KEY = "your-secret-key-here"  # Use env variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

### Auth Routes
```python
# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlmodel import Session, select
from app.models.user import User
from app.schemas.auth import UserRegister, UserLogin, Token
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.dependencies.database import get_session

router = APIRouter()
security = HTTPBearer()

@router.post("/register", response_model=Token)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    # Check if user exists
    existing = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, session: Session = Depends(get_session)):
    # Find user
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    # Create token
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
```

### Auth Dependency
```python
# app/dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredential
from sqlmodel import Session
from app.models.user import User
from app.auth.jwt import verify_token
from app.dependencies.database import get_session

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthCredential = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = session.get(User, int(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

### Protected Route Example
```python
@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "created_at": current_user.created_at
    }
```

## Frontend (Next.js) Integration

### API Client with Auth
```typescript
// lib/api.ts
class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
      window.location.href = '/login';
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  async register(email: string, password: string) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.clearToken();
  }
}

export const api = new ApiClient();
```

### Auth Context
```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing token and fetch user
    const token = api.getToken();
    if (token) {
      // Fetch current user
      api.request('/api/auth/me')
        .then(res => res.json())
        .then(setUser)
        .catch(() => api.clearToken());
    }
  }, []);

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    const res = await api.request('/api/auth/me');
    const userData = await res.json();
    setUser(userData);
  };

  const register = async (email: string, password: string) => {
    await api.register(email, password);
    const res = await api.request('/api/auth/me');
    const userData = await res.json();
    setUser(userData);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## Security Best Practices

1. **Never store plain passwords**: Always hash with bcrypt
2. **Use HTTPS**: In production
3. **Secure tokens**: Use httpOnly cookies or secure localStorage
4. **Token expiration**: Set reasonable expiry times
5. **Rate limiting**: Prevent brute force attacks
6. **Input validation**: Validate email format and password strength
7. **CORS**: Configure properly
8. **Environment variables**: Store secrets securely

## Password Requirements

```python
import re

def validate_password(password: str) -> bool:
    """
    Password must be:
    - At least 8 characters
    - Contain uppercase and lowercase
    - Contain at least one number
    """
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True
```

## Key Concepts

- **Password hashing**: Use bcrypt (passlib)
- **JWT tokens**: Stateless authentication
- **Bearer tokens**: Send in Authorization header
- **Token expiration**: Refresh tokens for long sessions
- **Protected routes**: Require authentication dependency
