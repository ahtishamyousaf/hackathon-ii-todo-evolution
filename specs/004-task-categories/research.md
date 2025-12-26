# Research: Task Categories System

**Feature**: 004-task-categories
**Date**: 2025-12-24
**Purpose**: Technical research and decision documentation for category system implementation

## Research Questions

### 1. Category Color Management

**Question**: How should we store and validate category colors?

**Decision**: Use hex color codes (7 characters including #) with regex validation

**Rationale**:
- Simple and widely understood format
- Easy to validate with regex pattern: `^#[0-9A-Fa-f]{6}$`
- Direct compatibility with CSS/HTML
- Minimal storage footprint (VARCHAR(7))
- No need for additional color lookup tables

**Alternatives Considered**:
1. **Predefined Color Palette**
   - Pros: Limited choices, easier UX, consistent branding
   - Cons: Less flexible, users may want custom colors
   - Decision: Rejected for MVP, could add as preset option later

2. **RGB Tuples**
   - Pros: Precise color control
   - Cons: More complex storage (3 integers), harder to validate
   - Decision: Rejected - hex is simpler and equivalent

3. **Color Names**
   - Pros: Human-readable ("red", "blue")
   - Cons: Limited palette, inconsistent across browsers
   - Decision: Rejected - hex more flexible

**Implementation**:
```python
# Backend validation
import re
COLOR_PATTERN = r'^#[0-9A-Fa-f]{6}$'

def validate_color(color: str | None) -> str:
    if color is None:
        return '#9CA3AF'  # Default gray
    if not re.match(COLOR_PATTERN, color):
        raise ValueError("Color must be valid hex code (e.g., #FF5733)")
    return color.upper()  # Normalize to uppercase
```

---

### 2. Category-Task Relationship Design

**Question**: How should we model the relationship between categories and tasks?

**Decision**: Optional one-to-many with nullable foreign key + CASCADE SET NULL on delete

**Rationale**:
- Tasks can exist independently without categories (uncategorized state)
- One task belongs to at most one category (single categorization)
- Deleting a category must preserve tasks (set category_id to NULL)
- Simple to implement and query
- Matches user mental model (task can be in one folder)

**Alternatives Considered**:
1. **Many-to-Many Relationship**
   - Pros: Tasks could belong to multiple categories
   - Cons: More complex, junction table needed, doesn't match spec
   - Decision: Rejected - spec explicitly states "assign tasks to categories" (singular)

2. **Required Category (NOT NULL)**
   - Pros: Every task has a category
   - Cons: Forces users to categorize everything, no "uncategorized" state
   - Decision: Rejected - spec requires nullable (uncategorized tasks)

3. **Separate "Uncategorized" Category**
   - Pros: Every task has a category in database
   - Cons: Confusing UX (can user delete "Uncategorized"?), implicit category
   - Decision: Rejected - NULL is clearer and more standard

**Implementation**:
```sql
-- Migration: Add category_id to tasks
ALTER TABLE tasks ADD COLUMN category_id INTEGER NULL;
ALTER TABLE tasks ADD CONSTRAINT fk_task_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX idx_tasks_category ON tasks(category_id);
```

---

### 3. Category Name Uniqueness

**Question**: How should we enforce unique category names per user?

**Decision**: Database-level UNIQUE constraint on (user_id, name) composite key

**Rationale**:
- Prevents duplicates at database level (strongest guarantee)
- Catches race conditions (two simultaneous creates)
- Fast validation (index lookup)
- Standard database pattern
- Consistent with user isolation

**Alternatives Considered**:
1. **Application-Level Check Only**
   - Pros: Flexible, can customize error messages
   - Cons: Race conditions possible, duplicate checking logic
   - Decision: Rejected - database constraint is safer

2. **Case-Insensitive Uniqueness**
   - Pros: Prevents "Work" and "work" as separate categories
   - Cons: More complex (requires lower() or citext), spec doesn't require it
   - Decision: Rejected for MVP - spec assumes case-sensitive

3. **Global Uniqueness Across All Users**
   - Pros: Simpler constraint
   - Cons: User A can't use "Work" if User B already has it
   - Decision: Rejected - violates user isolation

**Implementation**:
```sql
-- Migration: Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#9CA3AF',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);
CREATE INDEX idx_categories_user ON categories(user_id);
```

---

### 4. Task Filtering Implementation

**Question**: How should users filter tasks by category in the API?

**Decision**: Add optional `category_id` query parameter to existing `GET /api/tasks` endpoint

**Rationale**:
- RESTful pattern (query parameters for filtering)
- Stateless (no server-side filter state)
- Backward compatible (existing clients ignore parameter)
- Simple implementation (add WHERE clause)
- Consistent with future filtering needs (could add `completed`, `search`, etc.)

**Alternatives Considered**:
1. **Separate Endpoint** (`GET /api/categories/{id}/tasks`)
   - Pros: More explicit, follows nested resource pattern
   - Cons: Redundant endpoint, complicates API
   - Decision: Rejected - query parameters are simpler

2. **Request Body Filter**
   - Pros: Can support complex filters
   - Cons: GET requests with body are unconventional, harder to cache
   - Decision: Rejected - query param is standard for GET

3. **Separate "Filtered" Endpoint** (`GET /api/tasks/filtered`)
   - Pros: Explicit filtering endpoint
   - Cons: Awkward naming, doesn't scale (need /tasks/sorted, /tasks/searched, etc.)
   - Decision: Rejected - query params are standard RESTful pattern

**Implementation**:
```python
# Backend: Update GET /api/tasks
@router.get("", response_model=List[TaskRead])
async def list_tasks(
    category_id: Optional[int] = None,  # NEW: filter parameter
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Task).where(Task.user_id == current_user.id)

    if category_id is not None:
        statement = statement.where(Task.category_id == category_id)

    tasks = session.exec(statement.order_by(Task.created_at.desc())).all()
    return tasks
```

**Special Cases**:
- `category_id=null` → Not supported (use absence of parameter)
- No parameter → Returns all tasks (including uncategorized)
- Invalid category_id → Returns empty list (category doesn't exist or doesn't belong to user)

---

### 5. Frontend Filter State Management

**Question**: How should we persist category filter state in the frontend?

**Decision**: React `useState` for session-scoped filter (resets on page reload)

**Rationale**:
- Simple implementation (matches existing task state management)
- No additional libraries needed
- Session-scoped is intuitive (users expect fresh view on reload)
- Easy to extend later (add URL params, localStorage, etc.)
- Consistent with current architecture

**Alternatives Considered**:
1. **URL Query Parameters**
   - Pros: Shareable filtered views, bookmarkable
   - Cons: More complex state sync, navigation concerns
   - Decision: Deferred to future enhancement

2. **LocalStorage Persistence**
   - Pros: Filter persists across sessions
   - Cons: May surprise users, requires clear UI indicator
   - Decision: Deferred to future enhancement

3. **Global State Management** (Redux, Zustand)
   - Pros: Centralized state, easier testing
   - Cons: Overkill for simple filter, adds complexity
   - Decision: Rejected - useState is sufficient for MVP

**Implementation**:
```typescript
// Frontend: TaskList component
const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
const [categories, setCategories] = useState<Category[]>([]);

// Filter tasks client-side or via API call
const filteredTasks = selectedCategoryId
  ? await api.getTasks({ category_id: selectedCategoryId })
  : await api.getTasks();
```

---

## Technology Decisions Summary

| Decision Point | Choice | Rationale |
|----------------|--------|-----------|
| Color Storage | Hex codes (VARCHAR(7)) | Simple, web-compatible, easy validation |
| Category-Task Relationship | Optional FK with SET NULL | Preserves tasks on delete, allows uncategorized |
| Uniqueness Enforcement | DB UNIQUE constraint | Race-condition safe, fast validation |
| Filtering Pattern | Query parameter | RESTful, stateless, backward compatible |
| Filter State | React useState | Simple, session-scoped, extensible |

## Best Practices Applied

1. **Database Design**:
   - Use appropriate constraints (UNIQUE, NOT NULL, FK)
   - Add indexes for performance (user_id, category_id)
   - Use CASCADE appropriately (DELETE CASCADE for categories, SET NULL for tasks)

2. **API Design**:
   - RESTful endpoints
   - Optional parameters for filtering
   - Proper HTTP status codes (201 for create, 204 for delete)
   - Validation at both database and application level

3. **Frontend Architecture**:
   - Type-safe interfaces (TypeScript)
   - Component composition (CategoryManager, category selector in TaskForm)
   - Consistent state management patterns

4. **Security**:
   - User isolation enforced at every level
   - Authentication required for all endpoints
   - Ownership validation on updates/deletes

## Performance Considerations

1. **Database Indexes**:
   - `idx_categories_user` on (user_id) for fast category list retrieval
   - `idx_tasks_category` on (category_id) for fast filtering
   - UNIQUE constraint creates implicit index

2. **Query Optimization**:
   - Use WHERE clause filtering (not client-side)
   - Limit data transfer (only fetch needed fields)
   - Single query for filtered tasks (no N+1)

3. **Caching Opportunities** (future):
   - Category list rarely changes (could cache)
   - Filtered task results (with invalidation)

## References

- SQLModel documentation: https://sqlmodel.tiangolo.com/
- FastAPI query parameters: https://fastapi.tiangolo.com/tutorial/query-params/
- PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- React state management: https://react.dev/learn/managing-state
