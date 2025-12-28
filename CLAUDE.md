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

## Phase III: AI-Powered Todo Chatbot (Feature 006)

**Status: Implementation Complete** - Natural language task management via conversational AI

### Overview

Conversational AI interface for task management using OpenAI GPT-4 with MCP (Model Context Protocol) tools. Users manage tasks through natural language without clicking buttons or filling forms.

### Architecture

**Backend Components:**
- **OpenAI Agent** (`app/agents/task_agent.py`): GPT-4 with function calling
- **MCP Server** (`app/mcp/server.py`): Tool registry and execution
- **MCP Tools** (`app/mcp/tools/`): 5 task operation tools
- **Chat API** (`app/routers/chat.py`): Stateless endpoint with conversation persistence
- **Database Models** (`app/models/`): Conversation and Message tables

**Frontend Components:**
- **Chat Page** (`app/(app)/chat/page.tsx`): Main chat interface with mobile-responsive sidebar
- **ChatInterface** (`components/ChatInterface.tsx`): Message display, input, tool call formatting
- **ConversationList** (`components/ConversationList.tsx`): Conversation history sidebar
- **Chat API Client** (`lib/chatApi.ts`): Backend integration

### MCP Tools

The AI agent has access to 5 task management tools:

1. **add_task**: Create new task
   - Parameters: `title` (required), `description`, `priority`, `due_date`, `category_id`
   - Returns: `task_id`, `status`, `title`

2. **list_tasks**: View tasks with filtering
   - Parameters: `status` (all/pending/completed), `category_id`, `limit`
   - Returns: Array of task objects with full details

3. **complete_task**: Mark task as complete/incomplete
   - Parameters: `task_id` (required), `completed` (boolean, default: true)
   - Returns: `task_id`, `status`, `title`

4. **update_task**: Modify task details
   - Parameters: `task_id` (required), `title`, `description`, `priority`, `due_date`, `category_id`
   - Returns: `task_id`, `status`, `title`, `updated_fields`

5. **delete_task**: Permanently delete task
   - Parameters: `task_id` (required)
   - Returns: `task_id`, `status`, `title`

### Security Architecture

**Critical Pattern: user_id Injection**
```python
# ❌ WRONG - Never accept user_id from AI
async def add_task(user_id: str, title: str, session: Session):
    # AI could impersonate users!

# ✅ CORRECT - Inject user_id from JWT token
async def execute_tool(tool_name: str, parameters: dict, user_id: str, db_session: Session):
    parameters_with_user = {
        **parameters,
        "user_id": user_id,  # From JWT, NOT from AI
        "session": db_session
    }
    result = await self.tools[tool_name](**parameters_with_user)
```

All MCP tools:
- Accept `user_id` and `session` via parameter injection
- Never accept `user_id` from AI parameters
- Validate ownership before mutations
- Enforce user isolation

### Stateless Server Design

**Key Principle**: Server holds NO state between requests

```python
@router.post("/api/chat")
async def chat(request: ChatRequest, current_user: User, session: Session):
    # 1. Get or create conversation
    conversation = get_or_create_conversation(request.conversation_id, current_user)

    # 2. Store user message in database
    store_message(conversation.id, "user", request.message)

    # 3. Fetch conversation history from database (last 20 messages)
    history = fetch_history(conversation.id, limit=20)

    # 4. Build messages array for OpenAI
    messages = [{"role": msg.role, "content": msg.content} for msg in history]

    # 5. Call OpenAI agent with tools
    response_text, tool_calls = await get_agent_response(
        messages, tool_schemas, tool_executor
    )

    # 6. Store assistant response in database
    store_message(conversation.id, "assistant", response_text)

    # 7. Return response (server state is clean)
    return ChatResponse(conversation_id=conversation.id, response=response_text, tool_calls=tool_calls)
```

Benefits:
- Server can restart without losing conversations
- Horizontal scaling works seamlessly
- No memory leaks from long conversations
- Clear separation between state (database) and logic (API)

### Error Handling & Retry Logic

OpenAI API calls include exponential backoff retry logic:

```python
# Handles:
# - Rate limit errors (429): Retry with backoff
# - API errors (500, 503): Retry with backoff
# - Connection errors: Retry with backoff
# Max retries: 3 attempts
# Backoff: 1s, 2s, 4s (with jitter)
```

### Mobile Responsiveness

Chat page is fully mobile-responsive:
- **Desktop**: Sidebar always visible
- **Mobile**: Sidebar hidden, accessible via hamburger menu
- **Overlay**: Dark overlay when sidebar open on mobile
- **Transitions**: Smooth slide-in/slide-out animations

### Natural Language Examples

```text
User: "Add a task to buy groceries tomorrow"
AI: [Calls add_task with title="Buy groceries", due_date="2025-12-28"]
    "I've added 'Buy groceries' to your tasks with a due date of tomorrow!"

User: "What's on my todo list?"
AI: [Calls list_tasks]
    "You have 5 tasks:
    ✓ Buy groceries (completed)
    □ Call mom (high priority, due today)
    □ Finish report (medium priority)
    ..."

User: "Mark task 3 as done"
AI: [Calls complete_task with task_id=3]
    "Great! I've marked 'Finish report' as complete."

User: "Delete the grocery task"
AI: [Calls list_tasks first to find task]
    "I found a completed task 'Buy groceries'. Are you sure you want to delete it?"
User: "Yes"
AI: [Calls delete_task]
    "Done! I've deleted 'Buy groceries' from your list."
```

### Environment Variables

```bash
# Required for Phase III
OPENAI_API_KEY=sk-...  # OpenAI API key for GPT-4

# Existing (still required)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Schema

**Conversations Table:**
```sql
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Testing

Quickstart scenarios (from `specs/006-ai-chatbot/quickstart.md`):
1. Add task via natural language
2. List tasks with different filters
3. Complete task by number
4. Delete task by name
5. Update task details
6. Create new conversation
7. Resume conversation after refresh
8. Authentication validation (401/403 errors)

### Key Files

**Backend:**
- `app/agents/task_agent.py` - OpenAI agent configuration
- `app/mcp/server.py` - MCP server and tool registry
- `app/mcp/tools/*.py` - 5 MCP tool implementations
- `app/routers/chat.py` - Chat API endpoint
- `app/models/conversation.py` - Conversation model
- `app/models/message.py` - Message model with role validation
- `app/schemas/chat.py` - Pydantic schemas for chat API

**Frontend:**
- `app/(app)/chat/page.tsx` - Chat page with sidebar
- `components/ChatInterface.tsx` - Main chat UI
- `components/ConversationList.tsx` - Conversation sidebar
- `lib/chatApi.ts` - Chat API client
- `types/chat.ts` - TypeScript interfaces

### Implementation Notes

- All conversations are user-isolated (JWT authentication)
- Tool calls are displayed in chat with special formatting
- List tasks shows checkbox icons, priority badges, due dates
- Delete operations require confirmation (AI system prompt)
- Conversation history limited to last 20 messages per request
- Mobile-responsive with hamburger menu sidebar toggle
- Dark mode support throughout
- Loading indicators show "Processing your request..." during AI calls
- Error handling with automatic retry for transient failures

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
