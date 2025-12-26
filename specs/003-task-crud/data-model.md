# Data Model: Task Management System

**Feature**: 003-task-crud
**Created**: 2025-12-24
**Source**: Derived from [spec.md](./spec.md)

## Overview

This document defines the data entities, relationships, validation rules, and state transitions for the Task Management System. The model supports basic CRUD operations with strict user isolation and data persistence requirements.

## Entities

### Task

**Description**: Represents a single todo item owned by a user.

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | Primary Key, Auto-increment | Unique task identifier |
| title | String | Required, 1-200 chars | Task title (non-empty) |
| description | String | Optional, 0-1000 chars | Detailed task description |
| completed | Boolean | Default: false | Completion status |
| user_id | Integer | Foreign Key → User.id, Required | Owner reference for isolation |
| created_at | DateTime | Auto-set on creation | Timestamp of task creation |
| updated_at | DateTime | Auto-update on modification | Timestamp of last update |

**Validation Rules** (from FR-001, FR-007):
- `title`: MUST NOT be empty, MUST be 1-200 characters
- `description`: MAY be empty, MUST be ≤1000 characters if provided
- `user_id`: MUST reference an existing User (foreign key constraint)
- `completed`: MUST be boolean (true/false)
- `created_at`, `updated_at`: MUST be valid ISO 8601 timestamps

**Indexes** (for performance):
- Primary index on `id`
- Index on `user_id` (for fast user-specific queries)
- Composite index on `(user_id, created_at)` (for ordered task lists)

### User

**Description**: Represents an authenticated user (handled by Better Auth, referenced for task ownership).

**Note**: User entity is managed by Better Auth authentication system. Task entity only references `user_id` for ownership and isolation.

**Relevant Fields** (from Better Auth schema):
- `id`: Integer, Primary Key
- `email`: String (for authentication)
- `name`: String (optional, for display)

## Relationships

### Task → User (Many-to-One)

- **Relationship**: Each Task belongs to exactly one User
- **Foreign Key**: `Task.user_id` → `User.id`
- **Cascade Behavior**:
  - ON DELETE: CASCADE (if user deleted, all their tasks are deleted)
  - ON UPDATE: CASCADE (if user ID changes, task references update)
- **Enforcement**: Database-level foreign key constraint + application-level validation

**Cardinality**:
- One User can have 0..N Tasks
- One Task belongs to exactly 1 User

## State Transitions

### Task Completion Status

```text
┌─────────────┐
│  INCOMPLETE │ (completed = false)
│  (default)  │
└──────┬──────┘
       │
       │ Mark Complete (PATCH /api/tasks/{id}/complete)
       ↓
┌─────────────┐
│  COMPLETED  │ (completed = true)
│             │
└──────┬──────┘
       │
       │ Mark Incomplete (PATCH /api/tasks/{id}/complete - toggle)
       ↓
┌─────────────┐
│  INCOMPLETE │
└─────────────┘
```

**State Rules**:
- Initial state: `completed = false`
- Toggle action: Flips boolean value
- No intermediate states (atomic operation)
- Persists across page refreshes (database-backed)

## Type Definitions

### Backend (SQLModel - Python)

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class TaskBase(SQLModel):
    """Base model for Task (shared fields for create/update)"""
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default="", max_length=1000)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    """Database model for Task entity"""
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationship (optional - for eager loading)
    # user: Optional["User"] = Relationship(back_populates="tasks")

class TaskCreate(TaskBase):
    """Schema for creating new tasks (excludes id, timestamps, user_id)"""
    pass

class TaskUpdate(SQLModel):
    """Schema for updating tasks (all fields optional except id)"""
    title: Optional[str] = Field(default=None, max_length=200, min_length=1)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = Field(default=None)

class TaskRead(TaskBase):
    """Schema for reading tasks (includes id and timestamps)"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
```

### Frontend (TypeScript)

```typescript
/**
 * Task entity (matches backend TaskRead schema)
 */
export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  user_id: number;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

/**
 * Task creation payload (excludes id, timestamps, user_id)
 */
export interface TaskCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

/**
 * Task update payload (all fields optional)
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

/**
 * Task list response
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
}
```

## Data Constraints

### Functional Constraints (from Requirements)

1. **User Isolation** (FR-006):
   - Every query MUST filter by `user_id = current_user.id`
   - Users CANNOT access tasks where `user_id ≠ current_user.id`
   - Enforced at application layer (FastAPI dependency injection)

2. **Title Validation** (FR-001, FR-007):
   - MUST NOT be empty string
   - MUST be 1-200 characters
   - Enforced at: Database (CHECK constraint), ORM (Field validator), API (Pydantic), UI (form validation)

3. **Description Validation** (FR-001):
   - MAY be empty/null
   - MUST be ≤1000 characters if provided
   - Enforced at: Database (CHECK constraint), ORM (Field validator), API (Pydantic)

4. **Persistence** (FR-009):
   - All fields MUST persist to PostgreSQL database
   - Survive application restarts
   - Transaction-based writes (atomic operations)

5. **Timestamps** (FR-010):
   - `created_at`: Set once on creation (immutable)
   - `updated_at`: Auto-update on every modification
   - Timezone: UTC (standard practice)

### Technical Constraints

1. **Database**:
   - PostgreSQL 14+ (Neon Serverless)
   - Table name: `tasks`
   - Schema: Public (default)

2. **Performance**:
   - Index on `user_id` for fast filtering
   - Composite index on `(user_id, created_at)` for ordered lists
   - Expected max rows per user: 100-1000
   - Query time target: <100ms per operation

3. **Concurrency**:
   - Optimistic locking via `updated_at` timestamp
   - Last-write-wins for concurrent updates
   - No explicit row-level locking for MVP

## Migration Strategy

### Initial Schema Creation

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
    description VARCHAR(1000) DEFAULT '',
    completed BOOLEAN DEFAULT false,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### MVP Approach

For Phase II MVP, use SQLModel auto-creation:
```python
# In app/database.py or startup
from sqlmodel import SQLModel, create_engine

SQLModel.metadata.create_all(engine)  # Creates table if not exists
```

**Future Migration**: Migrate to Alembic in Phase III for version-controlled schema changes.

## Example Data

### Sample Task Records

```json
[
  {
    "id": 1,
    "title": "Complete project report",
    "description": "Include Q4 metrics and performance analysis",
    "completed": false,
    "user_id": 42,
    "created_at": "2025-12-24T10:30:00Z",
    "updated_at": "2025-12-24T10:30:00Z"
  },
  {
    "id": 2,
    "title": "Call dentist",
    "description": "",
    "completed": true,
    "user_id": 42,
    "created_at": "2025-12-24T09:15:00Z",
    "updated_at": "2025-12-24T14:20:00Z"
  },
  {
    "id": 3,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, coffee",
    "completed": false,
    "user_id": 42,
    "created_at": "2025-12-24T08:00:00Z",
    "updated_at": "2025-12-24T08:00:00Z"
  }
]
```

## Edge Cases

1. **Empty Description**:
   - Valid: `description = ""` or `description = null`
   - Stored as empty string in database for consistency

2. **Title Whitespace**:
   - Trim whitespace before validation
   - Reject if trimmed length < 1
   - Example: "   " → invalid (becomes empty after trim)

3. **Concurrent Updates**:
   - Last write wins (no conflict resolution)
   - `updated_at` reflects most recent modification
   - Frontend should refetch after update to show latest state

4. **User Deletion**:
   - CASCADE delete removes all user's tasks
   - No orphaned task records
   - Warn user before account deletion

5. **Very Long Content**:
   - Title: Truncate at 200 chars or show validation error
   - Description: Truncate at 1000 chars or show validation error
   - Database enforces via VARCHAR constraints

## Validation Matrix

| Constraint | Database | Backend ORM | API Layer | Frontend |
|------------|----------|-------------|-----------|----------|
| Title required | CHECK | Field(min_length=1) | Pydantic | HTML required |
| Title max 200 | VARCHAR(200) | Field(max_length=200) | Pydantic | maxLength |
| Desc max 1000 | VARCHAR(1000) | Field(max_length=1000) | Pydantic | maxLength |
| User isolation | Foreign Key | Filter clause | Depends(get_current_user) | Auth context |
| Completed bool | BOOLEAN | Field(type=bool) | Pydantic | Checkbox |
| Timestamps | TIMESTAMP | Field(default_factory) | Auto-set | Display only |

**Defense in Depth**: Validation at every layer ensures data integrity even if one layer fails.
