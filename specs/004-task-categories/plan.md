# Implementation Plan: Task Categories System

**Branch**: `004-task-categories` | **Date**: 2025-12-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-task-categories/spec.md`

## Summary

Implement a task categorization system that allows users to organize their tasks into custom categories. Users can create categories with names and colors, assign tasks to categories, filter tasks by category, and manage their categories (create, rename, delete). This feature extends the existing task management system (003-task-crud) with organizational capabilities while maintaining user isolation and data integrity.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript/React 19 (frontend)
**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Neon PostgreSQL
- Frontend: Next.js 16, React 19, TailwindCSS
**Storage**: Neon PostgreSQL (serverless database)
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web application (Linux backend, browser frontend)
**Project Type**: Web (separate backend + frontend)
**Performance Goals**:
- Category operations complete within 2 seconds for 95% of requests
- Support 50+ categories per user without degradation
- Filtering response under 1 second
**Constraints**:
- 100% user isolation (users only see own categories)
- 0% data loss (deleting category preserves tasks)
- Category names unique per user
**Scale/Scope**:
- Multi-user web application
- 5 user stories (P1-P3 prioritized)
- 4 new API endpoints
- 1 new database table + 1 table migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Spec-Driven Development ✅ PASS
- Specification created first (spec.md with 5 user stories, 15 functional requirements)
- Implementation will be generated from specification
- No manual code writing planned
- Process fully documented via PHRs

### Principle II: Simplicity and Focus ✅ PASS
- Clear scope: Category management for task organization
- Builds on existing Phase II infrastructure (task CRUD system)
- No scope creep: Out of scope clearly defined (no category sharing, hierarchies, etc.)
- Focused on user value: Organization and filtering capabilities

### Principle IV: User Experience Excellence ✅ PASS
- Intuitive category creation with visual colors
- Clear filtering UI
- Helpful error messages defined in spec
- Confirmation for destructive actions (delete)
- Empty states handled ("No tasks in this category")

### Principle V: Testability by Design ✅ PASS
- 5 independently testable user stories
- Clear acceptance criteria for each story
- API contracts will be defined
- Backend/frontend separation maintained

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/004-task-categories/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── categories-api.yaml   # OpenAPI spec for category endpoints
│   └── tasks-api-update.yaml # Updated tasks API with category field
├── checklists/
│   └── requirements.md  # Quality validation (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
phase-2-web/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── task.py           # UPDATE: Add category_id field
│   │   │   └── category.py       # NEW: Category model
│   │   ├── routers/
│   │   │   ├── tasks.py          # UPDATE: Add category filtering
│   │   │   └── categories.py     # NEW: Category CRUD endpoints
│   │   ├── database.py           # Existing
│   │   └── dependencies/
│   │       └── auth.py           # Existing (user isolation)
│   └── migrations/
│       ├── 001_create_tasks_table.sql      # Existing
│       ├── 002_create_categories_table.sql # NEW
│       └── 003_add_category_to_tasks.sql   # NEW
│
└── frontend/
    ├── app/
    │   └── (app)/
    │       └── tasks/
    │           └── page.tsx       # UPDATE: Add category filter UI
    ├── components/
    │   ├── TaskForm.tsx           # UPDATE: Add category selector
    │   ├── TaskItem.tsx           # UPDATE: Display category badge
    │   ├── TaskList.tsx           # UPDATE: Add filter controls
    │   └── CategoryManager.tsx    # NEW: Category CRUD UI
    ├── types/
    │   ├── task.ts                # UPDATE: Add category_id field
    │   └── category.ts            # NEW: Category types
    └── lib/
        └── api.ts                 # UPDATE: Add category methods
```

## Phase 0: Research & Decisions

**Objective**: Resolve technical unknowns and establish implementation patterns

### Research Tasks

1. **Category Color Management**
   - Decision: Use hex color codes with validation
   - Rationale: Simple, widely supported, easy to validate
   - Alternatives: Predefined palette (considered for future enhancement)

2. **Category-Task Relationship**
   - Decision: Optional foreign key (nullable category_id on tasks)
   - Rationale: Tasks can exist without categories, deletion preserves tasks
   - Alternatives: Many-to-many (rejected - adds complexity)

3. **Category Uniqueness**
   - Decision: Enforce unique constraint at database level (user_id, name)
   - Rationale: Prevents duplicates, fast validation
   - Alternatives: Application-level check (rejected - race conditions)

4. **Filtering Implementation**
   - Decision: Query parameter on GET /api/tasks endpoint
   - Rationale: RESTful, stateless, easy to test
   - Alternatives: Separate filtered endpoint (rejected - more complex)

5. **Frontend State Management**
   - Decision: React useState for category filter (session-scoped)
   - Rationale: Simple, matches existing task management pattern
   - Alternatives: URL query params (considered for future)

**Output**: [research.md](./research.md) *(to be created)*

## Phase 1: Design & Contracts

**Objective**: Define data models, API contracts, and implementation approach

### Data Model

**Category Entity**:
```
categories table:
- id: SERIAL PRIMARY KEY
- name: VARCHAR(50) NOT NULL
- color: VARCHAR(7) DEFAULT '#9CA3AF'
- user_id: INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(user_id, name)
- INDEX(user_id)
```

**Task Entity (Modified)**:
```
tasks table (add column):
- category_id: INTEGER NULL REFERENCES categories(id) ON DELETE SET NULL
- INDEX(category_id)
```

**Relationships**:
- User (1) → (N) Categories
- Category (1) → (N) Tasks
- Task (N) → (0..1) Category

### API Contracts

**Category Endpoints**:

1. `GET /api/categories`
   - Returns: List of user's categories
   - Auth: Required (JWT)
   - Response: 200 OK with Category[]

2. `POST /api/categories`
   - Body: { name, color? }
   - Returns: Created category
   - Validation: name required (1-50 chars), unique per user
   - Response: 201 Created with Category

3. `PUT /api/categories/{id}`
   - Body: { name?, color? }
   - Returns: Updated category
   - Validation: ownership check, unique name
   - Response: 200 OK with Category

4. `DELETE /api/categories/{id}`
   - Returns: Success message
   - Side effect: Sets category_id=null for associated tasks
   - Response: 204 No Content

**Task Endpoints (Updated)**:

1. `GET /api/tasks?category_id={id}`
   - New query parameter for filtering
   - Returns: Filtered task list
   - Response: 200 OK with Task[]

2. `POST /api/tasks` & `PUT /api/tasks/{id}`
   - Add category_id to request body (optional)
   - Validation: category exists and belongs to user

### Implementation Strategy

**Phase 1A: Backend Foundation**
1. Create Category model (SQLModel)
2. Create categories table migration
3. Update Task model with category_id
4. Create migration to add category_id column

**Phase 1B: Backend API**
1. Implement GET /api/categories
2. Implement POST /api/categories (with uniqueness validation)
3. Implement PUT /api/categories/{id}
4. Implement DELETE /api/categories/{id} (with cascade to tasks)
5. Update GET /api/tasks with category_id filter

**Phase 1C: Frontend Types & API**
1. Create Category TypeScript types
2. Update Task type with category_id
3. Add category API methods to api.ts

**Phase 1D: Frontend Components**
1. Create CategoryManager component (CRUD UI)
2. Update TaskForm with category selector
3. Update TaskList with category filter dropdown
4. Update TaskItem with category badge display

**Phase 1E: Integration & Testing**
1. Test category CRUD operations
2. Test task-category assignment
3. Test category filtering
4. Test category deletion (verify tasks preserved)
5. Test user isolation

**Output**:
- [data-model.md](./data-model.md)
- [contracts/categories-api.yaml](./contracts/categories-api.yaml)
- [contracts/tasks-api-update.yaml](./contracts/tasks-api-update.yaml)
- [quickstart.md](./quickstart.md)

### Agent Context Update

Run: `.specify/scripts/bash/update-agent-context.sh claude`

**New technologies to document**:
- None (uses existing stack: FastAPI, SQLModel, Next.js, React)

**Architecture notes to add**:
- Category-task relationship pattern (optional FK with cascade SET NULL)
- Category color validation pattern (hex codes)
- Filtering pattern (query parameters)

## Constitution Re-Check (Post-Design)

*GATE: Verify design aligns with constitution after Phase 1*

### Principle I: Spec-Driven Development ✅ PASS
- All design derived from specification
- No manual code additions
- Clear implementation steps defined

### Principle II: Simplicity and Focus ✅ PASS
- Design maintains simplicity (4 endpoints, 1 table, optional FK)
- No over-engineering (rejected complex alternatives)
- Clear MVP scope

### Principle III: Clean Code Standards ✅ PASS
- Models use SQLModel (type-safe ORM)
- Clear separation: models, routers, components
- Validation at database + application level

### Principle IV: User Experience Excellence ✅ PASS
- Color-coded categories for visual distinction
- Empty states defined
- Error messages user-friendly
- Confirmation for destructive actions

### Principle V: Testability by Design ✅ PASS
- Each endpoint independently testable
- Each user story independently testable
- Clear contracts enable contract testing
- Component isolation maintained

**Final Gate Status**: ✅ ALL GATES PASSED - Ready for `/sp.tasks`

## Next Steps

1. ✅ Specification complete (spec.md)
2. ✅ Planning complete (this file)
3. ⏭️ Run `/sp.tasks` to generate task breakdown
4. ⏭️ Implement tasks following generated plan
5. ⏭️ Test implementation against acceptance criteria
6. ⏭️ Create PHR for implementation phase

## Dependencies

- **Upstream**: Feature 003-task-crud (task management system) must be complete
- **Blocking**: None - can be implemented independently after task CRUD
- **Downstream**: Future features may use categories (e.g., dashboard, analytics)

## Risk Assessment

**Low Risk**:
- Extends existing working system
- Simple data model (one table + one FK)
- Standard CRUD pattern
- Well-defined user stories

**Mitigations**:
- Database migration tested before production
- Category deletion tested thoroughly (verify tasks preserved)
- User isolation verified with integration tests
- Performance tested with 50+ categories per user

## Success Metrics

Implementation considered successful when:
1. All 5 user stories pass acceptance tests
2. All 8 success criteria met (< 5s creation, < 1s filtering, 100% isolation, etc.)
3. 50+ categories per user without performance degradation
4. 0% data loss on category deletion verified
5. All API endpoints return correct responses
6. Frontend UI displays categories with colors correctly
