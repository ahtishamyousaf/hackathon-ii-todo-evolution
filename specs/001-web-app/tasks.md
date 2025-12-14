# Tasks: Web-Based Todo Application

**Input**: Design documents from `/specs/001-web-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**Tests**: Tests are NOT explicitly requested in the feature specification, so test tasks are omitted. Focus is on implementation and manual validation per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `backend/` for FastAPI, `frontend/` for Next.js 16+
- Backend paths: `backend/app/`
- Frontend paths: `frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create backend directory structure per plan.md (app/, tests/, pyproject.toml)
- [ ] T002 Create frontend directory structure per plan.md (app/, components/, lib/, etc.)
- [ ] T003 Initialize backend Python project with UV and create pyproject.toml with FastAPI, SQLModel, Uvicorn, python-jose, passlib dependencies
- [ ] T004 [P] Initialize frontend Next.js 16+ project with TypeScript, Tailwind CSS, Better Auth dependencies
- [ ] T005 [P] Create backend .env.example with DATABASE_URL, SECRET_KEY, BETTER_AUTH_SECRET, ALLOWED_ORIGINS
- [ ] T006 [P] Create frontend .env.local.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET
- [ ] T007 [P] Configure Tailwind CSS in frontend/tailwind.config.js per research.md patterns
- [ ] T008 [P] Setup TypeScript configuration in frontend/tsconfig.json with strict mode
- [ ] T009 [P] Create backend/README.md with setup instructions
- [ ] T010 [P] Create frontend/README.md with setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T011 Setup database connection in backend/app/database.py with Neon PostgreSQL engine, session management, connection pooling per research.md
- [ ] T012 [P] Create backend/app/config.py for environment variable management (DATABASE_URL, SECRET_KEY, BETTER_AUTH_SECRET, ALLOWED_ORIGINS)
- [ ] T013 [P] Setup FastAPI app instance in backend/app/main.py with CORS middleware configured for frontend origin
- [ ] T014 [P] Create database session dependency in backend/app/dependencies/database.py with get_session()
- [ ] T015 [P] Implement JWT token verification utilities in backend/app/utils/jwt.py (verify_token, validate_user_id_match) using BETTER_AUTH_SECRET per research.md
- [ ] T016 [P] Implement password hashing utilities in backend/app/utils/password.py using passlib bcrypt
- [ ] T017 Create startup event handler in backend/app/main.py to create database tables with SQLModel.metadata.create_all()

### Frontend Foundation

- [ ] T018 [P] Create Better Auth configuration in frontend/lib/auth.ts with baseURL and JWT plugin per research.md
- [ ] T019 [P] Setup API client in frontend/lib/api.ts with token management and error handling
- [ ] T020 [P] Create AuthContext in frontend/contexts/AuthContext.tsx for user state management per research.md patterns
- [ ] T021 [P] Create root layout in frontend/app/layout.tsx with AuthProvider and Tailwind CSS imports
- [ ] T022 [P] Create base UI components in frontend/components/ui/ (Button.tsx, Input.tsx, Card.tsx, Badge.tsx) with Tailwind styling
- [ ] T023 [P] Create utility functions in frontend/lib/utils.ts (cn helper for className merging)
- [ ] T024 [P] Configure Next.js in frontend/next.config.js with API URL rewrites if needed

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts and securely log in to access personal todo lists

**Independent Test**: Create new account, logout, login with credentials, verify dashboard access

**Acceptance Criteria** (from spec.md):
- FR-001: Register with email and password
- FR-002: Email format validation
- FR-003: Secure password storage (bcrypt)
- FR-004: User login
- FR-005: Session management
- FR-006: User logout
- FR-007: Protect routes from unauthenticated access
- FR-008: User isolation (only own tasks)

### Backend Implementation for US1

- [ ] T025 [P] [US1] Create User model in backend/app/models/user.py with SQLModel (id, email unique indexed, password_hash, created_at) per data-model.md
- [ ] T026 [P] [US1] Create User Pydantic schemas in backend/app/schemas/user.py (UserRegister, UserLogin, UserResponse) per data-model.md
- [ ] T027 [P] [US1] Create Token schema in backend/app/schemas/auth.py (access_token, token_type)
- [ ] T028 [US1] Implement authentication service in backend/app/services/auth_service.py (register_user, authenticate_user) with email validation and password hashing
- [ ] T029 [US1] Create auth dependency in backend/app/dependencies/auth.py (get_current_user using JWT verification)
- [ ] T030 [US1] Implement POST /api/auth/register endpoint in backend/app/routers/auth.py (register, hash password, return JWT token)
- [ ] T031 [US1] Implement POST /api/auth/login endpoint in backend/app/routers/auth.py (verify credentials, return JWT token)
- [ ] T032 [US1] Implement GET /api/auth/me endpoint in backend/app/routers/auth.py (return current user info, requires auth)
- [ ] T033 [US1] Include auth router in backend/app/main.py with prefix /api/auth

### Frontend Implementation for US1

- [ ] T034 [P] [US1] Create User TypeScript types in frontend/types/user.ts (User, UserRegister, UserLogin)
- [ ] T035 [P] [US1] Create useAuth hook in frontend/hooks/useAuth.ts wrapping AuthContext for login, register, logout
- [ ] T036 [US1] Create RegisterForm component in frontend/components/forms/RegisterForm.tsx with React Hook Form and Zod validation
- [ ] T037 [US1] Create LoginForm component in frontend/components/forms/LoginForm.tsx with React Hook Form and Zod validation
- [ ] T038 [US1] Create register page in frontend/app/(auth)/register/page.tsx using RegisterForm, responsive design
- [ ] T039 [US1] Create login page in frontend/app/(auth)/login/page.tsx using LoginForm, responsive design
- [ ] T040 [US1] Create landing page in frontend/app/page.tsx with navigation to login/register, responsive design
- [ ] T041 [US1] Create protected app layout in frontend/app/(app)/layout.tsx with auth guard and navigation
- [ ] T042 [US1] Create Header component in frontend/components/layout/Header.tsx with user info and logout button, responsive
- [ ] T043 [US1] Create Nav component in frontend/components/layout/Nav.tsx with navigation links, responsive

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register, login, logout, and access protected routes

---

## Phase 4: User Story 2 - Task Creation and Management (Priority: P2)

**Goal**: Enable users to create, view, update, delete, and complete tasks through web interface

**Independent Test**: Login, create task, view task list, edit task, toggle completion, delete task

**Acceptance Criteria** (from spec.md):
- FR-009: Create tasks with title (required) and description (optional)
- FR-010: Validate task title not empty, max 200 chars
- FR-011: Display task list with title, description, status
- FR-012: Update task title and description
- FR-013: Toggle task completion status
- FR-014: Delete tasks permanently
- FR-015: Persist task data across sessions

### Backend Implementation for US2

- [ ] T044 [P] [US2] Create Task model in backend/app/models/task.py with SQLModel (id, user_id FK, title, description, completed, created_at, updated_at) per data-model.md
- [ ] T045 [P] [US2] Create Task Pydantic schemas in backend/app/schemas/task.py (TaskCreate, TaskUpdate, TaskResponse) per data-model.md
- [ ] T046 [US2] Implement task service in backend/app/services/task_service.py (create_task, get_tasks, get_task_by_id, update_task, delete_task, toggle_task)
- [ ] T047 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py (create task, validate user_id match, requires auth)
- [ ] T048 [US2] Implement GET /api/{user_id}/tasks endpoint in backend/app/routers/tasks.py (list user tasks, validate user_id match, requires auth)
- [ ] T049 [US2] Implement GET /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py (get single task, validate ownership, requires auth)
- [ ] T050 [US2] Implement PUT /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py (update task, validate ownership, requires auth)
- [ ] T051 [US2] Implement DELETE /api/{user_id}/tasks/{id} endpoint in backend/app/routers/tasks.py (delete task, validate ownership, requires auth)
- [ ] T052 [US2] Implement PATCH /api/{user_id}/tasks/{id}/complete endpoint in backend/app/routers/tasks.py (toggle completion, validate ownership, requires auth)
- [ ] T053 [US2] Include tasks router in backend/app/main.py with prefix /api/{user_id}

### Frontend Implementation for US2

- [ ] T054 [P] [US2] Create Task TypeScript types in frontend/types/task.ts (Task, TaskCreate, TaskUpdate)
- [ ] T055 [P] [US2] Create useTasks hook in frontend/hooks/useTasks.ts for task CRUD operations with API client
- [ ] T056 [P] [US2] Create useToast hook in frontend/hooks/useToast.ts for success/error notifications
- [ ] T057 [P] [US2] Create ToastContext in frontend/contexts/ToastContext.tsx for toast notification management
- [ ] T058 [US2] Create TaskForm component in frontend/components/forms/TaskForm.tsx with React Hook Form, Zod validation, create/edit modes
- [ ] T059 [US2] Create TaskCard component in frontend/components/tasks/TaskCard.tsx displaying task info with edit/delete/toggle actions, responsive
- [ ] T060 [US2] Create TaskList component in frontend/components/tasks/TaskList.tsx rendering array of TaskCard components, responsive
- [ ] T061 [US2] Create dashboard page in frontend/app/(app)/dashboard/page.tsx with TaskList, TaskForm, and loading states, responsive
- [ ] T062 [US2] Add task creation UI in dashboard (modal or inline form) with validation feedback
- [ ] T063 [US2] Add task editing UI in dashboard (modal or inline edit) with validation feedback
- [ ] T064 [US2] Add task deletion with confirmation dialog to prevent accidental deletes
- [ ] T065 [US2] Add visual feedback for loading states and operation success/failure using toast notifications

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - full task CRUD with authentication

---

## Phase 5: User Story 3 - Task Organization and Search (Priority: P3)

**Goal**: Enable users to filter, sort, search, and paginate tasks for better organization

**Independent Test**: Create 25+ tasks, filter by status, sort by date/title, search by keyword, navigate pages

**Acceptance Criteria** (from spec.md):
- FR-017: Filter by all/pending/completed
- FR-018: Sort by creation date, title, completion status
- FR-019: Search by keywords in title/description
- FR-020: Pagination for >20 tasks
- FR-021: Clear error messages
- FR-022: Loading indicators

### Backend Implementation for US3

- [ ] T066 [US3] Add query parameters to GET /api/{user_id}/tasks in backend/app/routers/tasks.py (skip, limit, completed, search, sortBy, sortOrder) per openapi.yaml
- [ ] T067 [US3] Implement filtering logic in backend/app/services/task_service.py (filter by completed status)
- [ ] T068 [US3] Implement sorting logic in backend/app/services/task_service.py (sort by created_at, title, completed)
- [ ] T069 [US3] Implement search logic in backend/app/services/task_service.py (search title and description with ILIKE/contains)
- [ ] T070 [US3] Implement pagination logic in backend/app/services/task_service.py (offset and limit with default 20 per page)

### Frontend Implementation for US3

- [ ] T071 [P] [US3] Create TaskFilter component in frontend/components/tasks/TaskFilter.tsx with all/pending/completed filter buttons, responsive
- [ ] T072 [P] [US3] Create TaskSearch component in frontend/components/tasks/TaskSearch.tsx with search input and debouncing, responsive
- [ ] T073 [US3] Add filter state management to useTasks hook in frontend/hooks/useTasks.ts (completed filter)
- [ ] T074 [US3] Add sort state management to useTasks hook in frontend/hooks/useTasks.ts (sortBy, sortOrder)
- [ ] T075 [US3] Add search state management to useTasks hook in frontend/hooks/useTasks.ts (search query with debounce)
- [ ] T076 [US3] Add pagination state management to useTasks hook in frontend/hooks/useTasks.ts (current page, total count)
- [ ] T077 [US3] Create sort controls UI in dashboard (dropdown or buttons for sort field and order)
- [ ] T078 [US3] Create pagination controls in dashboard (prev/next buttons, page numbers)
- [ ] T079 [US3] Integrate TaskFilter, TaskSearch, and sort controls into dashboard page
- [ ] T080 [US3] Update TaskList to display empty states when no tasks match filters/search
- [ ] T081 [US3] Add loading skeletons for better UX during data fetch

**Checkpoint**: All core user stories should now be independently functional - full-featured task management with auth

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T082 [P] Add comprehensive error handling across all backend endpoints with consistent error response format
- [ ] T083 [P] Add request/response logging in backend/app/main.py for debugging and monitoring
- [ ] T084 [P] Validate all frontend forms display clear error messages for validation failures
- [ ] T085 [P] Test responsive design on mobile (375px), tablet (768px), desktop (1024px+) for all pages
- [ ] T086 [P] Add loading states and optimistic UI updates for all task operations
- [ ] T087 [P] Verify CORS configuration allows frontend origin in backend/app/main.py
- [ ] T088 [P] Test authentication flow: register → logout → login → access protected route
- [ ] T089 [P] Test user isolation: ensure users cannot access other users' tasks by URL manipulation
- [ ] T090 [P] Test edge cases: empty task list, very long task text, special characters, emojis
- [ ] T091 [P] Verify session persistence across page refresh and browser restart
- [ ] T092 [P] Test pagination with 50+ tasks to ensure proper navigation
- [ ] T093 [P] Run quickstart.md setup validation to ensure 15-minute onboarding works
- [ ] T094 [P] Update backend/README.md with final API documentation and environment setup
- [ ] T095 [P] Update frontend/README.md with component documentation and development workflow
- [ ] T096 Code cleanup and remove unused imports/components across frontend and backend
- [ ] T097 Final security review: ensure password hashing, JWT verification, user_id validation all working
- [ ] T098 Performance check: verify API response times <200ms, page loads <2s per success criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion, integrates with US1 for auth
- **User Story 3 (Phase 5)**: Depends on Foundational phase completion, extends US2 task list functionality
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1 auth for protected endpoints
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends US2 task listing with filters/search

**Note**: US4 (Data Persistence) is built into database setup and US1/US2 implementation. US5 (Responsive Design) is integrated into all frontend components.

### Within Each User Story

- Backend models before services
- Services before endpoints/routers
- Endpoints before frontend integration
- Frontend types before components
- Forms/components before pages
- Core implementation before UI enhancements

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- T004, T005, T006, T007, T008, T009, T010

**Phase 2 (Foundational)**: All tasks marked [P] can run in parallel within backend and frontend groups
- Backend: T012, T013, T014, T015, T016
- Frontend: T018, T019, T020, T021, T022, T023, T024

**Phase 3 (US1)**: Models and schemas can run in parallel
- T025, T026, T027 (models/schemas)
- T034, T035 (frontend types/hooks)
- T036, T037 (forms)
- T038, T039 (pages)

**Phase 4 (US2)**: Models, schemas, and UI components can run in parallel
- T044, T045 (models/schemas)
- T054, T055, T056, T057 (frontend types/hooks/contexts)
- T058, T059, T060 (UI components)

**Phase 5 (US3)**: Filter, search, and controls can run in parallel
- T071, T072 (filter/search components)

**Phase 6 (Polish)**: Most polish tasks can run in parallel
- T082, T083, T084, T085, T086, T087, T088, T089, T090, T091, T092, T093, T094, T095

---

## Parallel Example: User Story 1

```bash
# Launch backend models/schemas together:
Task: "T025 [P] [US1] Create User model in backend/app/models/user.py"
Task: "T026 [P] [US1] Create User Pydantic schemas in backend/app/schemas/user.py"
Task: "T027 [P] [US1] Create Token schema in backend/app/schemas/auth.py"

# Launch frontend types/hooks together:
Task: "T034 [P] [US1] Create User TypeScript types in frontend/types/user.ts"
Task: "T035 [P] [US1] Create useAuth hook in frontend/hooks/useAuth.ts"

# Launch forms together:
Task: "T036 [US1] Create RegisterForm component in frontend/components/forms/RegisterForm.tsx"
Task: "T037 [US1] Create LoginForm component in frontend/components/forms/LoginForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T010)
2. Complete Phase 2: Foundational (T011-T024) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 (T025-T043)
4. **STOP and VALIDATE**: Test registration, login, logout, auth guards
5. Deploy/demo if ready - **This is your MVP!**

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP READY** (auth working)
3. Add User Story 2 → Test independently → **Core product** (full CRUD)
4. Add User Story 3 → Test independently → **Feature complete** (filters, search, pagination)
5. Add Polish → Final validation → **Production ready**

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together** (T001-T024)
2. Once Foundational is done:
   - **Developer A**: User Story 1 backend (T025-T033)
   - **Developer B**: User Story 1 frontend (T034-T043)
   - After US1 complete, split US2/US3 similarly
3. Stories integrate independently through well-defined APIs

---

## Task Summary

- **Total Tasks**: 98
- **Setup Phase**: 10 tasks
- **Foundational Phase**: 14 tasks (CRITICAL - blocks all stories)
- **User Story 1 (P1)**: 19 tasks (MVP)
- **User Story 2 (P2)**: 22 tasks
- **User Story 3 (P3)**: 16 tasks
- **Polish Phase**: 17 tasks

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel with other tasks

**MVP Scope**: Phases 1-3 (43 tasks) delivers working authentication - good stopping point for validation

**Core Product**: Phases 1-4 (65 tasks) delivers full CRUD task management

**Feature Complete**: Phases 1-5 (81 tasks) delivers all user stories

---

## Notes

- [P] tasks = different files, no dependencies - safe to parallelize
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group of related tasks
- Stop at any checkpoint to validate story independently
- Focus on spec-driven development: implement requirements, validate with acceptance criteria
- Responsive design (US5) is integrated into all frontend components, not a separate phase
- Data persistence (US4) is built into database setup and all CRUD operations
