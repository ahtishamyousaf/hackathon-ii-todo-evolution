# Implementation Plan: Phase 1 Quick Wins & Essential UX

**Branch**: `005-quick-wins-ux` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-quick-wins-ux/spec.md`

## Summary

Implement six high-impact UX enhancements for TaskFlow: keyboard shortcuts system, smart due date selection, drag & drop task reordering, bulk task operations, file attachments UI, and enhanced search with advanced filters. These features reduce user friction, increase productivity, and provide power-user capabilities while maintaining simplicity.

**Technical Approach**:
- Frontend: React context providers for keyboard shortcuts, @dnd-kit for drag & drop, react-dropzone for file uploads, advanced filter parser for search
- Backend: Add sort_order field to Task model, new bulk update and reorder endpoints, leverage existing file attachment API
- Database: Migration to add sort_order column (nullable for backward compatibility)

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5.x with Next.js 16, React 18
- Backend: Python 3.13+ with FastAPI

**Primary Dependencies**:
- Frontend Existing: Next.js 16, React 18, TailwindCSS, Better Auth 1.4.7, lucide-react (icons)
- Frontend New: @dnd-kit/core ^6.1.0, @dnd-kit/sortable ^8.0.0, react-dropzone ^14.2.0, date-fns ^3.0.0
- Backend Existing: FastAPI, SQLModel, PostgreSQL (Neon), Better Auth integration
- Backend New: No new dependencies required

**Storage**:
- Database: PostgreSQL (Neon) for task data, sort orders, search history
- File Storage: Local filesystem at `backend/uploads/` (extendable to S3 in future)
- Session Storage: Browser localStorage for keyboard shortcut preferences, recent searches

**Testing**:
- Frontend: Jest for unit tests, Playwright for E2E (existing setup)
- Backend: pytest for API tests (existing setup)
- Manual: Cross-browser testing (Chrome, Firefox, Safari, Edge), mobile device testing (iOS, Android)

**Target Platform**:
- Web: Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Mobile Web: iOS 13+ Safari, Android 9+ Chrome
- Desktop: Keyboard-optimized for power users
- Touch: Mobile-optimized gestures for drag & drop and file upload

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Keyboard shortcut response: <16ms (one frame at 60fps)
- Bulk operations: <3 seconds for 50 tasks
- Search filter application: <500ms for 10,000 tasks
- Drag animation: 60fps with <300ms transition
- File upload: Progress indicator updates every 100ms

**Constraints**:
- Backward compatibility: Existing tasks without sort_order must display correctly
- Browser compatibility: No features requiring Chrome/Edge only APIs
- Accessibility: WCAG 2.1 AA compliance (keyboard navigation, screen readers)
- Performance: No >10% degradation in current page load time
- Mobile performance: Must work on 3-4 year old devices (iPhone X, Samsung S8)
- Offline capability: Drag & drop and bulk selection work offline with sync on reconnection

**Scale/Scope**:
- Target users: 1,000 concurrent users
- Task volume: Handle 10,000 tasks per user without performance degradation
- File attachments: 10MB per file, average 50 files per user, up to 5 simultaneous uploads
- Search index: Support 10,000 tasks with <500ms query time

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Alignment with Project Constitution

**Spec-Driven Development** ✅
- All features documented in comprehensive specification
- Implementation plan derived from specification
- No manual coding without specification update
- **Status**: PASS - Follows spec-driven workflow

**Simplicity and Focus** ✅
- Features are well-scoped and bounded
- Out of Scope section clearly defines exclusions
- Each feature addresses specific user pain point
- **Status**: PASS - Maintains focused scope

**Clean Code Standards** ✅
- TypeScript for type safety (frontend)
- Python type hints for backend
- Separation of concerns (contexts, components, hooks, utils)
- Error handling in all user interactions
- **Status**: PASS - Architecture supports clean code

**User Experience Excellence** ✅
- Clear visual feedback for all interactions
- Error messages guide users to resolution
- Accessibility built in from start (ARIA labels, keyboard nav)
- Loading states for async operations
- **Status**: PASS - UX-first approach

**Testability by Design** ✅
- Features are independently testable
- Contexts isolate state management
- Pure utility functions for parsing, formatting
- Contract-based API endpoints
- **Status**: PASS - Testable architecture

**Feature Boundaries** ✅
- Six distinct features with clear responsibilities
- No feature creep (see Out of Scope section)
- Each feature has independent acceptance criteria
- Features can be deployed independently with feature flags
- **Status**: PASS - Well-defined boundaries

### Constitution Compliance Summary

All constitutional principles are satisfied. No violations require justification.

**Technical Standards Alignment**:
- Technology stack matches existing project (Next.js, FastAPI, PostgreSQL)
- Project structure follows established patterns (frontend/backend separation)
- Data models extend existing Task entity cleanly
- Error handling standards maintained

**Quality Criteria Alignment**:
- Specification quality: ✅ Comprehensive with 72 acceptance criteria
- Code generation readiness: ✅ Clear technical requirements
- Functional completeness: ✅ All features fully specified
- Documentation quality: ✅ Complete with user scenarios, risks, dependencies

## Project Structure

### Documentation (this feature)

```text
specs/005-quick-wins-ux/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technical research and decisions
├── data-model.md        # Phase 1: Data models and database schema
├── quickstart.md        # Phase 1: Developer quickstart guide
├── contracts/           # Phase 1: API contracts
│   ├── tasks-api.yaml           # Extended task endpoints
│   ├── bulk-api.yaml            # Bulk operations endpoints
│   ├── attachments-api.yaml     # File attachment endpoints (existing)
│   └── search-api.yaml          # Enhanced search endpoints
├── checklists/
│   └── requirements.md  # Specification quality checklist (complete, all passed)
└── tasks.md             # Phase 2: NOT created by /sp.plan (use /sp.tasks)
```

### Source Code (repository root)

```text
phase-2-web/
├── frontend/                    # Next.js 16 application
│   ├── app/
│   │   ├── (app)/              # Protected app pages
│   │   │   ├── tasks/          # Main tasks page (MODIFY)
│   │   │   ├── kanban/         # Kanban board (MODIFY for drag & drop)
│   │   │   ├── calendar/       # Calendar view (MODIFY for smart dates)
│   │   │   └── settings/       # Settings page (MODIFY for shortcuts panel)
│   │   ├── (auth)/             # Auth pages (no changes)
│   │   └── api/auth/           # Better Auth routes (no changes)
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components (existing)
│   │   │
│   │   ├── QuickAddModal.tsx   # MODIFY: Add smart date picker, file upload
│   │   ├── TasksList.tsx       # MODIFY: Add drag & drop, bulk select, keyboard nav
│   │   ├── TaskItem.tsx        # MODIFY: Add drag handle, selection checkbox
│   │   ├── SearchBar.tsx       # MODIFY: Add advanced filter parsing
│   │   │
│   │   ├── SmartDatePicker.tsx         # NEW: Quick date buttons component
│   │   ├── BulkActionToolbar.tsx       # NEW: Bulk operations toolbar
│   │   ├── FileUploadArea.tsx          # NEW: Drag & drop file upload
│   │   ├── AttachmentList.tsx          # MODIFY: Enhanced file display
│   │   ├── DraggableTaskItem.tsx       # NEW: Wrapper for @dnd-kit
│   │   ├── FilterChipBar.tsx           # NEW: Active filter chips display
│   │   └── KeyboardShortcutsHelp.tsx   # NEW: Shortcuts reference panel
│   │
│   ├── contexts/               # React contexts
│   │   ├── AuthContext.tsx             # Existing
│   │   ├── ThemeContext.tsx            # Existing
│   │   ├── NotificationContext.tsx     # Existing
│   │   └── KeyboardShortcutsContext.tsx # NEW: Global keyboard shortcut provider
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useKeyboardShortcut.ts      # NEW: Individual shortcut hook
│   │   ├── useBulkSelection.ts         # NEW: Multi-select state management
│   │   ├── useDragAndDrop.ts           # NEW: Drag & drop wrapper for @dnd-kit
│   │   ├── useFilterParser.ts          # NEW: Search syntax parser
│   │   └── useRecentSearches.ts        # NEW: localStorage for search history
│   │
│   ├── utils/                  # Utility functions
│   │   ├── filterParser.ts             # NEW: Parse "is:completed" syntax
│   │   ├── fileHelpers.ts              # NEW: formatFileSize, getFileIcon
│   │   ├── dateHelpers.ts              # NEW: Smart date calculations (today, tomorrow, etc.)
│   │   └── keyboardHelpers.ts          # NEW: Key event utilities, preventDefault logic
│   │
│   ├── types/                  # TypeScript types
│   │   ├── task.ts                     # MODIFY: Add sort_order field
│   │   ├── filter.ts                   # NEW: Filter types (FilterChip, ParsedFilter)
│   │   ├── keyboard.ts                 # NEW: Shortcut types (KeyBinding, ShortcutAction)
│   │   └── bulkOperation.ts            # NEW: Bulk action types
│   │
│   └── lib/
│       └── api.ts              # MODIFY: Add bulk update, reorder, search endpoints
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── models/
│   │   │   ├── task.py         # MODIFY: Add sort_order field (nullable Integer)
│   │   │   ├── attachment.py   # Existing (no changes needed)
│   │   │   └── search_history.py       # NEW: Store recent searches
│   │   │
│   │   ├── routers/
│   │   │   ├── tasks.py        # MODIFY: Add bulk update, reorder endpoints
│   │   │   ├── attachments.py  # Existing (verify multipart support)
│   │   │   └── search.py       # NEW: Advanced search endpoint with filter parsing
│   │   │
│   │   ├── services/
│   │   │   ├── task_service.py         # MODIFY: Add bulk update logic, reorder logic
│   │   │   ├── search_service.py       # NEW: Filter parsing, query building
│   │   │   └── file_service.py         # Existing (verify upload/download)
│   │   │
│   │   ├── schemas/
│   │   │   ├── task.py         # MODIFY: Add sort_order to TaskCreate, TaskUpdate
│   │   │   ├── bulk.py         # NEW: BulkUpdateRequest, BulkUpdateResponse
│   │   │   └── search.py       # NEW: SearchRequest, FilterParams
│   │   │
│   │   └── utils/
│   │       └── query_builder.py        # NEW: Build SQLModel queries from filter params
│   │
│   ├── migrations/
│   │   └── 005_add_task_sort_order.py  # NEW: Add sort_order column
│   │
│   └── uploads/                # File storage directory (ensure .gitignore)
│
└── tests/
    ├── frontend/
    │   ├── unit/
    │   │   ├── filterParser.test.ts    # NEW: Test search syntax parser
    │   │   ├── fileHelpers.test.ts     # NEW: Test file utilities
    │   │   └── dateHelpers.test.ts     # NEW: Test smart date calculations
    │   │
    │   └── e2e/
    │       ├── keyboard-shortcuts.spec.ts      # NEW: Test all shortcuts
    │       ├── drag-and-drop.spec.ts           # NEW: Test reordering
    │       ├── bulk-operations.spec.ts         # NEW: Test bulk actions
    │       ├── file-attachments.spec.ts        # NEW: Test file upload/download
    │       └── enhanced-search.spec.ts         # NEW: Test filter syntax
    │
    └── backend/
        ├── test_bulk_operations.py     # NEW: Test bulk update endpoint
        ├── test_task_reordering.py     # NEW: Test reorder endpoint
        └── test_search_filters.py      # NEW: Test search query building
```

**Structure Decision**: Web application with frontend/backend separation (existing pattern). Frontend uses Next.js App Router with component/context/hook/util organization. Backend uses FastAPI with router/service/model/schema layers. All new features integrate into existing structure without requiring architectural changes.

**Key Integration Points**:
1. **Keyboard Shortcuts**: Context provider wraps app layout, hooks inject into existing components
2. **Drag & Drop**: Wraps existing TaskItem with DraggableTaskItem, no layout changes
3. **Bulk Operations**: Adds toolbar overlay, extends existing TasksList selection logic
4. **Smart Dates**: Replaces date picker in QuickAddModal (existing component)
5. **File Attachments**: Extends AttachmentList (existing), uses existing API
6. **Enhanced Search**: Extends SearchBar (existing), adds FilterChipBar below

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. This section is not applicable.

All features align with constitution principles:
- Spec-driven development workflow followed
- Focused scope with clear boundaries
- Clean code architecture maintained
- User experience excellence prioritized
- Testability built into design
- Feature boundaries well-defined

## Phase 0: Research & Decisions

### Research Tasks

#### RT1: Keyboard Shortcut Library Evaluation
**Question**: Should we use a keyboard shortcut library or implement custom event handlers?

**Research Needed**:
- Evaluate `react-hotkeys-hook` library
- Compare with custom `useEffect` + `addEventListener` approach
- Consider browser compatibility, bundle size, API simplicity

**Decision Criteria**:
- Bundle size impact (<5KB preferred)
- TypeScript support quality
- Handles input field exclusion (don't trigger in text inputs)
- Supports key combination detection (Cmd/Ctrl)

#### RT2: Drag & Drop Library Selection (@dnd-kit vs alternatives)
**Question**: Confirm @dnd-kit is best choice for task reordering

**Research Needed**:
- Verify @dnd-kit/core + @dnd-kit/sortable handle our use cases
- Check mobile touch support quality
- Evaluate react-beautiful-dnd (deprecated?) and alternatives
- Review accessibility features (keyboard drag)

**Decision Criteria**:
- Mobile touch support (long-press activation)
- Accessibility (keyboard-only reordering)
- Animation performance (60fps)
- TypeScript type definitions
- Active maintenance

#### RT3: File Upload Approach (react-dropzone vs native)
**Question**: Use react-dropzone or native HTML5 file input?

**Research Needed**:
- Evaluate react-dropzone drag & drop UX
- Check multipart/form-data handling with FastAPI
- Review progress tracking capabilities
- Consider mobile file picker behavior

**Decision Criteria**:
- Drag & drop UX quality
- Upload progress tracking
- Multiple file handling
- Mobile compatibility
- Error handling patterns

#### RT4: Search Filter Parsing Strategy
**Question**: Regex parser vs tokenizer for "is:completed priority:high" syntax

**Research Needed**:
- Implement prototype regex parser
- Evaluate complexity for AND/OR logic
- Consider future extensions (NOT, OR, parentheses)
- Review error handling for invalid syntax

**Decision Criteria**:
- Parse accuracy for current syntax
- Extensibility for future operators
- Error message quality
- Performance (<10ms parse time)

#### RT5: Database Sort Order Strategy
**Question**: How to handle sort_order for existing tasks (NULL) and new tasks?

**Research Needed**:
- Strategy for initializing NULL sort_order values
- Auto-increment logic for new tasks (use max + 1?)
- Handle gaps in sequence (user deletes middle task)
- Concurrent reorder conflict resolution

**Decision Criteria**:
- Backward compatibility (NULL values)
- Performance (avoid table scan for max)
- Simplicity (avoid complex sequence logic)
- Conflict resolution strategy (last-write-wins?)

#### RT6: File Storage Location
**Question**: Local filesystem vs S3-compatible storage for Phase 1?

**Research Needed**:
- Evaluate local filesystem simplicity (backend/uploads/)
- Consider S3/MinIO for production scalability
- Review security (path traversal prevention)
- Check deployment implications (persistent volumes)

**Decision Criteria**:
- Phase 1 simplicity (local preferred)
- Production readiness
- Security considerations
- Migration path to S3 later

#### RT7: Offline Capability Strategy
**Question**: How to support offline drag & drop and bulk operations?

**Research Needed**:
- Evaluate localStorage for pending operations queue
- Consider IndexedDB for task cache
- Review sync conflict resolution on reconnection
- Check PWA service worker requirements

**Decision Criteria**:
- Phase 1 scope (defer to future?)
- Complexity vs value trade-off
- Conflict resolution strategy
- User feedback during offline

#### RT8: Mobile Drag & Drop Implementation
**Question**: Best approach for mobile long-press drag activation?

**Research Needed**:
- Verify @dnd-kit touch sensor configuration
- Test iOS Safari long-press behavior
- Check Android Chrome touch event conflicts
- Review haptic feedback options

**Decision Criteria**:
- iOS and Android compatibility
- No conflict with scroll gestures
- Clear visual feedback
- Accessibility considerations

### Expected Research Outputs

File: `specs/005-quick-wins-ux/research.md`

Format:
```markdown
# Phase 1 Quick Wins - Research Findings

## RT1: Keyboard Shortcuts
**Decision**: [Library name] or Custom implementation
**Rationale**: [Why chosen]
**Alternatives Considered**: [What else evaluated]
**Bundle Size Impact**: [KB added]

## RT2: Drag & Drop Library
**Decision**: @dnd-kit/core + @dnd-kit/sortable
**Rationale**: [Why chosen]
**Alternatives Considered**: [react-beautiful-dnd, react-dnd, etc.]
**Mobile Support**: [Quality assessment]

[... continue for all 8 research tasks ...]

## Best Practices

### Keyboard Shortcuts
- [Pattern for preventing conflicts]
- [Input field exclusion approach]
- [Key combination detection]

### File Uploads
- [Progress tracking pattern]
- [Error handling strategy]
- [Multipart form data structure]

[... continue for all areas ...]
```

## Phase 1: Design & Contracts

### Data Model Extensions

File: `specs/005-quick-wins-ux/data-model.md`

#### Modified Entities

**Task Entity** (extends existing):
```python
class Task(SQLModel, table=True):
    # ... existing fields (id, title, description, completed, user_id, etc.) ...

    # NEW FIELD
    sort_order: Optional[int] = Field(
        default=None,
        nullable=True,
        description="User-defined sort position. NULL for tasks created before feature."
    )

    # Existing fields remain unchanged
```

**Migration Strategy**:
```sql
-- Migration 005: Add sort_order column
ALTER TABLE tasks
ADD COLUMN sort_order INTEGER NULL;

-- Create index for efficient ordering queries
CREATE INDEX idx_tasks_user_sort
ON tasks(user_id, sort_order)
WHERE sort_order IS NOT NULL;

-- Note: Existing tasks keep NULL sort_order (backward compatible)
-- Frontend displays NULL values at end of list
```

#### New Entities

**SearchHistory** (optional, for recent searches):
```python
class SearchHistory(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    query_text: str = Field(max_length=255)
    parsed_filters: str = Field(description="JSON string of parsed filter params")
    searched_at: datetime = Field(default_factory=datetime.utcnow)

    # Foreign key relationship
    user: Optional["User"] = Relationship(back_populates="search_history")
```

**Note**: Search history may be frontend-only (localStorage) in Phase 1. Backend entity optional.

### API Contracts

Directory: `specs/005-quick-wins-ux/contracts/`

#### File 1: `tasks-api.yaml` (OpenAPI extension)

```yaml
paths:
  /api/tasks/reorder:
    put:
      summary: Batch update task sort order
      description: Update sort_order for multiple tasks in one request
      tags: [Tasks]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                updates:
                  type: array
                  items:
                    type: object
                    properties:
                      task_id:
                        type: integer
                      sort_order:
                        type: integer
                    required: [task_id, sort_order]
              required: [updates]
            example:
              updates:
                - task_id: 101
                  sort_order: 1
                - task_id: 99
                  sort_order: 2
                - task_id: 102
                  sort_order: 3
      responses:
        200:
          description: Tasks reordered successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  updated_count:
                    type: integer
                  message:
                    type: string
        400:
          description: Invalid request (non-existent task ID, invalid sort_order)
        401:
          description: Unauthorized (no valid session)
        403:
          description: Forbidden (task belongs to another user)
```

#### File 2: `bulk-api.yaml`

```yaml
paths:
  /api/tasks/bulk-update:
    post:
      summary: Bulk update multiple tasks
      description: Apply same update to multiple tasks (complete, priority, category, due_date)
      tags: [Tasks]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                task_ids:
                  type: array
                  items:
                    type: integer
                  description: IDs of tasks to update
                updates:
                  type: object
                  properties:
                    completed:
                      type: boolean
                      nullable: true
                    priority:
                      type: string
                      enum: [low, medium, high]
                      nullable: true
                    category_id:
                      type: integer
                      nullable: true
                    due_date:
                      type: string
                      format: date
                      nullable: true
                  description: Fields to update (only provided fields updated)
              required: [task_ids, updates]
            example:
              task_ids: [101, 102, 103, 104, 105]
              updates:
                priority: "high"
                due_date: "2025-12-31"
      responses:
        200:
          description: Bulk update successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  updated_count:
                    type: integer
                  task_ids:
                    type: array
                    items:
                      type: integer
                  message:
                    type: string
        400:
          description: Invalid request (empty task_ids, invalid field values)
        401:
          description: Unauthorized
        403:
          description: Forbidden (one or more tasks belong to another user)

  /api/tasks/bulk-delete:
    delete:
      summary: Bulk delete multiple tasks
      tags: [Tasks]
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                task_ids:
                  type: array
                  items:
                    type: integer
              required: [task_ids]
      responses:
        200:
          description: Bulk delete successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  deleted_count:
                    type: integer
        401:
          description: Unauthorized
        403:
          description: Forbidden
```

#### File 3: `search-api.yaml`

```yaml
paths:
  /api/tasks/search:
    get:
      summary: Advanced task search with filter syntax
      description: Search tasks using advanced filter syntax (is:completed, priority:high, etc.)
      tags: [Tasks]
      security:
        - BearerAuth: []
      parameters:
        - name: q
          in: query
          required: false
          schema:
            type: string
          description: Free-text search query
          example: "meeting notes"

        - name: is
          in: query
          required: false
          schema:
            type: string
            enum: [completed, active]
          description: Task status filter

        - name: priority
          in: query
          required: false
          schema:
            type: string
            enum: [low, medium, high]
          description: Priority filter

        - name: category
          in: query
          required: false
          schema:
            type: string
          description: Category name filter

        - name: due
          in: query
          required: false
          schema:
            type: string
            enum: [today, overdue, week, month]
          description: Due date filter

        - name: sort
          in: query
          required: false
          schema:
            type: string
            enum: [sort_order, created_at, due_date, priority]
            default: sort_order
          description: Sort field

        - name: order
          in: query
          required: false
          schema:
            type: string
            enum: [asc, desc]
            default: asc
          description: Sort direction

      responses:
        200:
          description: Search results
          content:
            application/json:
              schema:
                type: object
                properties:
                  tasks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'
                  total:
                    type: integer
                  filters_applied:
                    type: object
                    description: Echo of applied filters
        400:
          description: Invalid filter syntax
        401:
          description: Unauthorized
```

#### File 4: `attachments-api.yaml` (verify existing)

```yaml
# Verify existing endpoints at /api/tasks/{task_id}/attachments
# - POST: Upload file (multipart/form-data)
# - GET: List attachments
# - GET /{attachment_id}: Download file
# - DELETE /{attachment_id}: Delete file

# Ensure these exist and work correctly
# No new endpoints needed for Phase 1
```

### Quickstart Guide

File: `specs/005-quick-wins-ux/quickstart.md`

```markdown
# Phase 1 Quick Wins - Developer Quickstart

## Prerequisites

- Node.js 18+ and npm
- Python 3.13+ and pip
- PostgreSQL (Neon database configured)
- Running backend and frontend (see main README)

## Database Migration

```bash
cd phase-2-web/backend

# Run migration to add sort_order column
python migrations/005_add_task_sort_order.py

# Verify migration
psql $DATABASE_URL -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name='tasks' AND column_name='sort_order';"
```

## Install New Dependencies

### Frontend

```bash
cd phase-2-web/frontend

# Install drag & drop libraries
npm install @dnd-kit/core@^6.1.0 @dnd-kit/sortable@^8.0.0

# Install file upload library
npm install react-dropzone@^14.2.0

# Install date utilities
npm install date-fns@^3.0.0

# Verify installation
npm list @dnd-kit/core @dnd-kit/sortable react-dropzone date-fns
```

### Backend

No new backend dependencies required. Existing libraries handle all features.

## Development Workflow

### Feature 1: Keyboard Shortcuts

1. Implement `KeyboardShortcutsContext.tsx`
2. Wrap app in provider (modify `app/layout.tsx`)
3. Add keyboard event listeners
4. Test with `npm run test:e2e -- keyboard-shortcuts.spec.ts`

### Feature 2: Smart Date Selection

1. Implement `SmartDatePicker.tsx`
2. Modify `QuickAddModal.tsx` to use new component
3. Add date calculation utilities in `utils/dateHelpers.ts`
4. Test manually in task creation modal

### Feature 3: Drag & Drop

1. Implement `DraggableTaskItem.tsx` wrapper
2. Modify `TasksList.tsx` to use `@dnd-kit/sortable`
3. Implement backend `/api/tasks/reorder` endpoint
4. Add database migration for `sort_order`
5. Test drag on desktop and mobile devices

### Feature 4: Bulk Operations

1. Implement `BulkActionToolbar.tsx`
2. Add selection state to `TasksList.tsx`
3. Implement backend `/api/tasks/bulk-update` endpoint
4. Test bulk actions (complete, delete, priority change)

### Feature 5: File Attachments UI

1. Implement `FileUploadArea.tsx` with react-dropzone
2. Modify `AttachmentList.tsx` for enhanced display
3. Verify backend `/api/tasks/{id}/attachments` works
4. Test file upload, download, delete

### Feature 6: Enhanced Search

1. Implement `filterParser.ts` for syntax parsing
2. Modify `SearchBar.tsx` to parse filters
3. Implement `FilterChipBar.tsx` to display active filters
4. Add backend `/api/tasks/search` endpoint with query builder
5. Test all filter combinations

## Testing

### Unit Tests

```bash
cd phase-2-web/frontend
npm run test:unit -- filterParser.test.ts
npm run test:unit -- fileHelpers.test.ts
npm run test:unit -- dateHelpers.test.ts
```

### E2E Tests

```bash
npm run test:e2e -- keyboard-shortcuts.spec.ts
npm run test:e2e -- drag-and-drop.spec.ts
npm run test:e2e -- bulk-operations.spec.ts
npm run test:e2e -- file-attachments.spec.ts
npm run test:e2e -- enhanced-search.spec.ts
```

### Backend Tests

```bash
cd phase-2-web/backend
pytest tests/test_bulk_operations.py -v
pytest tests/test_task_reordering.py -v
pytest tests/test_search_filters.py -v
```

### Manual Testing Checklist

- [ ] Test keyboard shortcuts on Chrome, Firefox, Safari
- [ ] Test drag & drop on mobile (iOS Safari, Android Chrome)
- [ ] Test file upload with 10MB file
- [ ] Test bulk operations with 50+ tasks
- [ ] Test search filters with 1000+ tasks
- [ ] Test accessibility with keyboard-only navigation
- [ ] Test accessibility with screen reader (NVDA/VoiceOver)

## Deployment

1. Run database migration in production
2. Deploy backend with new endpoints
3. Deploy frontend with new dependencies
4. Monitor performance metrics:
   - Keyboard shortcut response time (<16ms)
   - Bulk operation time (<3s for 50 tasks)
   - Search query time (<500ms)
   - Drag animation frame rate (60fps)

## Troubleshooting

### Drag & Drop Not Working on Mobile
- Check @dnd-kit touch sensor is enabled
- Verify long-press duration (800ms)
- Test with `ontouchstart` event logging

### File Upload Failing
- Check backend `uploads/` directory exists and is writable
- Verify multipart/form-data headers
- Check file size limit enforcement (10MB)

### Search Filters Not Parsing
- Check filter syntax in console logs
- Verify regex patterns in `filterParser.ts`
- Test with simple filters first (is:completed)

### Keyboard Shortcuts Conflicting
- Check if input fields are properly excluded
- Verify `event.target.tagName` checks
- Test in incognito mode (no extensions)
```

### Agent Context Update

After Phase 1 design completion, run:

```bash
./.specify/scripts/bash/update-agent-context.sh claude
```

This will update `CLAUDE.md` with new technologies:
- @dnd-kit/core and @dnd-kit/sortable for drag & drop
- react-dropzone for file uploads
- date-fns for date calculations

Manual additions preserved between markers.

## Implementation Sequence

### Phase 1A: Foundation (Week 1)

**Priority**: Independent features, quick wins

1. **Keyboard Shortcuts System** (2 days)
   - Day 1: Context provider, event listeners, basic shortcuts (N, /, Esc)
   - Day 2: Task list navigation (arrows, Enter, Space, Delete), settings panel
   - Testing: E2E keyboard shortcuts spec
   - Dependencies: None
   - Risk: Low

2. **Smart Due Date Selection** (1 day)
   - Day 1: SmartDatePicker component, date calculations, QuickAddModal integration
   - Testing: Manual testing + unit tests for date calculations
   - Dependencies: None
   - Risk: Low

3. **Enhanced Search & Filters** (2 days)
   - Day 1: Filter parser, SearchBar modification, FilterChipBar component
   - Day 2: Backend search endpoint, query builder, recent searches
   - Testing: Unit tests for parser + E2E search spec
   - Dependencies: None
   - Risk: Medium (parser complexity)

### Phase 1B: Visual Interactions (Week 2)

**Priority**: Requires UI state management, higher complexity

4. **Drag & Drop Reordering** (3 days)
   - Day 1: Database migration, backend reorder endpoint
   - Day 2: @dnd-kit integration, DraggableTaskItem wrapper, desktop drag
   - Day 3: Mobile touch support, animations, persistence testing
   - Testing: E2E drag spec + mobile device testing
   - Dependencies: Database migration must run first
   - Risk: High (mobile performance, touch conflicts)

5. **Bulk Operations** (2 days)
   - Day 1: Selection state, BulkActionToolbar, frontend logic
   - Day 2: Backend bulk update/delete endpoints, confirmation dialogs
   - Testing: E2E bulk operations spec
   - Dependencies: None (reuses existing task update logic)
   - Risk: Medium (accidental bulk delete risk)

### Phase 1C: Advanced Features (Week 3)

**Priority**: Infrastructure-dependent, lower urgency

6. **File Attachments UI** (2 days)
   - Day 1: FileUploadArea with react-dropzone, progress indicators
   - Day 2: AttachmentList enhancements, thumbnail previews, download/delete
   - Testing: E2E file attachments spec + manual file upload testing
   - Dependencies: Backend uploads directory, existing attachment API
   - Risk: Medium (upload failures, network issues)

### Total Timeline: 3 weeks (15 working days)

**Critical Path**:
1. Keyboard shortcuts (2d) → Smart dates (1d) → Enhanced search (2d) = 5 days
2. Drag & drop (3d) → Bulk operations (2d) = 5 days (parallel to above)
3. File attachments (2d) = 2 days (final week)

**Parallelization Opportunities**:
- Keyboard shortcuts + Enhanced search can be developed in parallel (different devs)
- Smart dates can overlap with search backend work
- File attachments can start while drag & drop testing occurs

**Milestones**:
- End of Week 1: Phase 1A complete (keyboard, dates, search)
- End of Week 2: Phase 1B complete (drag, bulk ops)
- End of Week 3: Phase 1C complete (file attachments), full QA

## Risk Mitigation Strategies

### High Risk: Drag & Drop Mobile Performance

**Risk**: Touch events may conflict with scroll on older devices

**Mitigation**:
1. Extensive mobile device testing (iOS 13+, Android 9+)
2. Long-press activation (800ms) adds friction to prevent accidents
3. Visual feedback clearly indicates drag mode is active
4. Fallback: Disable drag on devices where conflicts detected
5. Testing: Test on iPhone X, Samsung S8 (3-4 year old devices)

**Contingency**: If mobile drag fails, provide mobile-specific reorder UI (up/down arrows)

### High Risk: Bulk Delete Accidents

**Risk**: Users may accidentally delete many tasks

**Mitigation**:
1. Confirmation dialog shows exact count ("Delete 23 tasks?")
2. Requires explicit confirmation (not just clicking yes)
3. "Deselect All" button always visible
4. Visual indicator shows how many tasks selected
5. No bulk undo in Phase 1 (defer to future)

**Contingency**: Add "Recently Deleted" feature in Phase 2 if accidents occur

### Medium Risk: Keyboard Shortcut Conflicts

**Risk**: May conflict with browser extensions or OS shortcuts

**Mitigation**:
1. Use standard patterns (Gmail, Slack conventions)
2. Document potential conflicts in settings panel
3. Exclude shortcuts when focus is in input fields
4. Provide settings to disable individual shortcuts (future enhancement)
5. Testing: Test in multiple browsers, with/without extensions

**Contingency**: Allow users to disable conflicting shortcuts via settings

### Medium Risk: File Upload Failures

**Risk**: Network instability may cause upload failures

**Mitigation**:
1. Retry mechanism (automatic 1 retry, then user-initiated)
2. Clear error messages ("Upload failed: Network error. Retry?")
3. Upload progress indicator shows accurate progress
4. Support for cancellation during upload
5. File size validation before upload starts

**Contingency**: Implement chunked upload for large files in Phase 2

### Low Risk: Search Filter Complexity

**Risk**: Users may find syntax confusing initially

**Mitigation**:
1. Search suggestions as you type ("Did you mean: is:completed?")
2. Help tooltip with syntax examples
3. Recent searches dropdown for reference
4. Error messages guide to correct syntax
5. Testing: User testing with non-technical users

**Contingency**: Add visual filter builder UI in Phase 2

### Low Risk: Task Order Sync Issues

**Risk**: Concurrent edits may cause order conflicts

**Mitigation**:
1. Last-write-wins strategy (simple, predictable)
2. Optimistic UI updates for instant feedback
3. Conflicts rare in single-user context
4. Testing: Simulate concurrent reorder requests
5. Monitoring: Log reorder conflicts if they occur

**Contingency**: Implement conflict resolution UI if conflicts frequent

## Success Metrics

### Performance Metrics (Automated Testing)

1. **Keyboard Shortcut Response**: <16ms from key press to action (Lighthouse custom audit)
2. **Bulk Operation Efficiency**: <3 seconds for 50 tasks (E2E test timer)
3. **Search Response Time**: <500ms for 10,000 tasks (backend performance test)
4. **Drag Animation**: 60fps with <300ms transition (Chrome DevTools FPS meter)
5. **File Upload Success**: >95% success rate in E2E tests (retry mechanism tested)

### User Experience Metrics (Analytics + User Testing)

1. **Keyboard Shortcut Adoption**: 40% of users use shortcuts within first week (analytics event tracking)
2. **Mobile Drag Success**: 80% first-attempt success (user testing, n=10)
3. **Bulk Selection Accuracy**: 95% error-free bulk actions (user testing + error rate monitoring)
4. **Smart Date Usage**: 70% use quick buttons vs calendar (analytics event ratio)
5. **Search Filter Adoption**: 50% time savings vs scrolling (user testing task completion time)

### Functional Completeness (QA Checklist)

1. **Cross-Browser**: All features work in Chrome, Firefox, Safari, Edge (manual testing)
2. **Mobile Parity**: 90% of features work on mobile (mobile QA checklist)
3. **Accessibility**: 100% keyboard navigable, screen reader compatible (WAVE audit + manual testing)
4. **Data Persistence**: All preferences survive refresh/logout (E2E persistence tests)
5. **Offline Capability**: Reordering and selection work offline (future enhancement, deferred to Phase 2)

## Next Steps

After `/sp.plan` completion:

1. **Review Research Findings**: Validate all 8 research task decisions in `research.md`
2. **Validate Data Model**: Ensure `data-model.md` aligns with spec requirements
3. **Review API Contracts**: Check `contracts/*.yaml` for completeness and accuracy
4. **Execute `/sp.tasks`**: Break down implementation plan into actionable tasks
5. **Begin Implementation**: Follow sequence in Phase 1A → 1B → 1C order

---

**Plan Version**: 1.0
**Last Updated**: 2025-12-25
**Status**: Ready for Phase 0 Research
**Next Command**: Review research.md outputs, then proceed to `/sp.tasks`
