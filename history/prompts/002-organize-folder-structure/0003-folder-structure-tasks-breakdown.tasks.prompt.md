---
id: 0003
title: Folder Structure Tasks Breakdown
stage: tasks
date: 2025-12-23
surface: cli
model: claude-sonnet-4-5-20250929
feature: 002-organize-folder-structure
branch: 002-organize-folder-structure
user: external
command: sp.tasks
labels: [task-generation, file-operations, git-mv, user-story-mapping]
links:
  spec: specs/002-organize-folder-structure/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/002-organize-folder-structure/tasks.md
    status: created
tests:
  - name: Task Format Validation
    command: Manual review
    status: passed
  - name: User Story Mapping
    command: Manual review
    status: passed
---

## Prompt

Execute sp.tasks workflow for feature 002-organize-folder-structure. Generate task breakdown based on plan.md, spec.md, research.md, and contracts/file-moves.json.

Context: Plan completed with comprehensive research and contracts. Feature involves 22 file operations organized by 5 user stories (priorities P1, P2, P3). This is a file operations task, not code development.

User stories to map:
- US1: Migration Files Organization (P1) - 10 file moves
- US2: Auth Routes Consolidation (P1) - 3 directory moves
- US3: Documentation Centralization (P2) - 2 file moves
- US4: Component Naming Clarity (P2) - 1 rename + import updates
- US5: Repository Cleanup (P3) - .gitignore updates

## Response snapshot

Successfully generated comprehensive task breakdown with 70 atomic tasks organized by user story:

**Tasks File**: `specs/002-organize-folder-structure/tasks.md` (702 lines)

**Task Organization**:
- **Phase 1**: Setup & Preparation (5 tasks)
- **Phase 2**: Foundational - Create Directories (4 tasks)
- **Phase 3**: User Story 1 - Migration Files (P1) (14 tasks)
- **Phase 4**: User Story 2 - Auth Routes (P1) (10 tasks)
- **Phase 5**: User Story 3 - Documentation (P2) (4 tasks)
- **Phase 6**: User Story 4 - Component Naming (P2) (7 tasks)
- **Phase 7**: User Story 5 - Repository Cleanup (P3) (5 tasks)
- **Phase 8**: Verification & Testing (16 tasks)
- **Phase 9**: Commit & Finalize (5 tasks)

**Task Breakdown Details**:

**User Story 1 (P1 - Migration Files)** - 14 tasks:
- T010-T019: [P] Move 10 migration files using git mv (parallelizable)
- T020-T021: Verify migrations moved correctly
- T022-T023: Create and stage migration README

**User Story 2 (P1 - Auth Routes)** - 10 tasks:
- T024-T025: [P] Move forgot-password and reset-password to (auth)/
- T026: Move OAuth callback (⚠️ BREAKING CHANGE: /auth/callback → /callback)
- T027: Remove empty auth/ directory
- T028-T031: Verify all auth pages consolidated
- T032-T033: Search and update hardcoded auth paths

**User Story 3 (P2 - Documentation)** - 4 tasks:
- T034-T035: [P] Move 2 Better Auth docs to /docs/
- T036-T037: Verify documentation centralized

**User Story 4 (P2 - Component Naming)** - 7 tasks:
- T038-T040: Search for TaskList imports and usage
- T041: Rename TaskList.tsx → TaskListOld.tsx
- T042: Add deprecation comment
- T043-T044: Update imports and verify

**User Story 5 (P3 - Repository Cleanup)** - 5 tasks:
- T045-T046: [P] Add log and OS artifact patterns to .gitignore
- T047-T048: Verify .gitignore working
- T049: [P] Move large spec file (optional)

**Verification & Testing** (16 tasks):
- T050-T052: TypeScript build verification
- T053-T055: Run automated verification script
- T056-T058: Git verification (renames, history preservation)
- T059-T065: Manual testing (start servers, test OAuth, test auth flows)

**Commit & Finalize** (5 tasks):
- T066-T068: Stage changes and commit
- T069-T070: Verify commit and history preservation

**Task Format Compliance**:
- ✅ All 70 tasks follow strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description`
- ✅ All tasks include exact file paths or bash commands
- ✅ All user story tasks labeled [US1], [US2], [US3], [US4], [US5]
- ✅ All parallelizable tasks marked with [P]
- ✅ Sequential task IDs (T001-T070)

**Parallel Opportunities Identified**:
- Phase 2: 3 directory creation tasks can run in parallel
- US1: All 10 migration file moves can run in parallel (T010-T019)
- US2: First 2 auth moves can run in parallel (T024-T025)
- US3: Both doc moves can run in parallel (T034-T035)
- US5: Both .gitignore updates can run in parallel (T045-T046)
- **Cross-Story**: After Phase 2, all 5 user stories can proceed in parallel (33 tasks)

**Dependencies Documented**:
- Setup → Foundational → User Stories (all independent) → Verification → Commit
- User Story 1: No dependencies on other stories ✅
- User Story 2: No dependencies on other stories ✅
- User Story 3: No dependencies on other stories ✅
- User Story 4: May check imports after US2 (optional dependency)
- User Story 5: No dependencies on other stories ✅

**Implementation Strategies Provided**:
1. **MVP First** (US1 + US2 only - both P1)
2. **Incremental Delivery** (P1 → P2 → P3)
3. **Parallel Team** (5 developers, 1 story each)
4. **All-At-Once** (not recommended)

**Critical Warnings Documented**:
- ⚠️ BREAKING CHANGE: OAuth callback URL changes from /auth/callback to /callback (T026, T062)
- Must test auth flow manually after reorganization
- Must verify TypeScript build succeeds
- Must verify git history preserved

**Success Metrics**:
- All 6 success criteria (SC-001 through SC-006) mapped to verification tasks
- All 5 functional requirements (FR-001 through FR-005) mapped to implementation tasks
- Independent test criteria provided for each user story

## Outcome

- ✅ Impact: Complete task breakdown ready for execution, all 22 file operations from contracts mapped to atomic tasks, clear execution paths (MVP, incremental, parallel) defined
- 🧪 Tests: No automated tests (file operations feature), manual verification via build success (T050) and verification script (T053), manual OAuth testing (T059-T065)
- 📁 Files: Created tasks.md (702 lines, 70 tasks, 9 phases), all tasks traceable to user stories and file-moves.json operations
- 🔁 Next prompts: sp.implement (execute tasks via LLM agent), manual execution (follow quickstart.md + tasks.md), sp.adr (document architectural decisions if needed)
- 🧠 Reflection: This task breakdown is unusual - normally tasks involve writing code (models, services, endpoints), but this feature is purely file operations (git mv, mkdir, rmdir, edit .gitignore). Organized by user story to enable independent verification of each organizational goal. Heavy emphasis on verification tasks (16 tasks) because breaking imports or OAuth is high-risk. Manual testing is critical and explicitly tasked.

## Evaluation notes (flywheel)

- Failure modes observed: None - task generation successful on first attempt
- Graders run and results (PASS/FAIL): Task Format Validation - PASS (all 70 tasks follow checklist format), User Story Mapping - PASS (all 5 user stories properly mapped)
- Prompt variant (if applicable): Standard sp.tasks workflow adapted for file operations (no model/service/endpoint tasks, emphasis on git mv and verification)
- Next experiment (smallest change to try): Execute tasks using sp.implement command, starting with MVP scope (Setup + Foundational + US1 + US2 = first 33 tasks), verify OAuth callback works after reorganization
