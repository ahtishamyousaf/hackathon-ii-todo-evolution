# Quick Start Guide: Task Management System

**Feature**: 003-task-crud
**Branch**: `003-task-crud`
**Prerequisites**: Existing Phase II infrastructure (Better Auth, Neon PostgreSQL, Next.js 16, FastAPI)

## Table of Contents

1. [Setup](#setup)
2. [Development Workflow](#development-workflow)
3. [Testing Scenarios](#testing-scenarios)
4. [API Examples](#api-examples)
5. [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites Check

Before starting, ensure you have:

- [x] Node.js 18+ and npm installed
- [x] Python 3.13+ installed
- [x] Neon PostgreSQL database provisioned
- [x] Better Auth configured and working
- [x] Phase II infrastructure running

### Environment Variables

#### Frontend (.env.local)

```bash
# Neon PostgreSQL connection
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# Better Auth secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET=your-secret-here-minimum-32-characters

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Backend (.env)

```bash
# Neon PostgreSQL connection (same as frontend)
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# JWT secret key (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-here

# CORS origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Better Auth secret (must match frontend)
BETTER_AUTH_SECRET=your-secret-here-minimum-32-characters
```

### Database Migration

Run database migration to create `tasks` table:

```bash
# Option 1: SQLModel auto-creation (MVP approach)
# Table will be created automatically on backend startup via SQLModel.metadata.create_all()

# Option 2: Manual SQL migration (recommended for production)
psql $DATABASE_URL << 'EOF'
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
    description VARCHAR(1000) DEFAULT '',
    completed BOOLEAN DEFAULT false,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EOF
```

### Backend Setup

```bash
cd phase-2-web/backend

# Activate virtual environment (if using one)
source .venv/bin/activate  # Linux/Mac
# OR
.venv\Scripts\activate  # Windows

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Start FastAPI server
.venv/bin/python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test backend**:
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}
```

### Frontend Setup

```bash
cd phase-2-web/frontend

# Install dependencies (if not already installed)
npm install

# Start Next.js dev server
npm run dev
```

**Expected output**:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Test frontend**:
Open browser to http://localhost:3000 - should see login page

## Development Workflow

### 1. Start Development Servers

**Terminal 1 - Backend**:
```bash
cd phase-2-web/backend
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd phase-2-web/frontend
npm run dev
```

### 2. User Authentication

Before testing task features:

1. Navigate to http://localhost:3000/register
2. Create test account:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Name: `Test User`
3. Login with credentials
4. Should redirect to http://localhost:3000/dashboard

### 3. Access Task Management

- **Task List Page**: http://localhost:3000/tasks
- **Dashboard**: http://localhost:3000/dashboard (may include task summary)

### 4. Development Cycle

1. Make code changes (backend or frontend)
2. Save files (auto-reload enabled)
3. Test in browser
4. Check console for errors:
   - Backend: Terminal 1 output
   - Frontend: Browser DevTools Console (F12)

## Testing Scenarios

### Manual Test Scenarios

Execute these scenarios to validate implementation:

#### Scenario 1: Complete Task Lifecycle (5 minutes)

**User Story Coverage**: US-001, US-002, US-003, US-004, US-005

1. **Login**: Navigate to http://localhost:3000/login
2. **Create Task**:
   - Click "Add Task" or "New Task" button
   - Enter title: `Buy groceries`
   - Enter description: `Milk, eggs, bread`
   - Click "Create" or "Save"
   - **Expected**: Task appears in list as incomplete
3. **View Task**:
   - **Expected**: See task in list with title, description, incomplete status
4. **Mark Complete**:
   - Click checkbox or "Complete" button on task
   - **Expected**: Visual indicator shows task as completed (strikethrough, checkmark, etc.)
5. **Edit Task**:
   - Click "Edit" button on task
   - Change title to: `Buy groceries - Done`
   - Click "Save"
   - **Expected**: Updated title shows in list
6. **Delete Task**:
   - Click "Delete" button on task
   - **Expected**: Confirmation prompt appears
   - Click "Confirm" or "Yes"
   - **Expected**: Task disappears from list
7. **Refresh Page**:
   - Press F5 or reload page
   - **Expected**: Changes persist (deleted task stays deleted)

**Success Criteria**:
- ✅ All operations complete within 10 seconds each (SC-001, SC-004)
- ✅ Changes persist after page refresh (SC-006)
- ✅ Deletion requires confirmation (SC-007)

#### Scenario 2: Multi-User Isolation (3 minutes)

**User Story Coverage**: US-002 (FR-006)

1. **User A Setup**:
   - Register/login as `userA@example.com`
   - Create 3 tasks: `Task A1`, `Task A2`, `Task A3`
   - Note task count: 3
2. **User B Setup**:
   - Logout User A
   - Register/login as `userB@example.com`
   - Create 5 tasks: `Task B1`, `Task B2`, `Task B3`, `Task B4`, `Task B5`
   - Note task count: 5
3. **User A Verification**:
   - Logout User B
   - Login as User A
   - **Expected**: See only 3 tasks (Task A1, A2, A3)
   - **Expected**: NO User B tasks visible
4. **User B Verification**:
   - Logout User A
   - Login as User B
   - **Expected**: See only 5 tasks (Task B1-B5)
   - **Expected**: NO User A tasks visible

**Success Criteria**:
- ✅ 100% user isolation - no cross-user data leakage (SC-003, SC-005)

#### Scenario 3: Input Validation (2 minutes)

**User Story Coverage**: US-001, US-003 (FR-001, FR-007)

1. **Empty Title Test**:
   - Click "Add Task"
   - Leave title empty
   - Try to save
   - **Expected**: Error message "Title is required"
   - **Expected**: Task NOT created
2. **Very Long Title Test**:
   - Enter title with 250 characters (exceeds 200 limit)
   - Try to save
   - **Expected**: Validation error or truncation warning
3. **Very Long Description Test**:
   - Enter description with 1500 characters (exceeds 1000 limit)
   - Try to save
   - **Expected**: Validation error or truncation warning
4. **Valid Minimal Task**:
   - Enter title: `Call dentist`
   - Leave description empty
   - Save
   - **Expected**: Task created successfully with empty description

**Success Criteria**:
- ✅ Empty title rejected (FR-007)
- ✅ Max lengths enforced (FR-001)
- ✅ Empty description allowed (FR-001)

#### Scenario 4: Edge Case Handling (3 minutes)

1. **Empty Task List**:
   - Login with fresh account (no tasks)
   - Navigate to tasks page
   - **Expected**: Friendly message "No tasks yet. Create your first task!"
2. **Whitespace-Only Title**:
   - Create task with title: `   ` (spaces only)
   - **Expected**: Validation error "Title is required"
3. **Toggle Multiple Times**:
   - Create task
   - Mark complete → **Expected**: Shows as completed
   - Mark incomplete → **Expected**: Shows as incomplete
   - Mark complete again → **Expected**: Shows as completed
   - Refresh page → **Expected**: Still shows as completed
4. **Concurrent Browser Tabs**:
   - Open task list in Tab 1
   - Open same task list in Tab 2
   - Delete task in Tab 1
   - Refresh Tab 2
   - **Expected**: Deleted task disappears in Tab 2

**Success Criteria**:
- ✅ Empty state handled gracefully
- ✅ Whitespace validation works
- ✅ State persistence across operations

## API Examples

### Using curl

#### 1. Login and Get Token

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }' \
  -c cookies.txt

# Extract JWT token from cookies or response
# Token will be in session cookie or Authorization header
export TOKEN="your-jwt-token-here"
```

#### 2. Create Task

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project report",
    "description": "Include Q4 metrics"
  }'

# Expected response:
# {
#   "id": 1,
#   "title": "Complete project report",
#   "description": "Include Q4 metrics",
#   "completed": false,
#   "user_id": 42,
#   "created_at": "2025-12-24T10:30:00Z",
#   "updated_at": "2025-12-24T10:30:00Z"
# }
```

#### 3. List All Tasks

```bash
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
# [
#   {
#     "id": 1,
#     "title": "Complete project report",
#     "description": "Include Q4 metrics",
#     "completed": false,
#     "user_id": 42,
#     "created_at": "2025-12-24T10:30:00Z",
#     "updated_at": "2025-12-24T10:30:00Z"
#   }
# ]
```

#### 4. Get Single Task

```bash
curl -X GET http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Update Task

```bash
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete quarterly review",
    "description": "Updated description"
  }'
```

#### 6. Toggle Complete

```bash
curl -X PATCH http://localhost:8000/api/tasks/1/complete \
  -H "Authorization: Bearer $TOKEN"

# First call: completed = true
# Second call: completed = false (toggle)
```

#### 7. Delete Task

```bash
curl -X DELETE http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN"

# Expected: HTTP 204 No Content
```

### Using Browser DevTools

1. **Open DevTools**: F12 → Console tab
2. **Get auth token** (Better Auth stores in cookies automatically)
3. **Test API**:

```javascript
// Create task
const createTask = async () => {
  const response = await fetch('http://localhost:8000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Token included automatically by Better Auth
    },
    credentials: 'include',
    body: JSON.stringify({
      title: 'Test task from DevTools',
      description: 'Testing API'
    })
  });
  const data = await response.json();
  console.log('Created:', data);
  return data;
};

createTask();

// List tasks
fetch('http://localhost:8000/api/tasks', {
  credentials: 'include'
})
  .then(r => r.json())
  .then(tasks => console.log('Tasks:', tasks));
```

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error**: `Command 'uvicorn' not found`

**Solution**:
```bash
# Use module syntax instead
cd phase-2-web/backend
.venv/bin/python -m uvicorn app.main:app --reload
```

**Error**: `Address already in use (port 8000)`

**Solution**:
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
.venv/bin/python -m uvicorn app.main:app --reload --port 8001
```

#### 2. Database Connection Failed

**Error**: `could not connect to server`

**Solution**:
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# Test connection manually
psql $DATABASE_URL -c "SELECT version();"
```

#### 3. Authentication Errors

**Error**: `401 Unauthorized` on API calls

**Solution**:
1. Verify user is logged in (check session in DevTools → Application → Cookies)
2. Check JWT token is being sent (Network tab → Request Headers)
3. Verify SECRET_KEY matches between frontend and backend
4. Try logout and login again

#### 4. Tasks Table Not Found

**Error**: `relation "tasks" does not exist`

**Solution**:
```bash
# Run migration manually
psql $DATABASE_URL << 'EOF'
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL CHECK (length(title) >= 1),
    description VARCHAR(1000) DEFAULT '',
    completed BOOLEAN DEFAULT false,
    user_id INTEGER NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
EOF
```

#### 5. CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
```python
# In phase-2-web/backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 6. Frontend Build Errors

**Error**: `Module not found: Can't resolve 'components/TaskList'`

**Solution**:
```bash
# Check import paths use @ alias
# Good: import TaskList from '@/components/TaskList'
# Bad:  import TaskList from 'components/TaskList'

# Rebuild
npm run build
```

### Performance Issues

#### Slow Task List Loading

**Symptoms**: Task list takes >2 seconds to load (violates SC-002)

**Diagnosis**:
```bash
# Check query performance
psql $DATABASE_URL << 'EOF'
EXPLAIN ANALYZE
SELECT * FROM tasks
WHERE user_id = 42
ORDER BY created_at DESC;
EOF
```

**Solution**:
1. Verify indexes exist: `idx_tasks_user_id`, `idx_tasks_user_created`
2. Add pagination if user has >100 tasks
3. Check network latency (Neon connection time)

### Validation Not Working

**Symptoms**: Empty title allowed, or validation errors not shown

**Checklist**:
- [ ] Backend: SQLModel Field validators set (`min_length=1`)
- [ ] Backend: Pydantic validation enabled in schemas
- [ ] Frontend: Form validation in TaskForm component
- [ ] Frontend: Error messages displayed to user
- [ ] Database: CHECK constraints in CREATE TABLE

### User Sees Other Users' Tasks

**THIS IS CRITICAL - SECURITY VIOLATION**

**Immediate Action**:
1. Check backend route: `user: User = Depends(get_current_user)` present
2. Verify query filter: `WHERE user_id == user.id`
3. Test with multiple accounts (Scenario 2 above)
4. Check JWT token extraction works correctly

**Validation**:
```bash
# Should return ONLY authenticated user's tasks
curl -X GET http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

## Quick Reference

### File Structure

```
phase-2-web/
├── backend/app/
│   ├── models/task.py              # Task SQLModel
│   ├── routers/tasks.py            # Task API endpoints
│   └── dependencies/auth.py        # get_current_user dependency
└── frontend/
    ├── app/(app)/tasks/page.tsx    # Task list page
    ├── components/
    │   ├── TaskList.tsx            # Task list container
    │   ├── TaskForm.tsx            # Create/edit form
    │   └── TaskItem.tsx            # Single task display
    ├── types/task.ts               # TypeScript types
    └── lib/api.ts                  # API client (extended)
```

### Key URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs (Swagger UI)
- Task List: http://localhost:3000/tasks

### Performance Targets

- Task list load: < 2 seconds (SC-002)
- Task operations: < 1 second (SC-004)
- API response: < 500ms p95
- Database query: < 100ms per operation

### Next Steps

1. ✅ Complete setup (backend, frontend, database)
2. ✅ Run Manual Test Scenario 1 (Complete Lifecycle)
3. ✅ Run Manual Test Scenario 2 (User Isolation) - CRITICAL
4. ✅ Run Manual Test Scenario 3 (Input Validation)
5. ✅ Fix any issues found
6. → Proceed to automated testing (Phase III)
7. → Deploy to production (Phase IV)
