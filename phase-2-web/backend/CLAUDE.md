# Backend Development Guidelines

**Phase II - FastAPI Application**

> **CRITICAL**: Read `/AGENTS.md` and `/phase-2-web/constitution.md` FIRST before making any changes.

---

## Stack

- **Framework**: FastAPI 0.110+
- **Language**: Python 3.13+
- **ORM**: SQLModel (NOT raw SQLAlchemy)
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: JWT token verification (tokens issued by Better Auth)
- **Validation**: Pydantic v2
- **ASGI Server**: Uvicorn

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── database.py          # Database connection & session
│   ├── dependencies/        # Dependency injection
│   │   └── auth.py          # JWT verification, get_current_user
│   ├── models/              # SQLModel database models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── task.py
│   │   ├── category.py
│   │   ├── subtask.py
│   │   ├── comment.py
│   │   ├── attachment.py
│   │   └── task_dependency.py
│   ├── routers/             # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── tasks.py         # Task CRUD
│   │   ├── categories.py    # Category management
│   │   ├── subtasks.py      # Subtask operations
│   │   └── search.py        # Advanced search
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── task.py
│   │   ├── category.py
│   │   ├── bulk.py
│   │   └── search.py
│   ├── services/            # Business logic layer
│   │   └── search_service.py
│   └── utils/               # Utility functions
│       ├── password.py      # Password hashing/verification
│       └── query_builder.py # Advanced query construction
├── migrations/              # SQL migration files
│   ├── 001_create_users.sql
│   ├── 002_create_tasks.sql
│   └── ...
├── pyproject.toml          # Python dependencies (Poetry)
└── requirements.txt        # pip dependencies
```

---

## Coding Patterns

### 1. Database Models (SQLModel)

```python
# models/task.py
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime

class Task(SQLModel, table=True):
    """
    Task model representing a user's todo item.

    User Stories: US-001 (Create), US-002 (View), US-003 (Update),
                  US-004 (Toggle), US-005 (Delete)
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, index=True)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False, index=True)
    priority: str = Field(default="medium", max_length=10)  # low, medium, high
    due_date: Optional[datetime] = Field(default=None, index=True)
    sort_order: Optional[int] = Field(default=None, index=True)

    # Foreign keys
    user_id: str = Field(foreign_key="users.id", index=True)
    category_id: Optional[int] = Field(
        default=None,
        foreign_key="categories.id",
        ondelete="SET NULL"  # Preserve task when category deleted
    )

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships (for joins, NOT for serialization)
    # category: Optional["Category"] = Relationship(back_populates="tasks")
```

**Rules**:
- ✅ Use `SQLModel` (NOT `Base` from SQLAlchemy)
- ✅ Set `table=True` for database models
- ✅ Use `Field()` for column configuration (indexes, foreign keys, defaults)
- ✅ Add docstrings referencing User Stories
- ✅ Use `Optional[T]` for nullable fields
- ✅ Index frequently queried columns (`user_id`, `completed`, `due_date`)
- ✅ Use `ondelete="SET NULL"` for soft dependencies (categories)
- ✅ Use `ondelete="CASCADE"` for hard dependencies (user deletion)

### 2. Pydantic Schemas (Request/Response)

```python
# schemas/task.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime

class TaskCreate(BaseModel):
    """Request schema for creating a task."""
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title cannot be empty or whitespace")
        return v.strip()

class TaskUpdate(BaseModel):
    """Request schema for updating a task (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, pattern="^(low|medium|high)$")
    due_date: Optional[datetime] = None
    category_id: Optional[int] = None

class TaskResponse(BaseModel):
    """Response schema for task (matches database model)."""
    id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    due_date: Optional[datetime]
    sort_order: Optional[int]
    category_id: Optional[int]
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}  # Pydantic v2
```

**Rules**:
- ✅ Separate Create/Update/Response schemas
- ✅ Use `Field()` for validation (min_length, max_length, pattern)
- ✅ Use `@field_validator` for custom validation
- ✅ Set `model_config = {"from_attributes": True}` for ORM mode
- ❌ DON'T include `user_id` in Create/Update schemas (comes from JWT)

### 3. API Endpoints (FastAPI Routers)

```python
# routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from app.database import get_session
from app.dependencies.auth import get_current_user
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Task:
    """
    Create a new task for the authenticated user.

    User Story: US-001 (Create Task)
    Acceptance Criteria:
    - AC-1.1: Task created with title, description, priority
    - AC-1.2: User ID extracted from JWT token (NOT from request body)
    - AC-1.3: Returns 201 Created with task details
    """
    # Create task with user_id from JWT token (CRITICAL SECURITY)
    task = Task(
        **task_data.model_dump(exclude_unset=True),
        user_id=current_user  # From JWT, NOT from request
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    completed: Optional[bool] = None,
    category_id: Optional[int] = None,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[Task]:
    """
    List all tasks for the authenticated user with optional filters.

    User Story: US-002 (View Tasks)
    Acceptance Criteria:
    - AC-2.1: Returns only tasks belonging to authenticated user
    - AC-2.2: Supports filtering by completed status
    - AC-2.3: Supports filtering by category
    """
    # Build query with user isolation (CRITICAL SECURITY)
    query = select(Task).where(Task.user_id == current_user)

    # Apply filters
    if completed is not None:
        query = query.where(Task.completed == completed)
    if category_id is not None:
        query = query.where(Task.category_id == category_id)

    # Execute query
    tasks = session.exec(query).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Task:
    """Get a single task by ID (must belong to authenticated user)."""
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    # User isolation check (CRITICAL SECURITY)
    if task.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Task:
    """
    Update a task (must belong to authenticated user).

    User Story: US-003 (Update Task)
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    # User isolation check
    if task.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> None:
    """
    Delete a task (must belong to authenticated user).

    User Story: US-005 (Delete Task)
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found"
        )

    # User isolation check
    if task.user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    session.delete(task)
    session.commit()
```

**Rules**:
- ✅ Use `APIRouter` with prefix and tags
- ✅ Type hint all parameters and return values
- ✅ Use `Depends(get_current_user)` for authentication
- ✅ Use `Depends(get_session)` for database access
- ✅ ALWAYS check `user_id == current_user` for authorization
- ✅ Use appropriate HTTP status codes (201, 404, 403, 204)
- ✅ Raise `HTTPException` with descriptive messages
- ✅ Add docstrings referencing User Stories and Acceptance Criteria
- ❌ NEVER allow user_id in request body (security vulnerability)

### 4. JWT Authentication

```python
# dependencies/auth.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from jose import jwt, JWTError
import os

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security)
) -> str:
    """
    Extract and verify JWT token from Authorization header.

    Returns user_id (sub claim) from validated token.

    Raises:
        HTTPException 401: If token is missing, invalid, or expired
    """
    token = credentials.credentials
    secret_key = os.getenv("BETTER_AUTH_SECRET")

    if not secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication configuration error"
        )

    try:
        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            secret_key,
            algorithms=["HS256"]
        )

        # Extract user_id from 'sub' claim
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )

        return user_id

    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
```

**Rules**:
- ✅ Use `HTTPBearer()` for token extraction
- ✅ Use `python-jose` for JWT decoding (NOT PyJWT)
- ✅ Verify token with `BETTER_AUTH_SECRET` environment variable
- ✅ Extract `user_id` from `sub` claim
- ✅ Raise 401 for invalid/expired tokens
- ✅ Raise 500 for configuration errors

### 5. Database Session Management

```python
# database.py
from sqlmodel import Session, create_engine
from typing import Generator
import os

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging
    pool_pre_ping=True,  # Verify connections before use
    pool_size=10,
    max_overflow=20
)

def get_session() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.

    Automatically commits on success, rolls back on error.
    """
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
```

**Rules**:
- ✅ Use `create_engine()` with connection pooling
- ✅ Set `pool_pre_ping=True` for Neon serverless
- ✅ Use context manager (`with Session()`) for auto-cleanup
- ✅ Commit on success, rollback on error
- ✅ Use `yield` for dependency injection

### 6. Error Handling

```python
# Example: Comprehensive error handling
from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from pydantic import ValidationError

@router.post("/categories", response_model=CategoryResponse)
async def create_category(
    category_data: CategoryCreate,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> Category:
    try:
        category = Category(
            **category_data.model_dump(),
            user_id=current_user
        )

        session.add(category)
        session.commit()
        session.refresh(category)

        return category

    except IntegrityError as e:
        session.rollback()

        # Check for unique constraint violation
        if "unique_category_per_user" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Category '{category_data.name}' already exists"
            )

        # Generic database error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category"
        )

    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
```

**Rules**:
- ✅ Catch specific exceptions (`IntegrityError`, `ValidationError`)
- ✅ Rollback transaction on error
- ✅ Return user-friendly error messages
- ✅ Use appropriate HTTP status codes:
  - 400: Bad Request (invalid input)
  - 401: Unauthorized (missing/invalid token)
  - 403: Forbidden (user not authorized)
  - 404: Not Found (resource doesn't exist)
  - 409: Conflict (unique constraint violation)
  - 422: Unprocessable Entity (validation error)
  - 500: Internal Server Error (unexpected error)

---

## Environment Variables

```bash
# .env (backend)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
BETTER_AUTH_SECRET=your-secret-here-min-32-chars
SECRET_KEY=your-fastapi-secret-here
```

**Access in Code**:

```python
import os

DATABASE_URL = os.getenv("DATABASE_URL")
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")

# With default fallback
DEBUG = os.getenv("DEBUG", "False") == "True"
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Allow user_id in Request Body

```python
# ❌ WRONG - Security vulnerability
class TaskCreate(BaseModel):
    title: str
    user_id: str  # User can impersonate others!

@router.post("/tasks")
async def create_task(task_data: TaskCreate):
    task = Task(**task_data.model_dump())  # Uses user-provided user_id!
```

```python
# ✅ CORRECT - Extract from JWT token
class TaskCreate(BaseModel):
    title: str
    # NO user_id field

@router.post("/tasks")
async def create_task(
    task_data: TaskCreate,
    current_user: str = Depends(get_current_user)  # From JWT
):
    task = Task(
        **task_data.model_dump(),
        user_id=current_user  # From authenticated token
    )
```

### ❌ DON'T: Skip User Isolation Checks

```python
# ❌ WRONG - Returns any user's task
@router.get("/tasks/{task_id}")
async def get_task(task_id: int, session: Session = Depends(get_session)):
    task = session.get(Task, task_id)
    return task  # Leaks other users' data!
```

```python
# ✅ CORRECT - Verify ownership
@router.get("/tasks/{task_id}")
async def get_task(
    task_id: int,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != current_user:  # Check ownership
        raise HTTPException(status_code=403, detail="Not authorized")

    return task
```

### ❌ DON'T: Use Raw SQLAlchemy Models

```python
# ❌ WRONG - SQLAlchemy Base
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
```

```python
# ✅ CORRECT - SQLModel
from sqlmodel import SQLModel, Field

class Task(SQLModel, table=True):
    __tablename__ = "tasks"
```

### ❌ DON'T: Forget to Update `updated_at`

```python
# ❌ WRONG - Timestamp never updates
@router.put("/tasks/{task_id}")
async def update_task(task_id: int, task_data: TaskUpdate, ...):
    # ... update fields ...
    session.commit()
```

```python
# ✅ CORRECT - Always update timestamp
from datetime import datetime

@router.put("/tasks/{task_id}")
async def update_task(task_id: int, task_data: TaskUpdate, ...):
    # ... update fields ...
    task.updated_at = datetime.utcnow()
    session.commit()
```

---

## Development Commands

```bash
# Install dependencies
pip install -r requirements.txt
# OR with Poetry:
poetry install

# Run development server
uvicorn app.main:app --reload --port 8000

# Run database migrations
python run_migration.py

# Type checking (recommended)
mypy app/

# Code formatting
black app/
isort app/

# Linting
flake8 app/
pylint app/
```

---

## Testing Checklist

Before committing backend changes:

- [ ] All endpoints require authentication (`Depends(get_current_user)`)
- [ ] User isolation checks in place (`task.user_id == current_user`)
- [ ] Type hints on all functions
- [ ] Pydantic schemas for request/response validation
- [ ] Appropriate HTTP status codes
- [ ] Error handling with user-friendly messages
- [ ] Docstrings reference User Stories
- [ ] Database session properly managed
- [ ] Environment variables loaded correctly
- [ ] No SQL injection vulnerabilities (use SQLModel queries)

---

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)

---

**Remember**: Read `/AGENTS.md` for the spec-driven workflow. Never code without a spec!
