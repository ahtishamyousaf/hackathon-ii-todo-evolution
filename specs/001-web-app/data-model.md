# Phase 1: Data Model

**Feature**: Web-Based Todo Application
**Date**: 2025-12-14
**ORM**: SQLModel (Pydantic + SQLAlchemy)
**Database**: Neon PostgreSQL

---

## Overview

This document defines the database schema for the web-based todo application. The schema consists of 2 main entities: **User** and **Task**, with a one-to-many relationship.

**Design Principles**:
- Normalized to 3NF (Third Normal Form)
- Indexed for query performance
- Type-safe with SQLModel
- Timestamps for audit trail
- Cascade delete for data integrity

---

## Entity Relationship Diagram

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ id (PK)            │◄─────┐
│ email (UNIQUE)     │      │
│ password_hash      │      │
│ created_at         │      │
└─────────────────────┘      │
                             │ 1:N
                             │
                    ┌────────┴────────┐
                    │      Task       │
                    ├─────────────────┤
                    │ id (PK)        │
                    │ user_id (FK)   │
                    │ title          │
                    │ description    │
                    │ completed      │
                    │ created_at     │
                    │ updated_at     │
                    └─────────────────┘
```

---

## Entities

### 1. User

**Purpose**: Represents a registered user account

**Table Name**: `users`

**SQLModel Definition**:

```python
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    """
    User account model for authentication and task ownership.
    """
    __tablename__ = "users"

    # Primary Key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Credentials
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address (used for login)"
    )
    password_hash: str = Field(
        max_length=255,
        description="Bcrypt hashed password (never store plain text)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )

    # Relationships
    tasks: list["Task"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
```

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| `email` | String(255) | UNIQUE, NOT NULL, INDEXED | Login email address |
| `password_hash` | String(255) | NOT NULL | Bcrypt hashed password |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW | Account creation time |

**Indexes**:
- `PRIMARY KEY (id)` - Clustered index
- `UNIQUE INDEX idx_users_email ON users(email)` - Fast email lookups for login

**Validation Rules**:
- Email must be valid format (regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
- Password must be hashed with bcrypt (minimum 8 characters before hashing)
- Email is case-insensitive (convert to lowercase before storage)

**Security**:
- Never expose `password_hash` in API responses
- Use Pydantic response models to exclude sensitive fields

**Better Auth Integration**:
- Frontend uses Better Auth (TypeScript) for user authentication UI
- Better Auth issues JWT tokens upon successful login/registration
- Backend receives and verifies JWT tokens using shared `BETTER_AUTH_SECRET`
- User table may be managed by Better Auth or custom FastAPI endpoints
- JWT token contains user_id, which must match {user_id} in API endpoint URLs

---

### 2. Task

**Purpose**: Represents a single todo item belonging to a user

**Table Name**: `tasks`

**SQLModel Definition**:

```python
from sqlmodel import Field, SQLModel, Relationship
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    """
    Task model for user's todo items.
    """
    __tablename__ = "tasks"

    # Primary Key
    id: Optional[int] = Field(default=None, primary_key=True)

    # Foreign Key
    user_id: int = Field(
        foreign_key="users.id",
        index=True,
        ondelete="CASCADE",
        description="Owner of this task"
    )

    # Content
    title: str = Field(
        min_length=1,
        max_length=200,
        description="Task title (required)"
    )
    description: str = Field(
        default="",
        max_length=1000,
        description="Optional detailed description"
    )

    # Status
    completed: bool = Field(
        default=False,
        index=True,
        description="Completion status"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        index=True,
        description="Task creation time"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Last update time"
    )

    # Relationships
    user: Optional[User] = Relationship(back_populates="tasks")
```

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| `user_id` | Integer | FOREIGN KEY(users.id), NOT NULL, INDEXED | Task owner |
| `title` | String(200) | NOT NULL, MIN 1 char | Task title |
| `description` | String(1000) | DEFAULT '' | Optional description |
| `completed` | Boolean | NOT NULL, DEFAULT FALSE, INDEXED | Completion status |
| `created_at` | DateTime | NOT NULL, DEFAULT NOW, INDEXED | Creation timestamp |
| `updated_at` | DateTime | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes**:
- `PRIMARY KEY (id)` - Clustered index
- `INDEX idx_tasks_user_id ON tasks(user_id)` - Fast user task queries
- `INDEX idx_tasks_completed ON tasks(completed)` - Filtering by status
- `INDEX idx_tasks_created_at ON tasks(created_at)` - Sorting by date

**Constraints**:
- `FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE` - Delete tasks when user deleted
- `CHECK (length(title) >= 1)` - Title cannot be empty
- `CHECK (length(title) <= 200)` - Title max length
- `CHECK (length(description) <= 1000)` - Description max length

**Validation Rules**:
- Title must be non-empty (after trimming whitespace)
- Title maximum 200 characters
- Description maximum 1000 characters
- User must own task to update/delete

---

## Relationships

### User → Tasks (One-to-Many)

**Relationship Type**: One user has many tasks

**SQLModel Configuration**:
```python
# In User model
tasks: list["Task"] = Relationship(
    back_populates="user",
    sa_relationship_kwargs={"cascade": "all, delete-orphan"}
)

# In Task model
user: Optional[User] = Relationship(back_populates="tasks")
```

**Cascade Behavior**:
- **On User Delete**: All associated tasks are automatically deleted (CASCADE)
- **On Task Delete**: No effect on user
- **On User Update**: Task `user_id` updated if user `id` changes (rare)

**Query Examples**:

```python
# Get all tasks for a user
user = session.get(User, user_id)
user_tasks = user.tasks  # SQLModel relationship

# Or with query
from sqlmodel import select

tasks = session.exec(
    select(Task).where(Task.user_id == user_id)
).all()

# Get user from task
task = session.get(Task, task_id)
task_owner = task.user  # SQLModel relationship
```

---

## Database Schema (DDL)

**PostgreSQL Schema** (Auto-generated by SQLModel):

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NOT NULL DEFAULT '',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

---

## Pydantic Schemas (DTOs)

**Request Schemas** (for API input):

```python
from pydantic import BaseModel, EmailStr, Field

# User schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Task schemas
class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)

class TaskUpdate(BaseModel):
    title: str | None = Field(None, max_length=200)
    description: str | None = Field(None, max_length=1000)
```

**Response Schemas** (for API output):

```python
from datetime import datetime

# User response (never expose password_hash)
class UserResponse(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

# Task response
class TaskResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

---

## Migration Strategy

### Development (Phase II)

**Approach**: Use `SQLModel.metadata.create_all(engine)`

```python
# app/main.py
from sqlmodel import SQLModel
from app.database import engine

@app.on_event("startup")
def create_tables():
    SQLModel.metadata.create_all(engine)
```

**Pros**:
- Simple, no migration files
- Fast for development
- Good for Phase II MVP

**Cons**:
- No version control for schema changes
- Cannot rollback schema changes
- Not recommended for production

### Production (Future)

**Approach**: Use Alembic for versioned migrations

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add users and tasks tables"

# Apply migration
alembic upgrade head
```

**When to switch**: Before Phase III or when schema becomes complex

---

## Query Performance Optimization

### Recommended Indexes

All indexes are already defined in the SQLModel models:

1. **users.email** (UNIQUE INDEX) - Login queries
2. **tasks.user_id** (INDEX) - List user's tasks
3. **tasks.completed** (INDEX) - Filter by status
4. **tasks.created_at** (INDEX) - Sort by date

### Common Queries

**Get all pending tasks for a user** (sorted by creation date):
```python
from sqlmodel import select

tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id, Task.completed == False)
    .order_by(Task.created_at.desc())
).all()
```

**Search tasks by keyword**:
```python
tasks = session.exec(
    select(Task)
    .where(
        Task.user_id == user_id,
        Task.title.contains(search_query)  # Or use ILIKE for case-insensitive
    )
).all()
```

**Pagination**:
```python
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .order_by(Task.created_at.desc())
    .offset(skip)
    .limit(limit)
).all()
```

---

## Data Integrity

### Constraints

1. **Email Uniqueness**: Enforced by UNIQUE constraint
2. **Task Ownership**: Foreign key ensures task belongs to valid user
3. **Cascade Delete**: Tasks deleted when user deleted
4. **Non-null Fields**: Database rejects NULL for required fields
5. **Length Limits**: Database enforces max lengths

### Application-Level Validation

```python
# Email validation (Pydantic)
email: EmailStr  # Validates email format

# Password strength (custom validator)
@validator('password')
def password_strength(cls, v):
    if len(v) < 8:
        raise ValueError('Password must be at least 8 characters')
    if not any(c.isupper() for c in v):
        raise ValueError('Password must contain uppercase')
    if not any(c.isdigit() for c in v):
        raise ValueError('Password must contain number')
    return v

# Task title validation
@validator('title')
def title_not_empty(cls, v):
    if not v.strip():
        raise ValueError('Title cannot be empty')
    return v.strip()
```

---

## Security Considerations

1. **Password Storage**: Always hash with bcrypt (never plain text)
2. **SQL Injection**: SQLModel uses parameterized queries (ORM prevents injection)
3. **User Isolation**: All queries filter by `user_id` (users cannot access others' tasks)
4. **Sensitive Data**: Never expose `password_hash` in API responses

---

## Sample Data (for development/testing)

```python
# Create sample users
user1 = User(email="alice@example.com", password_hash="$2b$12$...")
user2 = User(email="bob@example.com", password_hash="$2b$12$...")

session.add_all([user1, user2])
session.commit()

# Create sample tasks
task1 = Task(user_id=user1.id, title="Buy groceries", description="Milk, eggs, bread")
task2 = Task(user_id=user1.id, title="Write report", completed=True)
task3 = Task(user_id=user2.id, title="Call dentist")

session.add_all([task1, task2, task3])
session.commit()
```

---

**Status**: ✅ Data model complete
**Next**: Generate API contracts (OpenAPI specification)
