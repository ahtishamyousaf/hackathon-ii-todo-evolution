# Phase 0: Research & Technology Decisions

**Feature**: Web-Based Todo Application
**Date**: 2025-12-14
**Purpose**: Document technology choices, patterns, and best practices for Phase II implementation

---

## 1. Neon PostgreSQL Setup

### Decision: Use Neon PostgreSQL Serverless

**Rationale**:
- Serverless architecture (no server management)
- Generous free tier (3 GB storage, 100 concurrent connections)
- Built-in connection pooling
- Instant database branching for testing
- Excellent for hackathon/MVP projects

**Connection Pattern**:
```python
# Database URL format
DATABASE_URL = "postgresql://username:password@ep-cool-sun-123456.region.aws.neon.tech/dbname?sslmode=require"

# SQLModel engine configuration
from sqlmodel import create_engine

engine = create_engine(
    DATABASE_URL,
    echo=True,                # Log SQL (disable in production)
    pool_pre_ping=True,       # Verify connections before using
    pool_size=5,              # Number of connections to maintain
    max_overflow=10,          # Additional connections when pool is full
    pool_recycle=3600,        # Recycle connections after 1 hour
)
```

**Migration Strategy**:
- **Development**: Use `SQLModel.metadata.create_all(engine)` for simplicity
- **Production**: Alembic for version-controlled migrations (optional for Phase II)
- **Justification**: `create_all()` is sufficient for Phase II; Alembic adds complexity better suited for production

**Free Tier Limits**:
- 3 GB storage
- 100 concurrent connections
- Keep connections < 20 with proper pooling

**Alternatives Considered**:
- **PostgreSQL (self-hosted)**: Too complex for hackathon
- **SQLite**: No multi-user support, not production-ready
- **MySQL**: Less feature-rich than PostgreSQL
- **MongoDB**: Document DB not ideal for relational data

---

## 2. Authentication: Better Auth Integration

### Decision: Better Auth (Frontend) + JWT Verification (Backend)

**Rationale**:
- Better Auth is a TypeScript library for Next.js authentication
- Frontend uses Better Auth for user registration/login UI
- Backend verifies JWT tokens issued by Better Auth
- Stateless architecture with shared BETTER_AUTH_SECRET
- User ID validation: URL user_id must match JWT user_id

**Implementation Pattern**:

**Frontend (Better Auth)**:
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth/client";

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [/* JWT plugin */]
});

// Usage in components
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123"
});

await authClient.signIn.email({
  email: "user@example.com",
  password: "password123"
});
```

**Backend (JWT Verification)**:
```python
# app/utils/jwt.py
from jose import jwt, JWTError
from fastapi import HTTPException, Header

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")  # Shared with frontend
ALGORITHM = "HS256"

def verify_token(token: str) -> dict:
    """Verify JWT token issued by Better Auth"""
    try:
        payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(authorization: str = Header(...)):
    """Extract and verify user from Authorization header"""
    scheme, token = authorization.split()
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    return verify_token(token)

def validate_user_id_match(url_user_id: str, jwt_user_id: str):
    """Ensure URL user_id matches JWT token user_id"""
    if url_user_id != jwt_user_id:
        raise HTTPException(status_code=403, detail="User ID mismatch")
```

**Session Management**:
- Better Auth manages user sessions and issues JWT tokens
- Tokens expire after configured period (e.g., 30 minutes or 7 days)
- Frontend stores tokens (Better Auth handles storage automatically)
- Backend receives token via Authorization header: `Bearer <token>`
- Stateless: No server-side session storage required

**Security Measures**:
- Better Auth handles password hashing with bcrypt
- JWT tokens signed with BETTER_AUTH_SECRET (shared between frontend and backend)
- HTTPS only in production
- URL validation: user_id in path must match JWT user_id
- All task endpoints require authentication

**Better Auth Configuration**:
- Environment variable: `BETTER_AUTH_SECRET` (must be same in frontend and backend)
- JWT plugin enabled for token-based auth
- Email/password authentication provider

---

## 3. FastAPI + SQLModel Integration

### Decision: Use SQLModel with FastAPI Dependency Injection

**Rationale**:
- SQLModel combines Pydantic (validation) + SQLAlchemy (ORM)
- Type-safe models work seamlessly with FastAPI
- Dependency injection cleanly manages database sessions
- Excellent for testability (mock database sessions)

**Integration Pattern**:

```python
# app/database.py
from sqlmodel import create_engine, Session

engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

# app/routers/tasks.py
from fastapi import Depends
from sqlmodel import Session

@router.get("/tasks")
def get_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    tasks = session.exec(
        select(Task).where(Task.user_id == current_user.id)
    ).all()
    return tasks
```

**Async vs Sync**:
- **Decision**: Use **sync** operations for Phase II
- **Rationale**: Simpler code, easier testing, sufficient performance for < 1000 users
- **Note**: FastAPI supports both; can migrate to async later if needed

**Transaction Management**:
```python
with Session(engine) as session:
    # Operations
    session.commit()  # Explicit commit
    # Auto-rollback on exception
```

**Error Handling**:
```python
from sqlmodel.exc import NoResultFound
from fastapi import HTTPException

try:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
except Exception as e:
    raise HTTPException(status_code=500, detail="Database error")
```

**Alternatives Considered**:
- **Tortoise ORM**: Less mature, smaller community
- **SQLAlchemy alone**: More boilerplate than SQLModel
- **Raw SQL**: Error-prone, no type safety
- **Django ORM**: Requires Django (too heavy)

---

## 4. Next.js 16+ App Router Patterns

### Decision: Use App Router with Server/Client Components + Better Auth

**Rationale**:
- App Router is the recommended approach (Next.js 13+)
- Next.js 16+ includes latest performance optimizations
- Server components reduce JavaScript sent to client
- Client components for interactivity (forms, state, authentication)
- Route groups for clean organization
- Better Auth integration for user authentication

**Component Strategy**:

**Server Components** (default):
```typescript
// app/page.tsx - Static content, no interactivity
export default function HomePage() {
  return <h1>Welcome to Todo App</h1>;
}
```

**Client Components** (interactive):
```typescript
// components/TaskList.tsx - Uses hooks, state
'use client';

import { useState } from 'react';

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  // ... interactive logic
}
```

**Route Organization**:
```
app/
├── (auth)/          # Route group (no /auth in URL)
│   ├── login/
│   └── register/
└── (app)/           # Protected routes
    └── dashboard/
```

**State Management**:
- **Decision**: Use **React Context** for global state
- **Rationale**: Simple, built-in, sufficient for Phase II
- **Pattern**: AuthContext for user state, no need for Redux/Zustand

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // ... auth logic
  return <AuthContext.Provider value={{user, ...}}>{children}</AuthContext.Provider>;
}
```

**API Client Setup**:
```typescript
// lib/api.ts
class ApiClient {
  private token: string | null = null;

  async request(endpoint: string, options?: RequestInit) {
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) throw new Error('Request failed');
    return response.json();
  }
}
```

**Alternatives Considered**:
- **Pages Router**: Older approach, less efficient
- **Remix**: Different framework, steeper learning curve
- **Create React App**: No SSR, worse performance
- **Zustand/Redux**: Overkill for Phase II state needs

---

## 5. Testing Strategy

### Decision: Pytest (Backend) + Jest (Frontend)

**Backend Testing (Pytest)**:

**Test Database**:
```python
# tests/conftest.py
import pytest
from sqlmodel import create_engine, Session, SQLModel
from sqlmodel.pool import StaticPool

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite:///:memory:",  # In-memory for speed
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
```

**API Testing**:
```python
# tests/test_tasks.py
from fastapi.testclient import TestClient

def test_create_task(client: TestClient, auth_headers, user_id: str):
    response = client.post(
        f"/api/{user_id}/tasks",
        json={"title": "Test Task"},
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
```

**Frontend Testing (Jest + React Testing Library)**:

**Component Testing**:
```typescript
// __tests__/TaskCard.test.tsx
import { render, screen } from '@testing-library/react';
import { TaskCard } from '@/components/tasks/TaskCard';

test('renders task title', () => {
  const task = { id: 1, title: 'Test Task', completed: false };
  render(<TaskCard task={task} onToggle={() => {}} />);
  expect(screen.getByText('Test Task')).toBeInTheDocument();
});
```

**Hook Testing**:
```typescript
// __tests__/useAuth.test.ts
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

test('login sets user', async () => {
  const { result } = renderHook(() => useAuth());
  await result.current.login('test@example.com', 'password');
  expect(result.current.user).toBeDefined();
});
```

**Coverage Goals**:
- Backend: 80%+ coverage for business logic
- Frontend: 70%+ for components and hooks
- Critical paths: 100% (auth, CRUD operations)

**E2E Testing**:
- **Decision**: Skip E2E for Phase II
- **Rationale**: Unit + integration tests sufficient for MVP
- **Future**: Add Playwright/Cypress in Phase III

**Alternatives Considered**:
- **Unittest (Python)**: Pytest is more powerful and popular
- **Vitest (Frontend)**: Jest is more established
- **E2E from start**: Too time-consuming for hackathon

---

## 6. Deployment Architecture

### Decision: Vercel (Frontend) + Railway (Backend)

**Frontend: Vercel**
- **Rationale**: Best Next.js hosting (made by Vercel)
- **Features**: Automatic deployments, edge functions, free tier
- **Setup**: Connect GitHub repo, auto-deploy on push

**Backend: Railway**
- **Rationale**: Simple Python hosting, free tier, Postgres support
- **Alternatives**: Render (similar), Fly.io (more complex)
- **Setup**: Deploy from GitHub, add DATABASE_URL env var

**Environment Variables**:

**Backend** (.env):
```bash
DATABASE_URL=postgresql://...@neon.tech/dbname
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend** (.env.local):
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**CORS Configuration**:
```python
# app/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("ALLOWED_ORIGINS")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Deployment Workflow**:
1. Push to GitHub (branch: main)
2. Vercel auto-deploys frontend
3. Railway auto-deploys backend
4. Database on Neon (always available)

**Alternatives Considered**:
- **Netlify**: Good for frontend, less for full-stack
- **Heroku**: Deprecated free tier
- **AWS/GCP**: Too complex for hackathon
- **Docker + VPS**: Manual setup overhead

---

## Technology Stack Summary

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Backend Framework** | FastAPI | Fast, modern, excellent docs, type-safe |
| **Backend Language** | Python 3.13+ | Phase I compatibility, rich ecosystem |
| **ORM** | SQLModel | Type-safe, Pydantic integration |
| **Database** | Neon PostgreSQL | Serverless, free tier, production-ready |
| **Auth (Frontend)** | Better Auth | TypeScript-first, JWT tokens, Next.js integration |
| **Auth (Backend)** | JWT verification | Verify Better Auth tokens, bcrypt hashing |
| **Frontend Framework** | Next.js 16+ | SSR, App Router, latest optimizations |
| **Frontend Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Utility-first, fast development |
| **State** | React Context | Simple, built-in, sufficient |
| **Testing (Backend)** | Pytest | Most popular Python testing framework |
| **Testing (Frontend)** | Jest + RTL | React testing standard |
| **Deployment (Frontend)** | Vercel | Best for Next.js |
| **Deployment (Backend)** | Railway | Simple Python deployment |

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Neon connection limits | Medium | High | Connection pooling, max 20 connections |
| JWT security breach | Low | Critical | Short expiration, HTTPS only, secure storage |
| CORS issues | Medium | Medium | Proper middleware config, test early |
| Database schema changes | Medium | Medium | Use migrations (Alembic if needed) |
| Frontend bundle size | Low | Low | Code splitting, lazy loading |

---

## Open Questions Resolved

✅ **Database**: Neon PostgreSQL (serverless, free tier)
✅ **Auth**: Better Auth (frontend) + JWT verification (backend), bcrypt hashing
✅ **State Management**: React Context (simple, sufficient)
✅ **Testing**: Pytest + Jest (industry standards)
✅ **Deployment**: Vercel + Railway (free tiers, auto-deploy)
✅ **Migrations**: SQLModel.create_all() for Phase II (Alembic optional)

---

**Status**: ✅ All research complete
**Next Phase**: Phase 1 - Design data models and API contracts
