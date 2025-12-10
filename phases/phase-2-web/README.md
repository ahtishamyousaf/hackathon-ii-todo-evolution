# Phase II: Web Application

**Status**: 🔜 Not Started
**Points**: 150 base + bonuses
**Dependencies**: Phase I (reuse models and business logic)

---

## Overview

Transform the console app into a full-stack web application with modern UI and persistent storage.

### Requirements

**Frontend**:
- Next.js (React framework)
- TypeScript
- Tailwind CSS
- Responsive design

**Backend**:
- FastAPI (Python)
- SQLModel (database ORM)
- Neon (PostgreSQL database)
- RESTful API

**Authentication**:
- Better Auth integration
- User registration and login
- Session management

---

## Planned Features

### Core Features (from Phase I)
1. Add Task (POST /tasks)
2. View Tasks (GET /tasks)
3. Update Task (PUT /tasks/:id)
4. Delete Task (DELETE /tasks/:id)
5. Mark Complete (PATCH /tasks/:id/toggle)

### New Features
6. **User Authentication** - Register, login, logout
7. **User-specific Tasks** - Each user sees only their tasks
8. **Task Filtering** - By status, date, search
9. **Task Sorting** - By date, title, status
10. **Pagination** - Handle large task lists

### Bonus Opportunities
- **Reusable Intelligence**: Use CRUD Spec Generator for new entities
- **Cloud-Native Blueprints**: Create deployment configurations
- **Real-time Updates**: WebSocket integration

---

## Technology Stack

### Frontend
```
frontend/
├── app/               # Next.js 14 App Router
├── components/        # React components
├── lib/              # Utilities
├── types/            # TypeScript types
└── package.json
```

### Backend
```
backend/
├── app/
│   ├── models/       # SQLModel entities
│   ├── routers/      # API endpoints
│   ├── services/     # Business logic
│   └── main.py       # FastAPI app
├── tests/            # Pytest tests
└── pyproject.toml
```

---

## Reusable from Phase I

### Models (`phase-1-console/src/models.py`)
- Task dataclass → SQLModel
- Field definitions and validation

### Business Logic (`phase-1-console/src/task_manager.py`)
- CRUD operations logic
- Validation rules
- Statistics calculations

### Tests (`phase-1-console/tests/`)
- Adapt for API testing
- Keep business logic tests

---

## API Design

### Endpoints

```python
# Tasks
POST   /api/tasks              # Create task
GET    /api/tasks              # List tasks (with filters)
GET    /api/tasks/{id}         # Get single task
PUT    /api/tasks/{id}         # Update task
DELETE /api/tasks/{id}         # Delete task
PATCH  /api/tasks/{id}/toggle  # Toggle complete

# Users
POST   /api/auth/register      # Register user
POST   /api/auth/login         # Login
POST   /api/auth/logout        # Logout
GET    /api/auth/me            # Get current user
```

### Request/Response Examples

**Create Task**:
```json
POST /api/tasks
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

Response 201:
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "user_id": 123,
  "created_at": "2025-12-10T15:30:00Z",
  "updated_at": "2025-12-10T15:30:00Z"
}
```

---

## Database Schema

### Tables

**users**:
- id (UUID, primary key)
- email (string, unique)
- password_hash (string)
- created_at (timestamp)

**tasks**:
- id (integer, primary key)
- user_id (UUID, foreign key)
- title (string, max 200)
- description (string, max 1000)
- completed (boolean)
- created_at (timestamp)
- updated_at (timestamp)

---

## Development Plan

### Phase II.1: Setup (1-2 days)
1. Initialize Next.js frontend
2. Initialize FastAPI backend
3. Set up Neon database
4. Configure Better Auth

### Phase II.2: Backend (2-3 days)
1. Create SQLModel models
2. Implement API endpoints
3. Add authentication middleware
4. Write API tests

### Phase II.3: Frontend (2-3 days)
1. Create UI components
2. Implement task CRUD operations
3. Add authentication pages
4. Style with Tailwind CSS

### Phase II.4: Integration (1-2 days)
1. Connect frontend to backend
2. Test end-to-end
3. Handle errors gracefully
4. Deploy to staging

---

## Bonus Feature Ideas

### Reusable Intelligence
- Generate CRUD specs for "Project" entity
- Generate CRUD specs for "Tag" entity
- Use CRUD Spec Generator skill from Phase I

### Cloud-Native Blueprints
- Docker Compose for local development
- Kubernetes manifests preparation
- CI/CD pipeline configuration

---

## Success Criteria

### Functional Requirements
- [ ] All Phase I features work in web UI
- [ ] User authentication and authorization
- [ ] Database persistence (Neon)
- [ ] Responsive design (mobile + desktop)
- [ ] Error handling and validation

### Technical Requirements
- [ ] RESTful API design
- [ ] Type safety (TypeScript + Python type hints)
- [ ] Automated tests (frontend + backend)
- [ ] Clean code and architecture
- [ ] Documentation

### Performance Requirements
- [ ] Page load < 2 seconds
- [ ] API response < 200ms
- [ ] Smooth animations
- [ ] Efficient database queries

---

## Resources

- **Phase I Implementation**: `../phase-1-console/`
- **CRUD Spec Generator**: `../../.claude/skills/crud-spec-generator.md`
- **Templates**: `../../.specify/templates/`

---

**Status**: 🔜 Coming Soon (after Phase I submission)
