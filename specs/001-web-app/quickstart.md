# Quickstart Guide: Web-Based Todo Application

**Goal**: Get the full-stack todo application running locally in under 15 minutes

**Stack**: FastAPI (backend) + Next.js 16+ (frontend) + Neon PostgreSQL (database) + Better Auth (authentication)

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.13+** (or 3.12 minimum)
  ```bash
  python --version
  ```

- **Node.js 18+** with npm
  ```bash
  node --version
  npm --version
  ```

- **UV** (Python package manager)
  ```bash
  # Install UV
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Verify installation
  uv --version
  ```

- **Git** (for cloning the repository)
  ```bash
  git --version
  ```

- **Neon Account** (free tier)
  - Sign up at: https://neon.tech
  - Create a new project
  - Copy the connection string

---

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hackathon-2.git
cd hackathon-2
git checkout 001-web-app
```

---

### 2. Database Setup (Neon PostgreSQL)

1. **Create Neon Project**:
   - Go to https://console.neon.tech
   - Click "New Project"
   - Name: `todo-app`
   - Region: Choose closest to you
   - PostgreSQL version: 15 (latest)

2. **Get Connection String**:
   - Click on your project
   - Go to "Connection Details"
   - Copy the connection string (format: `postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname`)

3. **Test Connection** (optional):
   ```bash
   # Install psql if needed
   brew install postgresql  # macOS
   sudo apt install postgresql-client  # Ubuntu

   # Test connection
   psql "postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"
   ```

---

### 3. Backend Setup (FastAPI)

#### 3.1 Navigate to Backend Directory

```bash
cd backend
```

#### 3.2 Install Dependencies

```bash
# Create virtual environment and install dependencies
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install all dependencies
uv pip install fastapi uvicorn sqlmodel psycopg2-binary passlib python-jose python-multipart httpx pytest
```

Or create `pyproject.toml`:

```toml
[project]
name = "todo-backend"
version = "1.0.0"
requires-python = ">=3.12"

dependencies = [
    "fastapi>=0.100.0",
    "uvicorn[standard]>=0.23.0",
    "sqlmodel>=0.14.0",
    "psycopg2-binary>=2.9.0",
    "passlib[bcrypt]>=1.7.0",
    "python-jose[cryptography]>=3.3.0",
    "python-multipart>=0.0.6",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "httpx>=0.24.0",
]
```

Then:
```bash
uv pip install -e ".[dev]"
```

#### 3.3 Configure Environment Variables

Create `.env` file in `backend/` directory:

```bash
# backend/.env
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
SECRET_KEY=your-super-secret-key-change-in-production
BETTER_AUTH_SECRET=your-better-auth-secret-change-in-production
ALLOWED_ORIGINS=http://localhost:3000
```

**Generate secure keys**:
```bash
# Generate SECRET_KEY
python -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"

# Generate BETTER_AUTH_SECRET (must be same in frontend and backend)
python -c "import secrets; print('BETTER_AUTH_SECRET=' + secrets.token_urlsafe(32))"
```

#### 3.4 Create Database Tables

The application will automatically create tables on startup (using `SQLModel.metadata.create_all()`).

#### 3.5 Run Backend Server

```bash
# Start the server
uvicorn app.main:app --reload --port 8000

# Server will be available at:
# http://localhost:8000
# API docs: http://localhost:8000/docs
```

#### 3.6 Test Backend (Optional)

```bash
# Run tests
pytest

# Check API health
curl http://localhost:8000/
# Expected: {"message":"Todo API is running"}

# Check API docs
open http://localhost:8000/docs  # Opens Swagger UI
```

---

### 4. Frontend Setup (Next.js)

Open a **new terminal window** (keep backend running).

#### 4.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 4.2 Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Better Auth (authentication)
- React Hook Form
- Zod (validation)

#### 4.3 Configure Environment Variables

Create `.env.local` file in `frontend/` directory:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-better-auth-secret-change-in-production
```

**IMPORTANT**: The `BETTER_AUTH_SECRET` must be the **same** value as in the backend `.env` file. This shared secret is used to sign and verify JWT tokens.

#### 4.4 Run Frontend Server

```bash
npm run dev

# Server will be available at:
# http://localhost:3000
```

#### 4.5 Configure Better Auth

Better Auth requires configuration to connect with your backend:

1. **Create Better Auth configuration file** (`frontend/lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth/client";

export const authClient = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  plugins: [
    // JWT plugin for token-based authentication
  ],
});
```

2. **Better Auth handles**:
   - User registration UI
   - Login UI
   - JWT token generation
   - Token storage (localStorage)
   - Automatic token refresh
   - Session management

3. **Backend verifies tokens** issued by Better Auth using the shared `BETTER_AUTH_SECRET`.

#### 4.6 Test Frontend (Optional)

```bash
# Run tests
npm test

# Build for production (optional)
npm run build
```

---

## Verify Installation

### Backend Health Check

```bash
# Terminal 1: Backend should be running on port 8000
curl http://localhost:8000/

# Expected output:
# {"message":"Todo API is running"}
```

### API Documentation

Open your browser:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Frontend Access

Open your browser:
- **Frontend**: http://localhost:3000

You should see the todo app landing page.

---

## First User Creation

### Option 1: Via Frontend UI

1. Open http://localhost:3000
2. Click "Register"
3. Enter email and password
4. You'll be automatically logged in

### Option 2: Via API (curl)

```bash
# Register new user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123"
  }'

# Expected: {"access_token":"eyJ...", "token_type":"bearer"}

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123"
  }'

# Save the token and user_id for authenticated requests
TOKEN="<your-token-here>"
USER_ID="<user-id-from-token>"  # Extract from JWT token payload (sub field)

# Get current user info (to get user_id)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
# Save the "id" from response as USER_ID

# Create a task
curl -X POST http://localhost:8000/api/$USER_ID/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My first task",
    "description": "This is a test task"
  }'

# List tasks
curl -X GET http://localhost:8000/api/$USER_ID/tasks \
  -H "Authorization: Bearer $TOKEN"
```

---

## Development Workflow

### Running Both Servers

**Terminal 1 (Backend)**:
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Making Changes

**Backend Changes**:
- Edit files in `backend/app/`
- Server auto-reloads (uvicorn --reload)
- Check logs in terminal

**Frontend Changes**:
- Edit files in `frontend/app/` or `frontend/components/`
- Next.js auto-reloads
- Check browser console for errors

### Running Tests

**Backend**:
```bash
cd backend
pytest -v
```

**Frontend**:
```bash
cd frontend
npm test
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed

**Symptom**: `could not connect to server`

**Solution**:
1. Check DATABASE_URL is correct
2. Ensure ?sslmode=require is included
3. Verify Neon project is active (not paused)
4. Check network connectivity

```bash
# Test connection
psql "$DATABASE_URL"
```

### Issue: Port Already in Use

**Symptom**: `Address already in use`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --reload --port 8001
```

### Issue: Module Not Found

**Symptom**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
# Activate virtual environment
cd backend
source .venv/bin/activate

# Reinstall dependencies
uv pip install -e ".[dev]"
```

### Issue: CORS Error in Frontend

**Symptom**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
1. Check backend `.env` has correct `ALLOWED_ORIGINS`
2. Restart backend server
3. Verify CORS middleware in `app/main.py`

### Issue: JWT Token Invalid

**Symptom**: `401 Unauthorized` on authenticated requests

**Solution**:
1. Check token is being sent: `Authorization: Bearer <token>`
2. Verify SECRET_KEY matches between requests
3. Token may be expired (generate new one via login)

---

## Project Structure Overview

```
hackathon-2/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI app entry point
│   │   ├── database.py     # Database connection
│   │   ├── models/         # SQLModel database models
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── tests/              # Pytest tests
│   ├── .env                # Environment variables (create this)
│   └── pyproject.toml      # Dependencies
│
├── frontend/               # Next.js 16+ frontend
│   ├── app/                # Next.js 16+ App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities (API client, auth, etc.)
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React contexts (auth state)
│   ├── .env.local          # Environment variables (create this)
│   └── package.json        # Dependencies
│
└── specs/001-web-app/      # Feature specifications
    ├── spec.md             # Feature spec
    ├── plan.md             # Implementation plan
    ├── research.md         # Technology decisions
    ├── data-model.md       # Database schema
    ├── quickstart.md       # This file
    └── contracts/          # API contracts
```

---

## Next Steps

After successful setup:

1. **Explore the API**:
   - Visit http://localhost:8000/docs
   - Try the endpoints using Swagger UI
   - Create users and tasks

2. **Explore the Frontend**:
   - Register a new account
   - Create, update, and delete tasks
   - Test filtering and sorting

3. **Run Tests**:
   - Backend: `cd backend && pytest`
   - Frontend: `cd frontend && npm test`

4. **Start Development**:
   - Refer to `specs/001-web-app/tasks.md` for implementation tasks
   - Use expert agents in `.claude/agents/` for guidance
   - Follow the plan in `specs/001-web-app/plan.md`

---

## Support

- **API Documentation**: http://localhost:8000/docs
- **GitHub Issues**: https://github.com/YOUR_USERNAME/hackathon-2/issues
- **Spec Files**: `specs/001-web-app/`
- **Expert Agents**: `.claude/agents/` (database, backend, frontend, UI, testing)

---

**Status**: ✅ Quickstart guide complete
**Estimated Setup Time**: 10-15 minutes
**Next**: Generate implementation tasks with `/sp.tasks`
