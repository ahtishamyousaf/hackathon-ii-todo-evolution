# Research & Design Decisions: Task Management System

**Feature**: 003-task-crud
**Date**: 2025-12-23
**Purpose**: Document technical research and design decisions for implementation

## Overview

This research phase validates technical approaches for implementing Task CRUD operations in the existing Phase II web application infrastructure. Since authentication and database are already established, research focuses on integration patterns and best practices.

## Research Items

### 1. SQLModel ORM for Task Entity

**Decision**: Use SQLModel with Field validators for Task model

**Rationale**:
- SQLModel already in use for User models (Better Auth integration)
- Type-safe ORM with Pydantic validation built-in
- Automatic SQLAlchemy model + Pydantic schema generation
- Excellent TypeScript compatibility via OpenAPI

**Alternatives Considered**:
- Raw SQLAlchemy: More verbose, less type safety
- Tortoise ORM: Not compatible with existing stack
- Django ORM: Requires Django framework

**Implementation Pattern**:
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, min_length=1)
    description: Optional[str] = Field(default="", max_length=1000)
    completed: bool = Field(default=False)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### 2. JWT Authentication Middleware for FastAPI

**Decision**: Use existing `get_current_user` dependency from `app/dependencies/auth.py`

**Rationale**:
- Authentication infrastructure already implemented
- JWT token validation working with Better Auth
- FastAPI dependency injection pattern established
- Ensures user isolation automatically

**Alternatives Considered**:
- Custom middleware: Reinventing the wheel
- Session-based auth: Better Auth uses JWT
- API keys: Less secure, not compatible with Better Auth

**Implementation Pattern**:
```python
from app.dependencies.auth import get_current_user

@router.get("/api/tasks")
async def get_tasks(user: User = Depends(get_current_user), db: Session = Depends(get_session)):
    tasks = db.exec(select(Task).where(Task.user_id == user.id)).all()
    return tasks
```

---

### 3. Frontend State Management for Tasks

**Decision**: Use React useState + API calls (no global state management yet)

**Rationale**:
- MVP scope is limited to 5 basic features
- Tasks are user-specific (no cross-component sharing needed)
- React Context already in use for auth (established pattern)
- Can upgrade to Zustand/Redux later if needed

**Alternatives Considered**:
- Redux: Overkill for MVP, adds complexity
- Zustand: Good for future, unnecessary now
- React Context: Good for global state, not needed for tasks
- TanStack Query: Excellent caching, defer to Phase III

**Implementation Pattern**:
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchTasks = async () => {
    const data = await api.getTasks();
    setTasks(data);
    setLoading(false);
  };
  fetchTasks();
}, []);
```

---

### 4. API Client Extension Pattern

**Decision**: Extend existing `lib/api.ts` with task-specific methods

**Rationale**:
- Centralized API logic (single source of truth)
- JWT token handling already implemented
- Error handling patterns established
- Type-safe with TypeScript

**Alternatives Considered**:
- Inline fetch calls: Duplicates auth logic
- Separate task API client: Breaks existing pattern
- GraphQL: Not compatible with FastAPI backend

**Implementation Pattern**:
```typescript
// Extend existing api.ts
export const api = {
  // ... existing auth methods ...

  // Task operations
  getTasks: async (): Promise<Task[]> => {
    return fetchWithAuth('/api/tasks');
  },

  createTask: async (data: TaskCreate): Promise<Task> => {
    return fetchWithAuth('/api/tasks', { method: 'POST', body: JSON.stringify(data) });
  },

  updateTask: async (id: number, data: TaskUpdate): Promise<Task> => {
    return fetchWithAuth(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteTask: async (id: number): Promise<void> => {
    return fetchWithAuth(`/api/tasks/${id}`, { method: 'DELETE' });
  },

  toggleComplete: async (id: number): Promise<Task> => {
    return fetchWithAuth(`/api/tasks/${id}/complete`, { method: 'PATCH' });
  },
};
```

---

### 5. Database Migration Strategy

**Decision**: Use manual SQL migration for MVP (add migrations/ directory for future)

**Rationale**:
- Single table addition (Task)
- SQLModel can create table automatically via `SQLModel.metadata.create_all()`
- Formal migrations (Alembic) in Phase III when schema changes are frequent
- Keeps MVP simple and fast

**Alternatives Considered**:
- Alembic migrations: Best practice, but overkill for single table
- SQLModel CLI migrations: Experimental feature, not production-ready
- Django migrations: Requires Django

**Implementation Approach**:
1. Development: `SQLModel.metadata.create_all(engine)` in `database.py`
2. Production: Manual SQL CREATE TABLE statement in deployment
3. Future: Migrate to Alembic in Phase III

---

### 6. Component Architecture Pattern

**Decision**: Container/Presentation pattern with composition

**Rationale**:
- TaskList (container) manages state and API calls
- TaskItem (presentation) displays single task
- TaskForm (presentation/container) handles create/edit
- Clear separation of concerns
- Easy to test and maintain

**Alternatives Considered**:
- Monolithic component: Hard to maintain
- Atomic design: Over-engineering for MVP
- Feature-based: Premature optimization

**Component Structure**:
```
TaskList.tsx (container)
├── TaskForm.tsx (modal for create/edit)
└── TaskItem.tsx (presentation)
    ├── Checkbox (complete toggle)
    ├── Title + Description
    └── Actions (edit, delete buttons)
```

---

## Summary of Decisions

| Decision Area | Choice | Primary Reason |
|--------------|--------|----------------|
| Backend ORM | SQLModel | Type safety + existing stack |
| Authentication | Existing JWT dependency | Already implemented |
| Frontend State | Local useState | MVP scope, simple |
| API Client | Extend lib/api.ts | Centralized pattern |
| Migrations | Manual/Auto for MVP | Single table, simple |
| Components | Container/Presentation | Clear separation |

## Open Questions

None. All technical approaches validated against existing infrastructure and MVP requirements.

## Next Steps

1. Create data-model.md with Task entity definition
2. Generate API contracts in /contracts/ directory
3. Create quickstart.md with setup and testing instructions
4. Update CLAUDE.md with task-specific patterns
5. Proceed to /sp.tasks for implementation breakdown
