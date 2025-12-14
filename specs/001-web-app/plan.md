# Implementation Plan: Web-Based Todo Application

**Branch**: `001-web-app` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-web-app/spec.md`

**Note**: This plan leverages 5 expert agents (database, backend, frontend, UI, testing) and 6 technology skills for optimal implementation.

## Summary

Transform the Phase I console Todo application into a full-stack web application with user authentication, persistent database storage, and modern responsive UI. Users will be able to register accounts, securely log in, and manage their personal todo lists from any device through a browser. The application implements all 5 core CRUD operations from Phase I plus advanced features including filtering, sorting, pagination, and search functionality.

**Technical Approach**: Full-stack architecture with FastAPI backend (Python), Next.js frontend (TypeScript), and Neon PostgreSQL database. Authentication via JWT tokens with bcrypt password hashing. RESTful API design with SQLModel ORM. Responsive UI using Tailwind CSS. Comprehensive testing with Pytest (backend) and Jest (frontend).

## Technical Context

**Language/Version**:
- Backend: Python 3.13+ (FastAPI framework)
- Frontend: TypeScript 5.x+ (Next.js 16+)

**Primary Dependencies**:
- Backend: FastAPI 0.100+, SQLModel 0.14+, Uvicorn, Pydantic, passlib, python-jose, httpx
- Frontend: Next.js 16+, React 18, Tailwind CSS 3.4+, React Hook Form, Zod, Better Auth

**Storage**: Neon PostgreSQL (serverless) with SQLModel ORM for data persistence

**Testing**:
- Backend: Pytest with pytest-asyncio, httpx for API testing
- Frontend: Jest with React Testing Library for component testing

**Target Platform**:
- Backend: Linux server (containerizable)
- Frontend: Web browsers (Chrome, Firefox, Safari)
- Deployment: Vercel (frontend), Railway/Render (backend)

**Project Type**: Web application (backend + frontend)

**Performance Goals**:
- Page load time: < 2 seconds
- API response time: < 200ms (p95)
- Support 100 concurrent users minimum
- Search/filter results: < 1 second

**Constraints**:
- Database connections: < 20 concurrent (Neon free tier limit)
- API payload size: < 1MB
- Session timeout: 24 hours
- Mobile-first responsive design (min 375px width)

**Scale/Scope**:
- Users: 100+ concurrent, 1000+ total
- Tasks per user: 1000+ supported
- Endpoints: 10 REST API endpoints
- Frontend pages: 5 core pages (login, register, dashboard, task list, task edit)
- Components: ~20 React components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Phase I Constitution

**I. Spec-Driven Development** ✅
- This implementation plan follows spec.md
- Code will be generated from specifications
- All changes require spec updates first

**II. Simplicity and Focus** ✅
- Clear scope: Phase I features + auth + persistence
- No feature creep (out-of-scope items documented in spec)
- Incremental build on Phase I foundation

**III. Clean Code Standards** ✅
- Type hints: Python (type hints) + TypeScript (strict mode)
- Standards: PEP 8 (Python), ESLint (TypeScript)
- Separation of concerns: Models, services, UI layers
- Data validation: Pydantic (backend), Zod (frontend)

**IV. User Experience Excellence** ✅
- Intuitive web interface with clear navigation
- Helpful error messages and validation feedback
- Loading states and progress indicators
- Responsive design for all devices

**V. Testability by Design** ✅
- Backend: Business logic in services, testable with Pytest
- Frontend: Components tested with React Testing Library
- API: Contract testing with OpenAPI schema
- E2E: Postman/Newman for critical flows

**VI. Feature Boundaries** ✅
- Core: 5 CRUD features from Phase I (via web UI)
- New: User auth, persistence, filtering, sorting, pagination
- Out-of-scope: Password reset, email verification, 2FA, task sharing

### Phase II Specific Principles

**Security First**:
- No plain-text passwords (bcrypt hashing)
- JWT token authentication
- SQL injection prevention (ORM)
- CORS properly configured
- Input validation at all layers

**Database Design**:
- Normalized schema (3NF)
- Indexed foreign keys
- Timestamps for audit trail
- Cascade delete for user → tasks

**API Design**:
- RESTful conventions
- Consistent error responses
- Pagination by default
- Versioning ready (v1)

**Frontend Architecture**:
- Server components for static content
- Client components for interactivity
- API client layer for backend communication
- Shared UI component library

## Project Structure

### Documentation (this feature)

```text
specs/001-web-app/
├── spec.md              # Feature specification (✅ complete)
├── plan.md              # This file (🔄 in progress)
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Database schema
├── quickstart.md        # Phase 1: Setup instructions
├── contracts/           # Phase 1: API contracts
│   ├── openapi.yaml    # OpenAPI 3.0 specification
│   └── schemas/        # Request/response schemas
├── checklists/
│   └── requirements.md  # Quality validation (✅ passed)
└── tasks.md             # Phase 2: Implementation tasks (pending /sp.tasks)
```

### Source Code (repository root)

```text
# Web application structure (backend + frontend)

backend/
├── app/
│   ├── main.py              # FastAPI app instance, CORS, startup
│   ├── config.py            # Environment configuration
│   ├── database.py          # Database engine and session
│   ├── models/              # SQLModel database models
│   │   ├── __init__.py
│   │   ├── user.py         # User model
│   │   └── task.py         # Task model
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py         # User DTOs
│   │   ├── task.py         # Task DTOs
│   │   └── auth.py         # Auth DTOs
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py         # /api/auth/* endpoints
│   │   └── tasks.py        # /api/tasks/* endpoints
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py # Authentication logic
│   │   └── task_service.py # Task CRUD logic
│   ├── dependencies/        # FastAPI dependencies
│   │   ├── __init__.py
│   │   ├── auth.py         # get_current_user
│   │   └── database.py     # get_session
│   └── utils/               # Helper functions
│       ├── __init__.py
│       ├── password.py     # Hashing, verification
│       └── jwt.py          # Token creation, validation
├── tests/                   # Pytest test suite
│   ├── conftest.py         # Fixtures
│   ├── test_auth.py        # Auth endpoint tests
│   ├── test_tasks.py       # Task endpoint tests
│   ├── test_models.py      # Model tests
│   └── test_services.py    # Service layer tests
├── .env.example            # Environment template
├── pyproject.toml          # Dependencies (UV)
├── README.md               # Backend setup guide
└── alembic/                # Database migrations (optional)

frontend/
├── app/                     # Next.js 16+ App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── (auth)/             # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx   # Login page
│   │   └── register/
│   │       └── page.tsx   # Register page
│   ├── (app)/              # Protected routes
│   │   ├── layout.tsx     # App layout with nav
│   │   └── dashboard/
│   │       └── page.tsx   # Main dashboard
│   └── globals.css         # Tailwind imports
├── components/              # React components
│   ├── ui/                  # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── forms/               # Form components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── TaskForm.tsx
│   ├── tasks/               # Task-specific components
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskFilter.tsx
│   │   └── TaskSearch.tsx
│   └── layout/              # Layout components
│       ├── Header.tsx
│       ├── Nav.tsx
│       └── Footer.tsx
├── lib/                     # Utilities and helpers
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth helpers
│   └── utils.ts            # General utilities (cn, etc)
├── types/                   # TypeScript types
│   ├── user.ts
│   ├── task.ts
│   └── api.ts
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts          # Authentication hook
│   ├── useTasks.ts         # Task management hook
│   └── useToast.ts         # Toast notifications
├── contexts/                # React contexts
│   ├── AuthContext.tsx     # Auth state management
│   └── ToastContext.tsx    # Toast notifications
├── __tests__/              # Jest tests
│   ├── components/         # Component tests
│   ├── hooks/              # Hook tests
│   └── lib/                # Utility tests
├── public/                  # Static assets
├── .env.local.example      # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind configuration
├── next.config.js          # Next.js configuration
└── README.md               # Frontend setup guide
```

**Structure Decision**: Web application architecture selected due to backend API + frontend UI requirements. Backend uses layered architecture (routes → services → models) for testability. Frontend uses Next.js App Router with route groups for auth vs protected pages. Both follow separation of concerns with dedicated directories for models, components, utilities, and tests.

## Complexity Tracking

**No violations** - this implementation aligns with project constitution:
- Clean separation of concerns maintained
- Testable architecture preserved
- Spec-driven development followed
- Clear scope boundaries defined

---

## Phase 0: Research & Technology Decisions

*Output: `research.md` documenting all technology choices and patterns*

### Research Tasks

1. **Neon PostgreSQL Setup**
   - Connection string format
   - Connection pooling configuration
   - Free tier limits and best practices
   - Migration strategy (Alembic vs SQLModel.create_all)

2. **Better Auth Integration**
   - Frontend: Better Auth (TypeScript library) for user authentication
   - Backend: Verify JWT tokens issued by Better Auth
   - Shared secret: BETTER_AUTH_SECRET for JWT signing/verification
   - Pattern: JWT tokens with bcrypt password hashing
   - Session management: Token expiration, stateless architecture
   - URL validation: Match user_id in URL path with JWT user_id

3. **FastAPI + SQLModel Integration**
   - Dependency injection for database sessions
   - Async vs sync operations
   - Transaction management
   - Error handling patterns

4. **Next.js 16+ App Router Patterns**
   - Server components vs client components
   - Route groups for auth/protected routes
   - Better Auth integration for authentication
   - API client setup with JWT token management
   - State management (React Context for auth state)

5. **Testing Strategy**
   - Backend: Pytest with in-memory SQLite for tests
   - Frontend: Jest + React Testing Library
   - API contract testing approach
   - E2E testing scope (if any)

6. **Deployment Architecture**
   - Backend hosting options (Railway, Render, Fly.io)
   - Frontend hosting (Vercel recommended for Next.js)
   - Environment variable management
   - CORS configuration for production

---

## Phase 1: Design & Contracts

*Outputs: `data-model.md`, `contracts/`, `quickstart.md`, updated agent context*

### Phase 1.1: Data Model

Design database schema with SQLModel:

**Entities**:
1. **User** - Account holder
2. **Task** - Todo item

**Relationships**:
- User (1) → (many) Tasks
- Cascade delete: User deleted → Tasks deleted

**Indexes**:
- user.email (unique)
- task.user_id (foreign key, indexed)
- task.completed (for filtering)
- task.created_at (for sorting)

### Phase 1.2: API Contracts

Generate OpenAPI 3.0 specification:

**Endpoints**:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/{user_id}/tasks
- GET /api/{user_id}/tasks (with query params: skip, limit, completed, search, sortBy)
- GET /api/{user_id}/tasks/{id}
- PUT /api/{user_id}/tasks/{id}
- DELETE /api/{user_id}/tasks/{id}
- PATCH /api/{user_id}/tasks/{id}/complete

**Schemas**:
- UserRegister, UserLogin, UserResponse
- TaskCreate, TaskUpdate, TaskResponse
- Token, ErrorResponse

### Phase 1.3: Quickstart Guide

Setup instructions for:
1. Prerequisites (Python 3.13+, Node 18+, UV, npm)
2. Database setup (Neon account, connection string)
3. Backend setup (install, env vars, run)
4. Frontend setup (install, env vars, run)
5. Testing (run backend/frontend tests)
6. First user creation and task management

### Phase 1.4: Agent Context Update

Run `.specify/scripts/bash/update-agent-context.sh claude` to add:
- FastAPI patterns with user_id path parameters
- Next.js 16+ App Router
- Better Auth integration (frontend)
- SQLModel relationships
- Neon PostgreSQL specifics
- JWT authentication flow (Backend verifies Better Auth tokens)
- Tailwind CSS conventions

---

## Implementation Notes

### Reuse from Phase I

**Models** (`phase-1-console/src/models.py`):
- Task dataclass → SQLModel with table=True
- Add user_id foreign key
- Keep title, description, completed fields

**Business Logic** (`phase-1-console/src/task_manager.py`):
- CRUD methods → TaskService class
- Add user filtering to all queries
- Adapt for async operations

**Validation Rules**:
- Title required, max 200 chars
- Description optional, max 1000 chars
- Reuse validation logic

### New Components

**Authentication**:
- User registration with email validation
- Password hashing with bcrypt
- JWT token generation and validation
- Protected route middleware

**API Layer**:
- FastAPI routers for auth and tasks
- Pydantic schemas for validation
- Dependency injection for auth
- Error handling middleware

**Frontend**:
- Next.js pages and components
- API client with token management
- Form handling with React Hook Form
- Responsive UI with Tailwind CSS

**Database**:
- Neon PostgreSQL connection
- SQLModel migrations
- Connection pooling
- Transaction management

### Critical Paths

1. **Authentication Flow**: Register → Login → Get Tasks
2. **Task Management**: Create → List → Update → Delete
3. **Data Persistence**: Database CRUD operations
4. **Responsive UI**: Mobile and desktop layouts

### Risk Mitigation

**Risk**: Neon connection limits
**Mitigation**: Proper connection pooling, connection recycling

**Risk**: JWT token security
**Mitigation**: Short expiration, secure storage, HTTPS only

**Risk**: SQL injection
**Mitigation**: SQLModel ORM (parameterized queries)

**Risk**: CORS issues
**Mitigation**: Proper CORS middleware configuration

---

## Success Metrics

Implementation complete when:
- [x] research.md documents all technology decisions
- [x] data-model.md defines complete database schema
- [x] contracts/openapi.yaml contains all API endpoints
- [x] quickstart.md enables developer setup in < 15 minutes
- [ ] tasks.md generated with actionable implementation tasks (via /sp.tasks)
- [ ] All functional requirements from spec.md testable
- [ ] All success criteria from spec.md measurable

---

**Next Command**: `/sp.tasks` to generate dependency-ordered implementation tasks
