# Tasks: Phase 1 Quick Wins & Essential UX

**Input**: Design documents from `/specs/005-quick-wins-ux/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: E2E tests included based on implementation plan requirements. These are OPTIONAL and can be skipped if test-driven development is not desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Stories follow the priority sequence from the implementation plan (Phase 1A → 1B → 1C).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with frontend/backend separation:
- **Frontend**: `phase-2-web/frontend/`
- **Backend**: `phase-2-web/backend/`
- **Tests**: `tests/frontend/` and `tests/backend/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and basic structure

- [ ] T001 Install frontend dependencies: @dnd-kit/core@^6.1.0, @dnd-kit/sortable@^8.0.0 in phase-2-web/frontend/package.json
- [ ] T002 Install frontend dependencies: react-dropzone@^14.2.0, date-fns@^3.0.0 in phase-2-web/frontend/package.json
- [ ] T003 [P] Verify backend uploads directory exists at phase-2-web/backend/uploads/ and create if missing
- [ ] T004 [P] Add uploads/ to .gitignore in phase-2-web/backend/.gitignore
- [ ] T005 [P] Create TypeScript types directory structure: phase-2-web/frontend/types/ (filter.ts, keyboard.ts, bulkOperation.ts)
- [ ] T006 [P] Create frontend utilities directory structure: phase-2-web/frontend/utils/ (filterParser.ts, fileHelpers.ts, dateHelpers.ts, keyboardHelpers.ts)
- [ ] T007 [P] Create frontend hooks directory structure: phase-2-web/frontend/hooks/
- [ ] T008 [P] Create backend migration file: phase-2-web/backend/migrations/005_add_task_sort_order.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T009 Run database migration to add sort_order column: execute phase-2-web/backend/migrations/005_add_task_sort_order.py
- [ ] T010 Update Task model with sort_order field in phase-2-web/backend/app/models/task.py
- [ ] T011 Update Task type with sort_order field in phase-2-web/frontend/types/task.ts
- [ ] T012 [P] Update TaskCreate schema with optional sort_order in phase-2-web/backend/app/schemas/task.py
- [ ] T013 [P] Update TaskUpdate schema with optional sort_order in phase-2-web/backend/app/schemas/task.py
- [ ] T014 [P] Create bulk operation schemas in phase-2-web/backend/app/schemas/bulk.py (BulkUpdateRequest, BulkUpdateResponse)
- [ ] T015 [P] Create search filter schemas in phase-2-web/backend/app/schemas/search.py (SearchRequest, FilterParams)
- [ ] T016 [P] Create query builder utility in phase-2-web/backend/app/utils/query_builder.py for filter parsing

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Keyboard Shortcuts System (Priority: P1, Week 1) 🎯 MVP

**Goal**: Implement global keyboard shortcuts for common actions (N for new task, / for search, arrows for navigation, Enter/Space/Delete for task actions)

**Independent Test**:
1. Press 'N' anywhere in app → new task modal opens
2. Press '/' anywhere → search bar focused
3. Navigate task list with arrows, press Space → task completion toggles
4. Shortcuts don't trigger when typing in input fields

### E2E Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T017 [P] [US1] Create E2E test for global shortcuts in tests/frontend/e2e/keyboard-shortcuts.spec.ts (N, /, Esc)
- [ ] T018 [P] [US1] Create E2E test for task list navigation in tests/frontend/e2e/keyboard-shortcuts.spec.ts (arrows, Enter, Space, Delete)
- [ ] T019 [P] [US1] Create E2E test for input field exclusion in tests/frontend/e2e/keyboard-shortcuts.spec.ts

### Implementation for User Story 1

- [ ] T020 [P] [US1] Create keyboard types in phase-2-web/frontend/types/keyboard.ts (KeyBinding, ShortcutAction, ShortcutConfig)
- [ ] T021 [P] [US1] Create keyboard helper utilities in phase-2-web/frontend/utils/keyboardHelpers.ts (isInputFocused, parseKeyEvent)
- [ ] T022 [US1] Create KeyboardShortcutsContext in phase-2-web/frontend/contexts/KeyboardShortcutsContext.tsx with provider and hooks
- [ ] T023 [US1] Create useKeyboardShortcut hook in phase-2-web/frontend/hooks/useKeyboardShortcut.ts
- [ ] T024 [US1] Wrap app with KeyboardShortcutsProvider in phase-2-web/frontend/app/layout.tsx
- [ ] T025 [US1] Add keyboard navigation to TasksList in phase-2-web/frontend/components/TasksList.tsx (arrow keys, focus state)
- [ ] T026 [US1] Add Enter/Space/Delete handlers to TaskItem in phase-2-web/frontend/components/TaskItem.tsx
- [ ] T027 [US1] Add global N shortcut handler for new task modal in phase-2-web/frontend/components/AppLayout.tsx
- [ ] T028 [US1] Add global / shortcut handler for search focus in phase-2-web/frontend/components/SearchBar.tsx
- [ ] T029 [US1] Create KeyboardShortcutsHelp component in phase-2-web/frontend/components/KeyboardShortcutsHelp.tsx
- [ ] T030 [US1] Add keyboard shortcuts panel to settings page in phase-2-web/frontend/app/(app)/settings/page.tsx

**Checkpoint**: Keyboard shortcuts system fully functional. Users can navigate and control app via keyboard only.

---

## Phase 4: User Story 2 - Smart Due Date Selection (Priority: P1, Week 1)

**Goal**: Add quick-select date buttons (Today, Tomorrow, Next Week, Next Month) to task creation/edit modal

**Independent Test**:
1. Open new task modal
2. Click "Tomorrow" button → date picker shows tomorrow's date
3. Click "Next Week" button → date picker shows date 7 days from now
4. Manual date selection clears button highlights

### E2E Tests for User Story 2

- [ ] T031 [P] [US2] Create E2E test for quick date buttons in tests/frontend/e2e/smart-dates.spec.ts (Today, Tomorrow, Next Week, Next Month)
- [ ] T032 [P] [US2] Create E2E test for date picker integration in tests/frontend/e2e/smart-dates.spec.ts

### Implementation for User Story 2

- [ ] T033 [P] [US2] Create date helper utilities in phase-2-web/frontend/utils/dateHelpers.ts (getToday, getTomorrow, getNextWeek, getNextMonth)
- [ ] T034 [P] [US2] Create unit tests for date helpers in tests/frontend/unit/dateHelpers.test.ts
- [ ] T035 [US2] Create SmartDatePicker component in phase-2-web/frontend/components/SmartDatePicker.tsx with quick buttons
- [ ] T036 [US2] Integrate SmartDatePicker into QuickAddModal in phase-2-web/frontend/components/QuickAddModal.tsx (replace standard date input)
- [ ] T037 [US2] Add "Clear Date" button functionality in phase-2-web/frontend/components/SmartDatePicker.tsx
- [ ] T038 [US2] Add visual feedback for active quick button in phase-2-web/frontend/components/SmartDatePicker.tsx

**Checkpoint**: Smart date selection working. Users can quickly set common due dates with one click.

---

## Phase 5: User Story 6 - Enhanced Search & Filters (Priority: P1, Week 1)

**Goal**: Implement advanced search syntax (is:completed, priority:high, due:today, category:work) with filter chips

**Independent Test**:
1. Type "is:completed" in search → only completed tasks shown
2. Type "priority:high due:today" → only high-priority tasks due today shown
3. Filter chips appear below search bar
4. Click X on filter chip → filter removed

### E2E Tests for User Story 6

- [ ] T039 [P] [US6] Create E2E test for filter syntax parsing in tests/frontend/e2e/enhanced-search.spec.ts (is:, priority:, due:, category:)
- [ ] T040 [P] [US6] Create E2E test for filter chips in tests/frontend/e2e/enhanced-search.spec.ts
- [ ] T041 [P] [US6] Create E2E test for multiple filter combination in tests/frontend/e2e/enhanced-search.spec.ts

### Implementation for User Story 6

- [ ] T042 [P] [US6] Create filter types in phase-2-web/frontend/types/filter.ts (FilterChip, ParsedFilter, FilterOperator)
- [ ] T043 [P] [US6] Create filter parser utility in phase-2-web/frontend/utils/filterParser.ts (parseSearchQuery, extractFilters)
- [ ] T044 [P] [US6] Create unit tests for filter parser in tests/frontend/unit/filterParser.test.ts
- [ ] T045 [P] [US6] Create recent searches hook in phase-2-web/frontend/hooks/useRecentSearches.ts (localStorage)
- [ ] T046 [US6] Create FilterChipBar component in phase-2-web/frontend/components/FilterChipBar.tsx
- [ ] T047 [US6] Create useFilterParser hook in phase-2-web/frontend/hooks/useFilterParser.ts
- [ ] T048 [US6] Update SearchBar to parse filter syntax in phase-2-web/frontend/components/SearchBar.tsx
- [ ] T049 [US6] Add FilterChipBar below SearchBar in search UI layout
- [ ] T050 [US6] Create search service in phase-2-web/backend/app/services/search_service.py (parseFilters, buildQuery)
- [ ] T051 [US6] Create search router in phase-2-web/backend/app/routers/search.py with GET /api/tasks/search endpoint
- [ ] T052 [US6] Implement query builder for filter combinations in phase-2-web/backend/app/utils/query_builder.py
- [ ] T053 [US6] Add search endpoint to API client in phase-2-web/frontend/lib/api.ts
- [ ] T054 [US6] Create backend test for search filters in tests/backend/test_search_filters.py

**Checkpoint**: Enhanced search working. Users can find tasks using powerful filter syntax.

---

## Phase 6: User Story 3 - Drag & Drop Task Reordering (Priority: P2, Week 2)

**Goal**: Enable users to drag tasks to reorder them, with order persisting to database

**Independent Test**:
1. Drag a task from position 3 to position 1
2. Refresh page → task remains in position 1
3. On mobile: long-press task for 800ms → drag mode activates
4. Order is user-specific (not shared across accounts)

### E2E Tests for User Story 3

- [ ] T055 [P] [US3] Create E2E test for desktop drag & drop in tests/frontend/e2e/drag-and-drop.spec.ts
- [ ] T056 [P] [US3] Create E2E test for mobile long-press drag in tests/frontend/e2e/drag-and-drop.spec.ts
- [ ] T057 [P] [US3] Create E2E test for order persistence in tests/frontend/e2e/drag-and-drop.spec.ts

### Implementation for User Story 3

- [ ] T058 [P] [US3] Create useDragAndDrop hook in phase-2-web/frontend/hooks/useDragAndDrop.ts (wrapper for @dnd-kit)
- [ ] T059 [US3] Create DraggableTaskItem wrapper component in phase-2-web/frontend/components/DraggableTaskItem.tsx
- [ ] T060 [US3] Update TasksList to use @dnd-kit/sortable in phase-2-web/frontend/components/TasksList.tsx
- [ ] T061 [US3] Add drag handle icon to TaskItem in phase-2-web/frontend/components/TaskItem.tsx
- [ ] T062 [US3] Configure touch sensors for mobile drag in phase-2-web/frontend/hooks/useDragAndDrop.ts
- [ ] T063 [US3] Add drag animations and ghost preview in phase-2-web/frontend/components/DraggableTaskItem.tsx
- [ ] T064 [US3] Create reorder endpoint PUT /api/tasks/reorder in phase-2-web/backend/app/routers/tasks.py
- [ ] T065 [US3] Implement batch reorder logic in phase-2-web/backend/app/services/task_service.py
- [ ] T066 [US3] Add reorder API call to frontend API client in phase-2-web/frontend/lib/api.ts
- [ ] T067 [US3] Connect drag drop event to reorder API call in phase-2-web/frontend/components/TasksList.tsx
- [ ] T068 [US3] Update KanbanBoard to support drag & drop in phase-2-web/frontend/components/KanbanBoard.tsx
- [ ] T069 [US3] Create backend test for reorder endpoint in tests/backend/test_task_reordering.py

**Checkpoint**: Drag & drop reordering working on desktop and mobile. Order persists across sessions.

---

## Phase 7: User Story 4 - Bulk Task Operations (Priority: P2, Week 2)

**Goal**: Enable users to select multiple tasks and perform bulk actions (complete, delete, change priority, assign category, set due date)

**Independent Test**:
1. Select 5 tasks using checkboxes
2. Click "Mark Complete" in bulk toolbar → all 5 tasks marked complete
3. Select 3 tasks, Shift+Click 7th task → all tasks from 3 to 7 selected
4. Click "Delete" → confirmation shows "Delete 5 tasks?"

### E2E Tests for User Story 4

- [ ] T070 [P] [US4] Create E2E test for task selection in tests/frontend/e2e/bulk-operations.spec.ts (individual, select all, shift-click)
- [ ] T071 [P] [US4] Create E2E test for bulk actions in tests/frontend/e2e/bulk-operations.spec.ts (complete, delete, priority, category, due date)
- [ ] T072 [P] [US4] Create E2E test for bulk delete confirmation in tests/frontend/e2e/bulk-operations.spec.ts

### Implementation for User Story 4

- [ ] T073 [P] [US4] Create bulk operation types in phase-2-web/frontend/types/bulkOperation.ts (BulkAction, SelectionState)
- [ ] T074 [P] [US4] Create useBulkSelection hook in phase-2-web/frontend/hooks/useBulkSelection.ts (selection state, range select)
- [ ] T075 [US4] Create BulkActionToolbar component in phase-2-web/frontend/components/BulkActionToolbar.tsx
- [ ] T076 [US4] Add selection checkboxes to TaskItem in phase-2-web/frontend/components/TaskItem.tsx
- [ ] T077 [US4] Add "Select All" checkbox to TasksList header in phase-2-web/frontend/components/TasksList.tsx
- [ ] T078 [US4] Implement Shift+Click range selection in phase-2-web/frontend/hooks/useBulkSelection.ts
- [ ] T079 [US4] Add BulkActionToolbar to TasksList in phase-2-web/frontend/components/TasksList.tsx
- [ ] T080 [US4] Implement bulk action handlers in phase-2-web/frontend/components/BulkActionToolbar.tsx
- [ ] T081 [US4] Create bulk update endpoint POST /api/tasks/bulk-update in phase-2-web/backend/app/routers/tasks.py
- [ ] T082 [US4] Create bulk delete endpoint DELETE /api/tasks/bulk-delete in phase-2-web/backend/app/routers/tasks.py
- [ ] T083 [US4] Implement bulk update logic in phase-2-web/backend/app/services/task_service.py
- [ ] T084 [US4] Add bulk API calls to frontend API client in phase-2-web/frontend/lib/api.ts
- [ ] T085 [US4] Add confirmation dialog for bulk delete in phase-2-web/frontend/components/BulkActionToolbar.tsx
- [ ] T086 [US4] Create backend test for bulk operations in tests/backend/test_bulk_operations.py

**Checkpoint**: Bulk operations working. Users can efficiently manage multiple tasks at once.

---

## Phase 8: User Story 5 - File Attachments UI (Priority: P3, Week 3)

**Goal**: Enable users to upload files to tasks via drag & drop or file picker, view attachments with previews, download and delete files

**Independent Test**:
1. Open task modal, drag a file onto upload area → file uploads with progress indicator
2. Image file shows thumbnail preview
3. Click download icon → file downloads
4. Click delete icon → confirmation, then file removed

### E2E Tests for User Story 5

- [ ] T087 [P] [US5] Create E2E test for file upload in tests/frontend/e2e/file-attachments.spec.ts (button and drag-drop)
- [ ] T088 [P] [US5] Create E2E test for file download in tests/frontend/e2e/file-attachments.spec.ts
- [ ] T089 [P] [US5] Create E2E test for file deletion in tests/frontend/e2e/file-attachments.spec.ts
- [ ] T090 [P] [US5] Create E2E test for image preview in tests/frontend/e2e/file-attachments.spec.ts

### Implementation for User Story 5

- [ ] T091 [P] [US5] Create file helper utilities in phase-2-web/frontend/utils/fileHelpers.ts (formatFileSize, getFileIcon, isImageFile)
- [ ] T092 [P] [US5] Create unit tests for file helpers in tests/frontend/unit/fileHelpers.test.ts
- [ ] T093 [US5] Create FileUploadArea component in phase-2-web/frontend/components/FileUploadArea.tsx using react-dropzone
- [ ] T094 [US5] Add upload progress indicator to FileUploadArea in phase-2-web/frontend/components/FileUploadArea.tsx
- [ ] T095 [US5] Add file size and type validation to FileUploadArea in phase-2-web/frontend/components/FileUploadArea.tsx (10MB limit)
- [ ] T096 [US5] Update AttachmentList component in phase-2-web/frontend/components/AttachmentList.tsx with enhanced display
- [ ] T097 [US5] Add image thumbnail preview to AttachmentList in phase-2-web/frontend/components/AttachmentList.tsx
- [ ] T098 [US5] Add download button functionality to AttachmentList in phase-2-web/frontend/components/AttachmentList.tsx
- [ ] T099 [US5] Add delete button with confirmation to AttachmentList in phase-2-web/frontend/components/AttachmentList.tsx
- [ ] T100 [US5] Integrate FileUploadArea into QuickAddModal in phase-2-web/frontend/components/QuickAddModal.tsx
- [ ] T101 [US5] Verify backend attachment endpoints work in phase-2-web/backend/app/routers/attachments.py
- [ ] T102 [US5] Add attachment API calls to frontend API client in phase-2-web/frontend/lib/api.ts (if not already present)
- [ ] T103 [US5] Test file upload with 10MB file manually
- [ ] T104 [US5] Test file upload on mobile devices manually

**Checkpoint**: File attachments UI complete. Users can upload, view, download, and delete files attached to tasks.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T105 [P] Run full E2E test suite across all features in tests/frontend/e2e/
- [ ] T106 [P] Test all keyboard shortcuts on Chrome, Firefox, Safari, Edge
- [ ] T107 [P] Test drag & drop on mobile devices (iOS Safari, Android Chrome)
- [ ] T108 [P] Test accessibility with keyboard-only navigation on all features
- [ ] T109 [P] Test accessibility with screen reader (NVDA or VoiceOver)
- [ ] T110 [P] Verify WCAG 2.1 AA compliance for all new components
- [ ] T111 [P] Performance test: Keyboard shortcut response time (<16ms)
- [ ] T112 [P] Performance test: Bulk operations with 50 tasks (<3 seconds)
- [ ] T113 [P] Performance test: Search with 10,000 tasks (<500ms)
- [ ] T114 [P] Performance test: Drag animation frame rate (60fps)
- [ ] T115 [P] Update CLAUDE.md with new technologies (@dnd-kit, react-dropzone, date-fns)
- [ ] T116 Code review and refactoring for all new components
- [ ] T117 Security review for file upload functionality (path traversal, file type validation)
- [ ] T118 Add error boundary components for graceful error handling
- [ ] T119 Add loading states to all async operations
- [ ] T120 Verify dark mode support for all new components

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 Keyboard Shortcuts: Can start after Foundational - No dependencies on other stories
  - US2 Smart Dates: Can start after Foundational - No dependencies on other stories
  - US6 Enhanced Search: Can start after Foundational - No dependencies on other stories
  - US3 Drag & Drop: Can start after Foundational - Requires sort_order from Phase 2
  - US4 Bulk Operations: Can start after Foundational - No dependencies on other stories
  - US5 File Attachments: Can start after Foundational - Requires uploads directory from Setup
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### Recommended Implementation Sequence

**Week 1 (Phase 1A - Foundation + Quick Wins)**:
1. Phase 1: Setup (T001-T008)
2. Phase 2: Foundational (T009-T016) - CRITICAL BLOCKER
3. Phase 3: US1 Keyboard Shortcuts (T017-T030)
4. Phase 4: US2 Smart Dates (T031-T038)
5. Phase 5: US6 Enhanced Search (T039-T054)

**Week 2 (Phase 1B - Visual Interactions)**:
6. Phase 6: US3 Drag & Drop (T055-T069)
7. Phase 7: US4 Bulk Operations (T070-T086)

**Week 3 (Phase 1C - Infrastructure + Polish)**:
8. Phase 8: US5 File Attachments (T087-T104)
9. Phase 9: Polish & Cross-Cutting (T105-T120)

### Within Each User Story

1. E2E tests FIRST (write tests, ensure they FAIL)
2. Types and utilities (parallel)
3. Components (frontend)
4. Backend endpoints and services
5. API integration
6. Manual testing and refinement

### Parallel Opportunities

**Setup Phase (all parallel)**:
- T001-T008: All setup tasks can run in parallel

**Foundational Phase (parallel groups)**:
- T009: Database migration (MUST complete first)
- T010-T016: All schema/type updates can run in parallel after migration

**User Story Phases (parallel stories)**:
After Foundational phase completes, these can run in parallel:
- US1 (T017-T030) + US2 (T031-T038) + US6 (T039-T054) - Week 1 parallel
- US3 (T055-T069) + US4 (T070-T086) - Week 2 parallel

**Within Each Story (parallel tasks)**:
- E2E tests marked [P] can run in parallel
- Types, utilities, and helper functions marked [P] can run in parallel
- Frontend and backend work can proceed in parallel once contracts are defined

---

## Parallel Example: Week 1 (Phase 1A)

```bash
# After Foundational phase completes, launch all 3 user stories in parallel:

# Developer A: Keyboard Shortcuts (US1)
Task: "Create keyboard types in phase-2-web/frontend/types/keyboard.ts"
Task: "Create keyboard helper utilities in phase-2-web/frontend/utils/keyboardHelpers.ts"
Task: "Create KeyboardShortcutsContext in phase-2-web/frontend/contexts/KeyboardShortcutsContext.tsx"
# ... continue with US1 tasks

# Developer B: Smart Dates (US2)
Task: "Create date helper utilities in phase-2-web/frontend/utils/dateHelpers.ts"
Task: "Create SmartDatePicker component in phase-2-web/frontend/components/SmartDatePicker.tsx"
# ... continue with US2 tasks

# Developer C: Enhanced Search (US6)
Task: "Create filter parser utility in phase-2-web/frontend/utils/filterParser.ts"
Task: "Create FilterChipBar component in phase-2-web/frontend/components/FilterChipBar.tsx"
Task: "Create search service in phase-2-web/backend/app/services/search_service.py"
# ... continue with US6 tasks
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US6 Only - Week 1)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T016) - CRITICAL BLOCKER
3. Complete Phase 3: US1 Keyboard Shortcuts (T017-T030)
4. Complete Phase 4: US2 Smart Dates (T031-T038)
5. Complete Phase 5: US6 Enhanced Search (T039-T054)
6. **STOP and VALIDATE**: Test all 3 stories independently
7. Deploy/demo Week 1 features

**MVP Value**: Users get keyboard productivity, quick date selection, and powerful search - immediate productivity boost with zero new infrastructure.

### Incremental Delivery

**Week 1 MVP**: Keyboard shortcuts + Smart dates + Enhanced search
- Independent stories, no complex UI state
- Test independently, deploy as Phase 1A
- Delivers: Keyboard power users, quick date selection, advanced filtering

**Week 2 Addition**: Drag & drop + Bulk operations
- Visual interaction features requiring UI state management
- Test independently, deploy as Phase 1B
- Delivers: Task organization, batch processing

**Week 3 Addition**: File attachments
- Infrastructure-dependent feature
- Test independently, deploy as Phase 1C
- Delivers: Complete feature set with file management

**Week 3 Polish**: Cross-cutting improvements
- Performance optimization, accessibility validation
- Final QA and hardening
- Delivers: Production-ready Phase 1

### Parallel Team Strategy

**Single Developer**: Follow sequential order (Week 1 → Week 2 → Week 3)

**Two Developers**:
- Week 1: Dev A does US1+US2, Dev B does US6
- Week 2: Dev A does US3, Dev B does US4
- Week 3: Dev A does US5, Dev B does Polish

**Three+ Developers**:
- Week 1: Each developer takes one story (US1, US2, US6)
- Week 2: Two developers take stories (US3, US4), one starts Polish
- Week 3: One does US5, others continue Polish and testing

---

## Task Count Summary

**Total Tasks**: 120 tasks

**Tasks by Phase**:
- Setup (Phase 1): 8 tasks
- Foundational (Phase 2): 8 tasks (CRITICAL BLOCKER)
- US1 Keyboard Shortcuts: 14 tasks (3 tests + 11 implementation)
- US2 Smart Dates: 8 tasks (2 tests + 6 implementation)
- US6 Enhanced Search: 16 tasks (3 tests + 13 implementation)
- US3 Drag & Drop: 15 tasks (3 tests + 12 implementation)
- US4 Bulk Operations: 17 tasks (3 tests + 14 implementation)
- US5 File Attachments: 18 tasks (4 tests + 14 implementation)
- Polish: 16 tasks

**Tasks by Week** (Recommended Sequence):
- Week 1: 46 tasks (Setup + Foundational + US1 + US2 + US6)
- Week 2: 32 tasks (US3 + US4)
- Week 3: 42 tasks (US5 + Polish)

**Parallel Opportunities**: 67 tasks marked [P] can run in parallel with other tasks

**Independent Stories**: All 6 user stories can be tested independently after Foundational phase

---

## Notes

- [P] tasks = different files, no dependencies on other incomplete tasks
- [US#] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- E2E tests are OPTIONAL - write tests before implementation if TDD approach desired
- Verify E2E tests fail before implementing features
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Database migration (T009) MUST complete before any backend model/schema work
- File paths are absolute from repository root
- All new dependencies installed in Setup phase (T001-T002)
