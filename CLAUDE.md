# hackathon-2 Development Guidelines

> **CRITICAL**: Read `/AGENTS.md` FIRST - it contains cross-agent truth and spec-driven workflow requirements.
>
> This file contains technical guidelines. For workflow, anti-patterns, and quality gates, see `/AGENTS.md`.

Auto-generated from all feature plans. Last updated: 2025-12-15

## Active Technologies
- N/A (File operations, git commands, shell scripts) + Git 2.x (for `git mv` to preserve history), TypeScript compiler (for import verification), npm/Node.js (for build verification) (002-organize-folder-structure)
- File system reorganization (no database changes) (002-organize-folder-structure)
- Python 3.13+ (backend), TypeScript/React 19 (frontend) (004-task-categories)
- Neon PostgreSQL (serverless database) (004-task-categories)
- @dnd-kit/core@^6.1.0, @dnd-kit/sortable@^8.0.0 (Drag & drop) (005-quick-wins-ux)
- react-dropzone@^14.2.0 (File uploads) (005-quick-wins-ux)
- date-fns@^3.0.0 (Date utilities) (005-quick-wins-ux)

- Next.js 16 (Frontend with App Router)
- FastAPI (Backend API)
- Better Auth v1.4.7 (Authentication)
- PostgreSQL (Neon serverless database)
- TailwindCSS (Styling)

## Project Structure

```text
phase-2-web/
├── frontend/               # Next.js application
│   ├── app/               # Next.js App Router
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (app)/         # Protected app pages (dashboard)
│   │   └── api/auth/      # Better Auth API routes
│   ├── components/        # React components
│   ├── contexts/          # React contexts (AuthContext)
│   ├── lib/              # Core libraries
│   │   ├── auth.ts       # Better Auth server config
│   │   └── auth-client.ts # Better Auth client instance
│   └── types/            # TypeScript types
└── backend/              # FastAPI application
    └── app/
        ├── api/          # API endpoints
        ├── models/       # Database models
        └── utils/        # Utilities (JWT, password)
```

## Commands

### Development

```bash
# Frontend
cd phase-2-web/frontend
npm install
npm run dev  # Runs on http://localhost:3000

# Backend
cd phase-2-web/backend
pip install -r requirements.txt
uvicorn app.main:app --reload  # Runs on http://localhost:8000
```

### Better Auth

```bash
# Generate/verify database schema
cd phase-2-web/frontend
npx @better-auth/cli generate
```

## Code Style

Follow standard conventions:
- TypeScript for frontend
- Python (FastAPI) for backend
- ESLint + Prettier for code formatting

## Authentication Architecture

This project uses Better Auth for authentication with JWT tokens:

1. **Better Auth (Frontend)**: Handles user registration, login, session management
2. **JWT Tokens**: Better Auth issues JWT tokens stored in session/cookies
3. **FastAPI (Backend)**: Verifies JWT tokens for API requests
4. **Shared Database**: Neon PostgreSQL database used by both frontend and backend

**Critical Implementation Details:**
- MUST use `toNextJsHandler(auth)` in `/app/api/auth/[...all]/route.ts`
- Database config must pass Pool directly: `database: new Pool({...})`
- Exclude `/api/auth/*` from FastAPI proxy in `next.config.js`
- Separate server (`lib/auth.ts`) and client (`lib/auth-client.ts`) instances

See `/phase-2-web/frontend/BETTER_AUTH_SETUP.md` for complete setup guide.

## Recent Changes
- 005-quick-wins-ux: Added @dnd-kit (drag & drop), react-dropzone (file uploads), date-fns (date utilities)
- 004-task-categories: Added Python 3.13+ (backend), TypeScript/React 19 (frontend)
- 002-organize-folder-structure: Added N/A (File operations, git commands, shell scripts) + Git 2.x (for `git mv` to preserve history), TypeScript compiler (for import verification), npm/Node.js (for build verification)

- 2025-12-26: Implemented Phase 1 Quick Wins & Essential UX (Feature 005) - 85% complete
- 2025-12-24: Implemented Task Categories System (Feature 004)
- 2025-12-15: Successfully integrated Better Auth v1.4.7 with Next.js

## Task Categories System (Feature 004)

The application includes a comprehensive category management system for organizing tasks:

### Features Implemented

**User Story 1: Create Custom Categories**
- Create categories with custom names (1-50 characters, unique per user)
- Assign colors to categories (hex format #RRGGBB)
- Default color: #9CA3AF (gray) if not specified
- View all user's categories (alphabetically sorted)

**User Story 2: Assign Tasks to Categories**
- Assign category when creating a task
- Change task category when editing
- Tasks can be uncategorized (category_id = null)
- Visual category badge on tasks with color indicator

**User Story 3: Filter Tasks by Category**
- Filter task list by specific category
- "All Categories" option to show all tasks
- "Uncategorized" option to show tasks without category
- Empty state messages for filtered results

**User Story 4: Update Category Details**
- Rename categories (maintains uniqueness validation)
- Change category colors
- Updates instantly reflect on all associated tasks
- Auto-update timestamp tracking

**User Story 5: Delete Categories**
- Delete unused categories with confirmation
- Tasks in deleted category become uncategorized (0% data loss)
- ON DELETE SET NULL foreign key constraint ensures data preservation

### API Endpoints

**Categories**
- `POST /api/categories` - Create category
- `GET /api/categories` - List user's categories
- `GET /api/categories/{id}` - Get single category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

**Tasks (with category support)**
- `POST /api/tasks` - Create task (accepts category_id)
- `GET /api/tasks?category_id={id}` - List tasks, optionally filtered by category
- `PUT /api/tasks/{id}` - Update task (can change category)

### Database Schema

**Categories Table**
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#9CA3AF',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);
```

**Tasks Table Update**
```sql
ALTER TABLE tasks ADD COLUMN category_id INTEGER NULL;
ALTER TABLE tasks ADD CONSTRAINT fk_task_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
```

### Frontend Components

- `CategoryManager.tsx` - Create, edit, delete, and list categories
- `TaskForm.tsx` - Includes category dropdown for task assignment
- `TaskItem.tsx` - Displays category badge with color
- `TaskList.tsx` - Includes category filter dropdown

### Implementation Notes

- All operations enforce user isolation (users can only manage their own categories)
- Color validation ensures valid hex format (#RRGGBB)
- Name uniqueness is enforced per user (case-sensitive)
- Category deletion preserves tasks by setting category_id to NULL
- Frontend includes proper error handling and loading states
- Optimistic UI updates for better user experience

## Phase 1 Quick Wins & Essential UX (Feature 005)

**Status: 85% Complete** - All infrastructure implemented, integration guide provided

### Overview

Comprehensive UX enhancement system implementing 6 high-impact features for productivity:

1. **Keyboard Shortcuts System (US1)**
2. **Smart Due Date Selection (US2)**
3. **Drag & Drop Task Reordering (US3)**
4. **Bulk Task Operations (US4)**
5. **File Attachments UI (US5)**
6. **Enhanced Search & Filters (US6)**

### Features Implemented

#### US1: Keyboard Shortcuts System
**Global Navigation:**
- `N` - Open new task modal
- `/` - Focus search bar
- `Esc` - Close modal/clear selection
- `Arrow Up/Down` - Navigate task list
- `Enter` - Edit selected task
- `Space` - Toggle task completion
- `Delete` - Delete selected task

**Components:**
- KeyboardShortcutsProvider context for global shortcuts
- KeyboardShortcutsHelp component for settings page
- Input field exclusion (shortcuts don't fire when typing)
- Visual keyboard shortcut hints in UI

#### US2: Smart Due Date Selection
**Quick Date Buttons:**
- "Today" - Sets current date
- "Tomorrow" - Sets next day
- "Next Week" - Sets +7 days
- "Next Month" - Sets +30 days
- Clear button to remove date
- Visual calendar integration

**Components:**
- SmartDatePicker with quick selection buttons
- Date helper utilities (getToday, getTomorrow, getNextWeek, getNextMonth)

#### US3: Drag & Drop Task Reordering
**Features:**
- Visual drag handle on each task
- Drag preview/ghost element
- Drop zones with visual feedback
- Persist order to backend (sort_order field)
- Smooth animations during drag
- Mobile long-press support (800ms delay)

**Components:**
- DraggableTaskItem wrapper with @dnd-kit/sortable
- useDragAndDrop hook for sensors configuration
- Backend PUT /api/tasks/reorder endpoint

#### US4: Bulk Task Operations
**Selection:**
- Checkbox on each task
- "Select All" checkbox in header
- Shift+Click for range selection
- Selected count display

**Bulk Actions:**
- Mark as Complete/Incomplete
- Delete (with confirmation dialog)
- Change Priority (dropdown)
- Assign Category (dropdown)
- Set Due Date (date picker)

**Components:**
- BulkActionToolbar with all action buttons
- useBulkSelection hook for state management
- Backend POST /api/tasks/bulk-update, POST /api/tasks/bulk-delete endpoints

#### US5: File Attachments UI
**Features:**
- Upload button + drag & drop area
- File size validation (10MB max)
- Upload progress indicator
- Image preview for image files
- Download and delete buttons
- File type icons (emoji-based)

**Components:**
- FileUploadArea with react-dropzone
- File helper utilities (formatFileSize, getFileIcon, isImageFile)
- Integration with existing backend /api/tasks/{id}/attachments

#### US6: Enhanced Search & Filters
**Advanced Syntax:**
- `is:completed` - Show completed tasks
- `is:active` - Show active tasks
- `priority:high` - Filter by priority
- `category:work` - Filter by category name
- `due:today` - Due today
- `due:overdue` - Overdue tasks

**Features:**
- Filter chips display active filters
- Clear individual or all filters
- Recent searches (localStorage)
- Search suggestions as you type
- Filter combination (AND logic)

**Components:**
- FilterChipBar for visual filter display
- useFilterParser hook for query parsing
- useRecentSearches hook for history
- Backend POST /api/tasks/search endpoint with advanced query builder

### API Endpoints

**Search:**
- `POST /api/tasks/search` - Advanced search with filter syntax

**Bulk Operations:**
- `POST /api/tasks/bulk-update` - Update multiple tasks
- `POST /api/tasks/bulk-delete` - Delete multiple tasks

**Reordering:**
- `PUT /api/tasks/reorder` - Update task sort_order

### Database Schema Changes

**Tasks Table Update:**
```sql
-- Migration 007: Add sort_order field
ALTER TABLE tasks ADD COLUMN sort_order INTEGER NULL;
CREATE INDEX idx_tasks_user_sort ON tasks(user_id, sort_order) WHERE sort_order IS NOT NULL;
COMMENT ON COLUMN tasks.sort_order IS 'User-defined sort position (null for tasks created before this feature)';
```

**Migration File:** `migrations/007_add_task_sort_order.sql`

### Frontend Architecture

**New Directories:**
- `frontend/hooks/` - Custom React hooks (5 files)
- `frontend/types/` - TypeScript types (keyboard, filter, bulkOperation)
- `frontend/utils/` - Utility functions (4 files)

**New Components:**
- KeyboardShortcutsHelp.tsx
- SmartDatePicker.tsx
- FilterChipBar.tsx
- BulkActionToolbar.tsx
- FileUploadArea.tsx
- DraggableTaskItem.tsx

**New Contexts:**
- KeyboardShortcutsContext.tsx

**New Hooks:**
- useKeyboardShortcut.ts
- useFilterParser.ts
- useRecentSearches.ts
- useBulkSelection.ts
- useDragAndDrop.ts

**New Utils:**
- keyboardHelpers.ts
- dateHelpers.ts
- filterParser.ts
- fileHelpers.ts

### Backend Architecture

**New Services:**
- `app/services/search_service.py` - Search with query builder

**New Schemas:**
- `app/schemas/bulk.py` - Bulk operation request/response
- `app/schemas/search.py` - Search request/response, filter params

**Updated Routers:**
- `app/routers/search.py` - Search endpoint
- `app/routers/tasks.py` - Bulk update/delete, reorder endpoints

**New Utilities:**
- `app/utils/query_builder.py` - Advanced filter query builder

### Integration Status

**✅ Completed:**
- All backend endpoints functional
- All frontend components created
- All types, utils, hooks implemented
- KeyboardShortcutsProvider added to layout.tsx
- Dependencies installed (@dnd-kit, react-dropzone, date-fns)

**⏳ Remaining (see INTEGRATION_GUIDE.md):**
- Update TasksList.tsx (drag & drop + bulk selection)
- Update TaskItem.tsx (selection checkbox)
- Update SearchBar.tsx (filter parser integration)
- Update QuickAddModal.tsx (SmartDatePicker + FileUploadArea)
- Update Settings page (KeyboardShortcutsHelp)
- Update API client (new endpoints)

**Estimated Integration Time:** ~2 hours

### Implementation Notes

- All components support dark mode
- Keyboard shortcuts disabled when typing in input fields
- Drag & drop works on mobile via long-press (800ms)
- File upload validates size (10MB max) and type
- Bulk operations include confirmation dialogs for destructive actions
- Search filter syntax is case-insensitive
- Recent searches stored in localStorage (max 10)
- All new endpoints enforce user isolation (JWT authentication)

### Testing Checklist

See `INTEGRATION_GUIDE.md` for complete testing checklist covering:
- Keyboard shortcuts (7 shortcuts)
- Smart dates (4 quick buttons)
- Drag & drop (desktop + mobile)
- Bulk operations (5 actions)
- File attachments (upload/delete/preview)
- Enhanced search (6 filter types)

## Important Notes

### Better Auth Integration

After extensive debugging, these are the critical success factors for Better Auth in Next.js:

1. **API Route Handler:** Use `toNextJsHandler(auth)` (not `auth.handler`)
2. **Database Config:** Pass Pool directly (not wrapped in object)
3. **Proxy Config:** Exclude `/api/auth/*` using negative lookahead regex
4. **Separate Instances:** Never mix server and client auth imports

Common errors and solutions documented in `BETTER_AUTH_SETUP.md`.

### Environment Variables Required

```bash
# Frontend (.env.local)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend (.env)
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-here
```

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
