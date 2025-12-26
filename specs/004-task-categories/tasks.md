# Tasks: Task Categories System

**Input**: Design documents from `/specs/004-task-categories/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `phase-2-web/backend/` and `phase-2-web/frontend/`
- Backend: Python/FastAPI in `phase-2-web/backend/app/`
- Frontend: Next.js/React in `phase-2-web/frontend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and database migration setup

- [ ] T001 Create migration file for categories table at phase-2-web/backend/migrations/002_create_categories_table.sql
- [ ] T002 Create migration file for adding category_id to tasks at phase-2-web/backend/migrations/003_add_category_to_tasks.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and database schema that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create Category model (SQLModel) in phase-2-web/backend/app/models/category.py
- [ ] T004 Update Task model to add category_id field in phase-2-web/backend/app/models/task.py
- [ ] T005 Run database migrations to create categories table and add category_id column to tasks
- [ ] T006 [P] Create Category TypeScript interface in phase-2-web/frontend/types/category.ts
- [ ] T007 Update Task TypeScript interface to add category_id field in phase-2-web/frontend/types/task.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Custom Category (Priority: P1) 🎯 MVP

**Goal**: Enable users to create categories with names and colors for organizing tasks

**Independent Test**: Authenticate as a user, create a category named "Work" with blue color (#3B82F6), verify it appears in the user's category list with correct name and color

### Implementation for User Story 1

- [ ] T008 [US1] Implement POST /api/categories endpoint in phase-2-web/backend/app/routers/categories.py
- [ ] T009 [US1] Add category name uniqueness validation (per user) in categories router
- [ ] T010 [US1] Add color validation (hex format or null) in categories router
- [ ] T011 [US1] Add default color assignment (#9CA3AF) when color not provided
- [ ] T012 [US1] Implement GET /api/categories endpoint (list user's categories) in phase-2-web/backend/app/routers/categories.py
- [ ] T013 [US1] Register categories router in phase-2-web/backend/app/main.py
- [ ] T014 [P] [US1] Add createCategory API method in phase-2-web/frontend/lib/api.ts
- [ ] T015 [P] [US1] Add getCategories API method in phase-2-web/frontend/lib/api.ts
- [ ] T016 [US1] Create CategoryManager component with create form in phase-2-web/frontend/components/CategoryManager.tsx
- [ ] T017 [US1] Add category list display to CategoryManager component
- [ ] T018 [US1] Add color picker input to category creation form
- [ ] T019 [US1] Add error handling for duplicate names and validation errors
- [ ] T020 [US1] Integrate CategoryManager component into tasks page at phase-2-web/frontend/app/(app)/tasks/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can create and view categories

---

## Phase 4: User Story 2 - Assign Tasks to Categories (Priority: P1)

**Goal**: Enable users to assign tasks to categories for organization

**Independent Test**: Create a "Work" category, create a task "Prepare presentation", assign it to "Work", verify the task shows its category association

### Implementation for User Story 2

- [ ] T021 [US2] Update POST /api/tasks endpoint to accept category_id in request body in phase-2-web/backend/app/routers/tasks.py
- [ ] T022 [US2] Update PUT /api/tasks/{id} endpoint to accept category_id in request body in phase-2-web/backend/app/routers/tasks.py
- [ ] T023 [US2] Add validation to verify category exists and belongs to current user in tasks router
- [ ] T024 [US2] Update GET /api/tasks endpoint to include category_id in response
- [ ] T025 [P] [US2] Update TaskForm component to add category dropdown selector in phase-2-web/frontend/components/TaskForm.tsx
- [ ] T026 [US2] Load user's categories in TaskForm component on mount
- [ ] T027 [US2] Include category_id in create/update task payload from TaskForm
- [ ] T028 [P] [US2] Update TaskItem component to display category badge in phase-2-web/frontend/components/TaskItem.tsx
- [ ] T029 [US2] Add category color styling to category badge in TaskItem
- [ ] T030 [US2] Display "Uncategorized" label when task has no category

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can create categories and assign tasks to them

---

## Phase 5: User Story 3 - Filter Tasks by Category (Priority: P2)

**Goal**: Enable users to filter task list to show only tasks in a specific category

**Independent Test**: Create 3 tasks (2 in "Work" category, 1 in "Personal"), apply filter for "Work", verify only the 2 work tasks appear

### Implementation for User Story 3

- [ ] T031 [US3] Add category_id query parameter to GET /api/tasks endpoint in phase-2-web/backend/app/routers/tasks.py
- [ ] T032 [US3] Implement category filtering logic in tasks query
- [ ] T033 [P] [US3] Update getTasks API method to accept category_id parameter in phase-2-web/frontend/lib/api.ts
- [ ] T034 [US3] Add category filter dropdown to TaskList component in phase-2-web/frontend/components/TaskList.tsx
- [ ] T035 [US3] Add "All Categories" option to filter dropdown
- [ ] T036 [US3] Implement filter state management with useState hook
- [ ] T037 [US3] Update task list fetching to use selected category filter
- [ ] T038 [US3] Add empty state message "No tasks in this category" when filtered list is empty

**Checkpoint**: All core functionality complete - users can create categories, assign tasks, and filter by category

---

## Phase 6: User Story 4 - Update Category Details (Priority: P2)

**Goal**: Enable users to rename categories and change their colors

**Independent Test**: Create a "Work" category with blue color, rename it to "Office" and change color to green, verify all tasks previously in "Work" now show "Office" with green color

### Implementation for User Story 4

- [ ] T039 [US4] Implement PUT /api/categories/{id} endpoint in phase-2-web/backend/app/routers/categories.py
- [ ] T040 [US4] Add ownership validation (user can only update own categories)
- [ ] T041 [US4] Add uniqueness validation for renamed categories (exclude current category)
- [ ] T042 [US4] Add updated_at timestamp auto-update on category modification
- [ ] T043 [P] [US4] Add updateCategory API method in phase-2-web/frontend/lib/api.ts
- [ ] T044 [US4] Add edit mode to CategoryManager component for renaming
- [ ] T045 [US4] Add color picker for changing category color in edit mode
- [ ] T046 [US4] Add save/cancel buttons for category editing
- [ ] T047 [US4] Refresh task list after category update to show new name/color

**Checkpoint**: Users can now fully manage their categories including updates

---

## Phase 7: User Story 5 - Delete Unused Categories (Priority: P3)

**Goal**: Enable users to delete categories they no longer need while preserving tasks

**Independent Test**: Create "Temporary" category, assign 2 tasks to it, delete the category, verify category is gone but 2 tasks remain as uncategorized

### Implementation for User Story 5

- [ ] T048 [US5] Implement DELETE /api/categories/{id} endpoint in phase-2-web/backend/app/routers/categories.py
- [ ] T049 [US5] Add ownership validation (user can only delete own categories)
- [ ] T050 [US5] Verify ON DELETE SET NULL cascade works correctly (tasks become uncategorized)
- [ ] T051 [P] [US5] Add deleteCategory API method in phase-2-web/frontend/lib/api.ts
- [ ] T052 [US5] Add delete button to CategoryManager component
- [ ] T053 [US5] Add confirmation dialog before category deletion
- [ ] T054 [US5] Clear category filter if currently filtered category is deleted
- [ ] T055 [US5] Refresh category list and task list after deletion
- [ ] T056 [US5] Show success message "Category deleted successfully"

**Checkpoint**: All user stories complete - full category management system functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T057 [P] Update CLAUDE.md with category system implementation details
- [ ] T058 [P] Add API documentation comments to all category endpoints
- [ ] T059 Test user isolation (user A cannot see user B's categories)
- [ ] T060 Test duplicate category name prevention
- [ ] T061 Test category deletion preserves tasks (0% data loss verification)
- [ ] T062 Test with 50+ categories to verify performance (success criteria SC-007)
- [ ] T063 Verify all category operations complete within 2 seconds (success criteria SC-008)
- [ ] T064 Run quickstart.md test scenarios for validation
- [ ] T065 [P] Add error boundary for category operations in frontend
- [ ] T066 Code cleanup and refactoring across category components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 (uses categories created in US1)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Integrates with US1 and US2 (filters categories and tasks)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Independent but uses category CRUD from US1
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independent but uses category CRUD from US1

### Within Each User Story

- Backend endpoints before frontend API methods
- API methods before UI components
- Core functionality before error handling and polish
- Story complete and tested before moving to next priority

### Parallel Opportunities

- **Setup (Phase 1)**: Both migration files (T001, T002) can be created in parallel
- **Foundational (Phase 2)**: Model creation tasks (T003, T004, T006, T007) can run in parallel
- **User Story 1**: Frontend API methods (T014, T015) can be created in parallel
- **User Story 2**: TaskForm updates (T025) and TaskItem updates (T028) can run in parallel
- **User Story 3**: Backend filtering (T031-T032) and frontend API update (T033) can run in parallel
- **User Story 4**: Frontend updateCategory method (T043) can be created while backend is being implemented
- **User Story 5**: Frontend deleteCategory method (T051) can be created while backend is being implemented
- **Polish**: Documentation tasks (T057, T058, T065) can run in parallel with testing tasks

---

## Parallel Example: User Story 1

```bash
# After T007 complete, launch these together:
Task: "Add createCategory API method in phase-2-web/frontend/lib/api.ts" (T014)
Task: "Add getCategories API method in phase-2-web/frontend/lib/api.ts" (T015)
```

---

## Parallel Example: User Story 2

```bash
# After backend endpoints complete (T021-T024), launch these together:
Task: "Update TaskForm component to add category dropdown selector" (T025)
Task: "Update TaskItem component to display category badge" (T028)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T007) - CRITICAL
3. Complete Phase 3: User Story 1 (T008-T020)
4. Complete Phase 4: User Story 2 (T021-T030)
5. **STOP and VALIDATE**: Test category creation and task assignment independently
6. Deploy/demo if ready - **This is a minimal viable category system**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Users can create and view categories
3. Add User Story 2 → Test independently → Users can assign tasks to categories (MVP!)
4. Add User Story 3 → Test independently → Users can filter tasks by category
5. Add User Story 4 → Test independently → Users can rename/recolor categories
6. Add User Story 5 → Test independently → Users can delete categories
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phase 1-2)
2. Once Foundational is done:
   - Developer A: User Story 1 (Category CRUD)
   - Developer B: User Story 2 (Task assignment) - waits for US1 backend complete
   - Developer C: User Story 3 (Filtering) - waits for US1 and US2 backend complete
3. User Stories 4 and 5 can be implemented by any developer after US1 is complete
4. Stories integrate and test independently

---

## Task Count Summary

- **Total Tasks**: 66
- **Setup Phase**: 2 tasks
- **Foundational Phase**: 5 tasks (BLOCKING)
- **User Story 1 (P1)**: 13 tasks (MVP - Create categories)
- **User Story 2 (P1)**: 10 tasks (MVP - Assign tasks)
- **User Story 3 (P2)**: 8 tasks (Filtering)
- **User Story 4 (P2)**: 9 tasks (Update categories)
- **User Story 5 (P3)**: 9 tasks (Delete categories)
- **Polish Phase**: 10 tasks (Testing + documentation)

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Suggested MVP Scope**: Complete Phase 1, Phase 2, Phase 3 (US1), and Phase 4 (US2) for a functional category system with creation and assignment capabilities (30 total tasks)

---

## Independent Test Criteria

Each user story can be tested independently:

- **US1**: Create "Work" category → Verify it appears in category list
- **US2**: Assign task to "Work" → Verify task shows "Work" badge
- **US3**: Filter by "Work" → Verify only work tasks shown
- **US4**: Rename "Work" to "Office" → Verify tasks show "Office"
- **US5**: Delete "Office" → Verify category gone, tasks preserved

---

## Notes

- [P] tasks = different files, no dependencies within same phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database migrations MUST be run (T005) before any API implementation
- All backend endpoints include user isolation via JWT authentication
- Frontend uses Better Auth for authentication context
