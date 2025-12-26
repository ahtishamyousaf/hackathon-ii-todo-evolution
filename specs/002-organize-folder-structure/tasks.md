# Tasks: Organize Project Folder Structure

**Input**: Design documents from `/specs/002-organize-folder-structure/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/file-moves.json, quickstart.md

**Tests**: No automated tests for this feature - verification is manual via build success and verification script

**Organization**: Tasks are grouped by user story (5 total) representing different organizational goals. This is a file operations feature, not code development.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Web application (Next.js frontend + FastAPI backend)
- **Paths**: All relative to repository root `/home/ahtisham/hackathon-2/`
- **Git operations**: Use `git mv` to preserve history
- **File operations**: Via bash commands from quickstart.md

## Phase 1: Setup & Preparation

**Purpose**: Verify prerequisites and prepare for file operations

- [ ] T001 Verify on branch `002-organize-folder-structure` using `git branch --show-current`
- [ ] T002 Verify working directory is clean using `git status` (no uncommitted changes)
- [ ] T003 Verify frontend builds successfully by running `cd phase-2-web/frontend && npm run build`
- [ ] T004 Review plan.md, research.md, and quickstart.md for context
- [ ] T005 Review contracts/file-moves.json for complete operation list (22 operations)

**Checkpoint**: Prerequisites verified - safe to begin file operations

---

## Phase 2: Foundational (Create Directories)

**Purpose**: Create new directories that will receive moved files

**⚠️ CRITICAL**: All directories must exist before moving files into them

- [ ] T006 Create migrations directory: `mkdir -p phase-2-web/backend/app/migrations`
- [ ] T007 Create docs directory: `mkdir -p phase-2-web/docs`
- [ ] T008 [P] Create hackathon docs directory (optional): `mkdir -p docs/hackathon`
- [ ] T009 Verify directories created using `ls -ld` for each directory

**Checkpoint**: All target directories exist - ready for file moves

---

## Phase 3: User Story 1 - Migration Files Organization (Priority: P1) 🎯 MVP

**Goal**: Organize all database migration files in dedicated `/backend/app/migrations/` directory

**Independent Test**:
- Success: `ls phase-2-web/backend/app/migrations/` shows 10 files
- Success: `ls phase-2-web/backend/*.py | grep migration` returns empty (no migrations in root)

### Implementation for User Story 1

- [ ] T010 [P] [US1] Move add_attachments_migration.py: `git mv phase-2-web/backend/add_attachments_migration.py phase-2-web/backend/app/migrations/`
- [ ] T011 [P] [US1] Move add_categories_migration.py: `git mv phase-2-web/backend/add_categories_migration.py phase-2-web/backend/app/migrations/`
- [ ] T012 [P] [US1] Move add_comments_migration.py: `git mv phase-2-web/backend/add_comments_migration.py phase-2-web/backend/app/migrations/`
- [ ] T013 [P] [US1] Move add_due_date_migration.py: `git mv phase-2-web/backend/add_due_date_migration.py phase-2-web/backend/app/migrations/`
- [ ] T014 [P] [US1] Move add_oauth_migration.py: `git mv phase-2-web/backend/add_oauth_migration.py phase-2-web/backend/app/migrations/`
- [ ] T015 [P] [US1] Move add_password_reset_migration.py: `git mv phase-2-web/backend/add_password_reset_migration.py phase-2-web/backend/app/migrations/`
- [ ] T016 [P] [US1] Move add_priority_column.sql: `git mv phase-2-web/backend/add_priority_column.sql phase-2-web/backend/app/migrations/`
- [ ] T017 [P] [US1] Move add_priority_migration.py: `git mv phase-2-web/backend/add_priority_migration.py phase-2-web/backend/app/migrations/`
- [ ] T018 [P] [US1] Move add_recurring_tasks_migration.py: `git mv phase-2-web/backend/add_recurring_tasks_migration.py phase-2-web/backend/app/migrations/`
- [ ] T019 [P] [US1] Move add_subtasks_migration.py: `git mv phase-2-web/backend/add_subtasks_migration.py phase-2-web/backend/app/migrations/`
- [ ] T020 [US1] Verify 10 files in migrations directory: `ls -1 phase-2-web/backend/app/migrations/ | wc -l` (should be 10)
- [ ] T021 [US1] Verify 0 migration files in backend root: `ls -1 phase-2-web/backend/*.py | grep migration | wc -l` (should be 0)
- [ ] T022 [US1] Create migration README.md in phase-2-web/backend/app/migrations/README.md documenting execution order
- [ ] T023 [US1] Stage migration README: `git add phase-2-web/backend/app/migrations/README.md`

**Checkpoint**: User Story 1 complete - SC-001 satisfied (zero migration files in backend root)

---

## Phase 4: User Story 2 - Auth Routes Consolidation (Priority: P1)

**Goal**: Consolidate all authentication pages under `/(auth)/` route group per Next.js conventions

**Independent Test**:
- Success: `ls -1d phase-2-web/frontend/app/(auth)/*/` shows 5 directories (login, register, callback, forgot-password, reset-password)
- Success: `ls -1d phase-2-web/frontend/app/auth 2>/dev/null` returns error (directory removed)
- Success: `ls -1d phase-2-web/frontend/app/forgot-password 2>/dev/null` returns error (moved)

**⚠️ BREAKING CHANGE**: OAuth callback URL changes from `/auth/callback` to `/callback`

### Implementation for User Story 2

- [ ] T024 [P] [US2] Move forgot-password to (auth): `git mv phase-2-web/frontend/app/forgot-password "phase-2-web/frontend/app/(auth)/"`
- [ ] T025 [P] [US2] Move reset-password to (auth): `git mv phase-2-web/frontend/app/reset-password "phase-2-web/frontend/app/(auth)/"`
- [ ] T026 [US2] Move OAuth callback to (auth): `git mv phase-2-web/frontend/app/auth/callback "phase-2-web/frontend/app/(auth)/"`
- [ ] T027 [US2] Remove empty auth directory: `rmdir phase-2-web/frontend/app/auth`
- [ ] T028 [US2] Verify 5 auth pages in (auth): `ls -1d "phase-2-web/frontend/app/(auth)/"*/ | wc -l` (should be 5)
- [ ] T029 [US2] Verify /app/auth removed: `[ ! -d phase-2-web/frontend/app/auth ] && echo "Removed" || echo "ERROR: Still exists"`
- [ ] T030 [US2] Verify forgot-password not at root: `[ ! -d phase-2-web/frontend/app/forgot-password ] && echo "Moved" || echo "ERROR: Still at root"`
- [ ] T031 [US2] Verify reset-password not at root: `[ ! -d phase-2-web/frontend/app/reset-password ] && echo "Moved" || echo "ERROR: Still at root"`
- [ ] T032 [US2] Search for hardcoded auth paths: `grep -r "forgot-password" phase-2-web/frontend/app/ phase-2-web/frontend/components/`
- [ ] T033 [US2] Update any hardcoded paths found in T032 (if any)

**Checkpoint**: User Story 2 complete - SC-002 satisfied (all auth pages under (auth)/ route group)

---

## Phase 5: User Story 3 - Documentation Centralization (Priority: P2)

**Goal**: Centralize all project documentation in `/phase-2-web/docs/` directory

**Independent Test**:
- Success: `ls -1 phase-2-web/docs/` shows 2 files (BETTER_AUTH_SETUP.md, BETTER_AUTH_QUICK_REFERENCE.md)
- Success: `ls -1 phase-2-web/frontend/BETTER_AUTH*.md 2>/dev/null` returns error (files moved)

### Implementation for User Story 3

- [ ] T034 [P] [US3] Move BETTER_AUTH_SETUP.md: `git mv phase-2-web/frontend/BETTER_AUTH_SETUP.md phase-2-web/docs/`
- [ ] T035 [P] [US3] Move BETTER_AUTH_QUICK_REFERENCE.md: `git mv phase-2-web/frontend/BETTER_AUTH_QUICK_REFERENCE.md phase-2-web/docs/`
- [ ] T036 [US3] Verify 2 files in docs: `ls -1 phase-2-web/docs/ | wc -l` (should be 2)
- [ ] T037 [US3] Verify docs not in frontend root: `ls -1 phase-2-web/frontend/BETTER_AUTH*.md 2>/dev/null | wc -l` (should be 0)

**Checkpoint**: User Story 3 complete - SC-003 satisfied (all documentation in /docs/)

---

## Phase 6: User Story 4 - Component Naming Clarity (Priority: P2)

**Goal**: Resolve TaskList vs TasksList naming confusion by deprecating TaskList

**Independent Test**:
- Success: TaskListOld.tsx exists with deprecation comment
- Success: TasksList.tsx remains unchanged
- Success: No import errors for "TaskList" (all references updated or removed)

### Implementation for User Story 4

- [ ] T038 [US4] Search for TaskList imports: `grep -r "from.*TaskList" phase-2-web/frontend/ --include="*.tsx" --include="*.ts"`
- [ ] T039 [US4] Search for TaskList component usage: `grep -r "import.*TaskList" phase-2-web/frontend/ --include="*.tsx" --include="*.ts"`
- [ ] T040 [US4] Document search results from T038 and T039 (note file paths for potential updates)
- [ ] T041 [US4] Rename TaskList.tsx to TaskListOld.tsx: `git mv phase-2-web/frontend/components/TaskList.tsx phase-2-web/frontend/components/TaskListOld.tsx`
- [ ] T042 [US4] Add deprecation comment to phase-2-web/frontend/components/TaskListOld.tsx header
- [ ] T043 [US4] Update any imports found in T038/T039 to use TasksList instead (if needed)
- [ ] T044 [US4] Verify component naming: `ls -1 phase-2-web/frontend/components/Task*.tsx`

**Checkpoint**: User Story 4 complete - FR-004 satisfied (component naming clarified)

---

## Phase 7: User Story 5 - Repository Cleanup (Priority: P3)

**Goal**: Configure .gitignore to exclude log files and OS artifacts from git tracking

**Independent Test**:
- Success: `grep "\.log" .gitignore` finds pattern
- Success: `grep "Zone\.Identifier" .gitignore` finds pattern
- Success: `git status` shows backend.log and Zone.Identifier files as ignored (if they exist)

### Implementation for User Story 5

- [ ] T045 [P] [US5] Add log file patterns to .gitignore: `echo -e "\n# Log files\n*.log\nbackend.log" >> .gitignore`
- [ ] T046 [P] [US5] Add OS artifact patterns to .gitignore: `echo -e "\n# OS artifacts\n*:Zone.Identifier\n.DS_Store" >> .gitignore`
- [ ] T047 [US5] Verify .gitignore updated: `grep -E "(\.log|Zone\.Identifier|DS_Store)" .gitignore`
- [ ] T048 [US5] Test .gitignore effectiveness: `git status` (log files should not appear as untracked)
- [ ] T049 [P] [US5] Move large spec file (optional): `git mv "Hackathon II - Todo Spec-Driven Development.md" docs/hackathon/` (if directory created in T008)

**Checkpoint**: User Story 5 complete - SC-005 satisfied (.gitignore excludes log files)

---

## Phase 8: Verification & Testing

**Purpose**: Verify all file operations completed successfully and nothing broke

### Build Verification

- [ ] T050 Run TypeScript build: `cd phase-2-web/frontend && npm run build` (exit code must be 0)
- [ ] T051 Review build output for any import errors or warnings
- [ ] T052 If build fails: identify broken imports using error messages, fix using grep to find references, re-run build

### Automated Verification

- [ ] T053 Run verification script: `bash specs/002-organize-folder-structure/contracts/verification.sh`
- [ ] T054 Review verification output - all checks should show ✅ PASS
- [ ] T055 If verification fails: review error messages, fix issues, re-run verification

### Git Verification

- [ ] T056 Review all staged changes: `git status` (should show ~20 renames)
- [ ] T057 Verify git recognizes moves as renames: `git diff --cached --name-status | grep "^R"` (should show R not D/A)
- [ ] T058 Verify migration file history preserved: `git log --follow --oneline phase-2-web/backend/app/migrations/add_categories_migration.py`

### Manual Testing (CRITICAL)

- [ ] T059 Start backend server: `cd phase-2-web/backend && uvicorn app.main:app --reload`
- [ ] T060 Start frontend dev server: `cd phase-2-web/frontend && npm run dev`
- [ ] T061 Navigate to http://localhost:3000 and verify app loads
- [ ] T062 Test login flow - verify OAuth callback works at /callback (not /auth/callback)
- [ ] T063 Test forgot-password flow - verify route works at /forgot-password
- [ ] T064 Test reset-password flow - verify route works at /reset-password
- [ ] T065 Stop both servers after manual testing complete

---

## Phase 9: Commit & Finalize

**Purpose**: Commit all changes with comprehensive commit message

- [ ] T066 Stage .gitignore changes: `git add .gitignore`
- [ ] T067 Verify all changes staged: `git status --short` (should show mostly R, some M, some A)
- [ ] T068 Commit with comprehensive message (see quickstart.md for commit template)
- [ ] T069 Verify commit created: `git log -1 --stat`
- [ ] T070 Verify git history preserved for sample file: `git log --follow --oneline phase-2-web/backend/app/migrations/add_categories_migration.py | wc -l` (should be >0)

**Checkpoint**: Feature 002 complete - all constitution violations resolved, folder structure compliant

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T005) - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (T006-T009) completion
  - User stories CAN proceed in parallel (same files not modified)
  - Or sequentially in priority order (P1 → P1 → P2 → P2 → P3)
- **Verification (Phase 8)**: Depends on all user stories (T010-T049) being complete
- **Commit (Phase 9)**: Depends on verification (T050-T065) passing

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 - No dependencies on other stories ✅ Independent
- **User Story 2 (P1)**: Depends on Phase 2 - No dependencies on other stories ✅ Independent
- **User Story 3 (P2)**: Depends on Phase 2 - No dependencies on other stories ✅ Independent
- **User Story 4 (P2)**: Depends on Phase 2 - May need to check imports after US2 completes
- **User Story 5 (P3)**: Depends on Phase 2 - No dependencies on other stories ✅ Independent

**Key Insight**: All 5 user stories are independent - they modify different files and can be implemented in any order or in parallel.

### Within Each User Story

- **US1**: All T010-T019 are [P] parallelizable (moving different files)
- **US2**: T024-T025 are [P] parallelizable (moving different directories)
- **US3**: T034-T035 are [P] parallelizable (moving different files)
- **US4**: Sequential (search → rename → update imports)
- **US5**: T045-T046 are [P] parallelizable (updating different sections of .gitignore)

### Parallel Opportunities

- **Phase 2**: All directory creation (T006-T008) can run in parallel
- **Phase 3**: All 10 migration file moves (T010-T019) can run in parallel
- **Phase 4**: First 2 auth moves (T024-T025) can run in parallel
- **Phase 5**: Both doc moves (T034-T035) can run in parallel
- **Phase 7**: Both .gitignore updates (T045-T046) can run in parallel
- **Cross-Story**: After Phase 2, US1-US5 can all proceed in parallel (different files)

---

## Parallel Example: User Story 1 (Migration Files)

```bash
# Launch all 10 migration file moves in parallel:
Task: "Move add_attachments_migration.py" &
Task: "Move add_categories_migration.py" &
Task: "Move add_comments_migration.py" &
Task: "Move add_due_date_migration.py" &
Task: "Move add_oauth_migration.py" &
Task: "Move add_password_reset_migration.py" &
Task: "Move add_priority_column.sql" &
Task: "Move add_priority_migration.py" &
Task: "Move add_recurring_tasks_migration.py" &
Task: "Move add_subtasks_migration.py" &
wait  # Wait for all moves to complete

# Then verify and create README sequentially
Task: "Verify 10 files in migrations directory"
Task: "Create migration README.md"
```

---

## Parallel Example: All User Stories After Foundational

```bash
# After Phase 2 completes, launch all user stories in parallel:
Task: "US1 - Move all migration files (T010-T023)" &
Task: "US2 - Consolidate auth routes (T024-T033)" &
Task: "US3 - Move documentation (T034-T037)" &
Task: "US4 - Rename components (T038-T044)" &
Task: "US5 - Update .gitignore (T045-T049)" &
wait  # Wait for all stories to complete

# Then run verification
Task: "Verification & Testing (T050-T065)"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only - Both P1)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009) - CRITICAL, blocks everything
3. Complete Phase 3: User Story 1 - Migration Files (T010-T023)
4. Complete Phase 4: User Story 2 - Auth Routes (T024-T033)
5. Run Phase 8: Verification (T050-T065)
6. **STOP and VALIDATE**: Both P1 user stories work, build succeeds, OAuth works
7. Commit (Phase 9) if satisfied
8. Deploy/demo if ready

### Incremental Delivery (Priority Order)

1. Complete Setup + Foundational (T001-T009) → Foundation ready
2. Add US1 + US2 (T010-T033) → Test independently → Commit → Deploy (P1 features! 🎯)
3. Add US3 + US4 (T034-T044) → Test independently → Commit → Deploy (P2 features)
4. Add US5 (T045-T049) → Test independently → Commit → Deploy (P3 features)
5. Each increment adds value without breaking previous work

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T009)
2. Once Foundational is done:
   - Developer A: User Story 1 (T010-T023)
   - Developer B: User Story 2 (T024-T033)
   - Developer C: User Story 3 (T034-T037)
   - Developer D: User Story 4 (T038-T044)
   - Developer E: User Story 5 (T045-T049)
3. Stories complete and merge independently
4. Team runs verification together (T050-T065)
5. Team commits together (T066-T070)

### All-At-Once Strategy (Not Recommended)

Complete all tasks T001-T070 sequentially in one session, then commit.

**Risk**: If anything fails late (e.g., OAuth callback breaks), must debug and potentially revert everything.

**Better**: Use MVP or Incremental approach above.

---

## Notes

- **[P] tasks** = different files, no dependencies, can run in parallel
- **[Story] label** = maps task to specific user story for traceability
- **Each user story is independently completable** - modifies different files
- **No automated tests** - this is file operations, verification via build + manual testing
- **Git mv preserves history** - critical for traceability
- **Single atomic commit** - easier rollback if needed
- **OAuth callback URL changes** - BREAKING CHANGE, test thoroughly (T062)
- **Commit after verification passes** - don't commit broken code
- **Follow quickstart.md** - detailed commands for each operation

### Task Count Summary

- **Total Tasks**: 70
- **Setup (Phase 1)**: 5 tasks
- **Foundational (Phase 2)**: 4 tasks
- **User Story 1 (P1)**: 14 tasks (10 file moves + 4 verification/documentation)
- **User Story 2 (P1)**: 10 tasks (4 file moves + 6 verification)
- **User Story 3 (P2)**: 4 tasks (2 file moves + 2 verification)
- **User Story 4 (P2)**: 7 tasks (search + rename + update + verify)
- **User Story 5 (P3)**: 5 tasks (2 gitignore updates + 3 verification)
- **Verification (Phase 8)**: 16 tasks (build + script + git + manual)
- **Commit (Phase 9)**: 5 tasks

### Parallelizable Tasks

- **Phase 2**: 3 tasks (T006-T008)
- **Phase 3**: 10 tasks (T010-T019) - all migration moves
- **Phase 4**: 2 tasks (T024-T025) - first auth moves
- **Phase 5**: 2 tasks (T034-T035) - doc moves
- **Phase 7**: 2 tasks (T045-T046) - gitignore updates
- **Cross-Story**: All 5 user stories after foundational (33 tasks total)

**Total Parallelizable**: ~19 tasks within stories + ability to run 5 stories in parallel

### Estimated Time

- **Sequential execution**: ~2-3 hours (reading, verifying, testing)
- **Parallel execution** (5 developers): ~1-1.5 hours
- **MVP only** (US1 + US2): ~1 hour

### Success Metrics

✅ All 6 success criteria from spec.md satisfied:
- SC-001: Zero migration files in backend root
- SC-002: All auth pages under (auth)/ route structure
- SC-003: All documentation in /docs/
- SC-004: Constitution validation passes
- SC-005: .gitignore excludes log files
- SC-006: Frontend build succeeds (exit code 0)

✅ All 5 functional requirements satisfied:
- FR-001: Migration files in dedicated directory
- FR-002: Auth pages under (auth)/ route group
- FR-003: Documentation centralized
- FR-004: Component naming clarified
- FR-005: Git ignore rules updated

✅ Additional quality metrics:
- Git history preserved (git log --follow works)
- OAuth callback still functions
- No broken imports
- Verification script passes
