<!--
Sync Impact Report:
Version: 1.0.0 → 1.1.0 (MINOR version bump)
Rationale: Added new principles and sections to align with Hackathon II requirements

Modified Principles:
- None (existing 9 principles preserved)

Added Sections:
- Principle X: No Manual Coding (NON-NEGOTIABLE)
- Principle XI: AGENTS.md Architecture
- Principle XII: Process Documentation & Transparency
- API Design Standards: Added JWT security note about /api/tasks vs /api/{user_id}/tasks
- Project Structure: Added .specify/ directory and AGENTS.md requirements
- Hackathon Requirements: New section with submission and bonus points
- File Naming Conventions: Added speckit.* vs .md naming guidance

Removed Sections:
- None

Templates Requiring Updates:
⚠ .specify/templates/plan-template.md - Review for Phase II constraints
⚠ .specify/templates/spec-template.md - Update for web app requirements
⚠ .specify/templates/tasks-template.md - Add frontend/backend task types
✅ phase-2-web/constitution.md - Updated to v1.1.0

Follow-up TODOs:
- Create ADR for Better Auth integration decision
- Document TypeScript build errors resolution process
- Create AGENTS.md file at project root
- Set up SpecKit Plus MCP server for command prompts
- Create CLAUDE.md shim files (root, frontend, backend)
-->

# Todo Web App - Phase II Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)
All features MUST be developed through specifications first. Manual coding without specs is prohibited.

**Workflow**:
- Write comprehensive specifications using `sp.specify`
- Generate implementation plans using `sp.plan`
- Create actionable tasks using `sp.tasks`
- Execute implementation using `sp.implement`
- Analyze consistency using `sp.analyze`
- Document architectural decisions using `sp.adr`
- Commit using `sp.git.commit_pr`
- Test the implementation
- If issues arise, refine the specification and regenerate
- Never manually code without updating specs first

**Rationale**: This hackathon demonstrates mastery of Spec-Driven Development with Reusable Intelligence. The quality of specifications directly determines implementation quality. Using SpecKit Plus skills ensures consistency and traceability.

### II. Full-Stack Architecture
Phase II implements a production-ready full-stack web application with clear separation of concerns.

**Architecture Layers**:
- **Frontend**: Next.js 16 with App Router, TypeScript, TailwindCSS
- **Backend**: FastAPI with Python 3.13+, SQLModel for ORM
- **Database**: PostgreSQL via Neon Serverless
- **Authentication**: Better Auth v1.4.7 with JWT tokens
- **State Management**: React Context API
- **API Communication**: RESTful API with type-safe client

**Separation of Concerns**:
- Frontend handles UI/UX, client-side state, user interactions
- Backend handles business logic, data validation, database operations
- Database handles data persistence and integrity
- Authentication handled by Better Auth (shared database)

**Rationale**: Clean architecture enables independent development, testing, and scaling of each layer. Full-stack separation prepares for Phase III AI integration.

### III. Authentication & Security
Security MUST be built-in from the start, not added later.

**Requirements**:
- Better Auth v1.4.7 for authentication (MANDATORY)
- JWT tokens for API authentication
- Session management via Better Auth
- Password hashing (bcrypt)
- HTTPS in production
- CORS properly configured
- Environment variables for secrets
- No credentials in git
- Input validation on all endpoints
- SQL injection prevention (SQLModel ORM)
- XSS prevention (React escaping)

**Better Auth Integration**:
- Use `toNextJsHandler(auth)` in API routes
- Separate server (`lib/auth.ts`) and client (`lib/auth-client.ts`) instances
- Pass Pool directly to database config
- Exclude `/api/auth/*` from FastAPI proxy
- Share database between Better Auth and FastAPI

**Rationale**: Security breaches are catastrophic. Better Auth provides enterprise-grade security out of the box. JWT tokens enable stateless API authentication required for Phase III AI agents.

### IV. Database & Persistence
All application data MUST be persisted in PostgreSQL.

**Database Standards**:
- PostgreSQL via Neon Serverless (connection pooling built-in)
- SQLModel for Python ORM (type-safe)
- Migrations for schema changes
- Foreign key constraints enforced
- Timestamps on all entities (created_at, updated_at)
- Soft deletes where appropriate
- Database indexes on frequently queried fields

**Schema Design**:
- Normalized database structure
- Clear relationships (one-to-many, many-to-many)
- Consistent naming conventions (snake_case)
- Non-nullable fields where data is required
- Default values where appropriate

**Rationale**: Proper database design is foundational. Neon Serverless provides production-grade PostgreSQL without infrastructure overhead. SQLModel ensures type safety between Python code and database.

### V. Clean Code Standards
All code MUST follow industry best practices for TypeScript and Python.

**TypeScript/Frontend Standards**:
- Strict TypeScript mode enabled
- Type definitions for all props, functions, API responses
- ESLint + Prettier for code formatting
- Component-based architecture
- Custom hooks for reusable logic
- Error boundaries for error handling
- Semantic HTML
- Accessibility (a11y) considerations

**Python/Backend Standards**:
- Type hints for all function parameters and return values
- PEP 8 style guide compliance
- Pydantic models for request/response validation
- FastAPI dependency injection
- Async/await for database operations
- Comprehensive error handling with proper HTTP status codes
- OpenAPI documentation auto-generated

**Rationale**: Clean code is maintainable code. Phases III-V will extend this codebase. Type safety prevents entire classes of bugs at compile time.

### VI. User Experience Excellence
The web application MUST be intuitive, responsive, and delightful to use.

**UI/UX Requirements**:
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Loading states for async operations
- Error messages that guide users
- Success confirmations for all actions
- Optimistic UI updates where appropriate
- Keyboard navigation support
- Fast page loads (<2s initial)
- Smooth transitions and animations

**Component Library**:
- Reusable UI components (Button, Card, Input, etc.)
- Consistent design system
- TailwindCSS utility classes
- Component documentation

**Rationale**: Modern web users expect polished experiences. Good UX demonstrates professionalism and attention to detail. Responsive design is non-negotiable in 2025.

### VII. API Design Standards
Backend API MUST follow RESTful conventions and best practices.

**REST Principles**:
- Resource-based URLs (`/api/tasks`, `/api/categories`)
- HTTP verbs match operations (GET, POST, PUT, DELETE, PATCH)
- Proper HTTP status codes (200, 201, 204, 400, 401, 404, 500)
- Consistent error response format
- Pagination for list endpoints
- Filtering and sorting support
- API versioning strategy

**Authentication & Authorization**:
- **CRITICAL SECURITY**: Use `/api/tasks` NOT `/api/{user_id}/tasks`
- User identification MUST come from JWT token, not URL parameters
- Backend extracts user_id from authenticated token
- Automatic data filtering by authenticated user prevents unauthorized access
- URL-based user_id creates security vulnerability (users can manipulate URLs)

**Why JWT-Based Auth is Safer**:
```
❌ BAD:  GET /api/123/tasks (user can change 123 to 456)
✅ GOOD: GET /api/tasks (backend reads user_id from JWT token)
```

**Backend Pattern**:
```python
# FastAPI dependency extracts user from JWT
async def get_current_user(token: str = Depends(oauth2_scheme)):
    user_id = verify_jwt_token(token)  # From token, not URL
    return user_id

# Endpoint uses authenticated user
@app.get("/api/tasks")
async def get_tasks(user_id: str = Depends(get_current_user)):
    return db.query(Task).filter(Task.user_id == user_id).all()
```

**Request/Response Format**:
- JSON for all requests and responses
- Consistent field naming (snake_case for API, camelCase for frontend)
- Validation errors include field-level details
- Success responses include relevant data
- Error responses include message and details

**Rationale**: RESTful APIs are industry standard. Consistency reduces cognitive load. JWT-based authentication prevents entire classes of authorization vulnerabilities. Proper error handling improves developer experience.

### VIII. Testability by Design
The application architecture MUST enable comprehensive testing.

**Testing Strategy**:
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage targets (>80% for business logic)
- CI/CD pipeline executes tests automatically

**Architecture for Testing**:
- Dependency injection enables mocking
- Pure functions where possible
- Clear input/output contracts
- Test fixtures for database seeding
- Separate test database

**Rationale**: Bugs caught early are cheaper to fix. Automated tests enable confident refactoring. Phase IV deployment requires tested code.

### IX. Feature Scope - Phase II
Phase II implements a complete task management web application with intermediate features.

**Core Features (Basic Level)**:
1. User authentication (register, login, logout)
2. Add Task - Create tasks with title, description, priority
3. View Tasks - Display task list with filters and search
4. Update Task - Modify task details
5. Delete Task - Remove tasks
6. Mark as Complete - Toggle completion status

**Intermediate Features**:
7. Due Dates - Set deadlines with date picker
8. Priorities - Assign high/medium/low priority
9. Categories - Organize tasks by category
10. Search & Filter - Find tasks by keyword, status, priority, category
11. Sort Tasks - Reorder by various criteria

**Advanced Features (Stretch)**:
12. Subtasks - Break tasks into smaller steps
13. Comments - Add notes and discussions
14. Attachments - Upload files to tasks
15. Recurring Tasks - Auto-generate repeated tasks
16. Task Dependencies - Define task relationships
17. Calendar View - Visualize tasks by date
18. Kanban Board - Drag-and-drop task management
19. Dashboard Analytics - Charts and statistics

**Out of Scope (Phase III+)**:
- AI chatbot interface (Phase III)
- Kubernetes deployment (Phase IV)
- Event-driven architecture with Kafka (Phase V)
- Multi-tenancy
- Real-time collaboration
- Mobile apps

**Rationale**: Focused scope ensures quality. Core + Intermediate features provide complete MVP. Advanced features demonstrate technical depth. Clear boundaries prevent scope creep.

### X. No Manual Coding (NON-NEGOTIABLE)
All code MUST be generated through the Spec-Driven Development workflow. Manual coding is absolutely prohibited.

**Process Requirements**:
- ALL code generation MUST follow: Specify → Plan → Tasks → Implement
- Claude Code MUST be used with SpecKit Plus skills
- Every line of code MUST trace back to a task in tasks.md
- Every task MUST trace back to a requirement in spec.md
- NO "quick fixes" or "minor tweaks" without updating specs
- The **process itself will be judged**, not just the final code
- All prompts, iterations, and refinements MUST be documented

**What This Means**:
- Found a bug? Update spec → regenerate → fix properly
- Want to add a feature? Write spec → plan → tasks → implement
- Code review feedback? Refine spec → regenerate implementation
- Manual edits invalidate the work and require regeneration

**Rationale**: This hackathon evaluates mastery of AI-assisted development, not manual coding ability. Judges will review prompts, iterations, and the refinement process. Manual coding defeats the learning objective and will result in disqualification from scoring. The discipline of spec-driven development is the core competency being assessed.

### XI. AGENTS.md Architecture
The project MUST implement the AGENTS.md architectural pattern for cross-agent truth and consistency.

**Required Files**:
- **AGENTS.md** (project root): The "brain" - defines how ALL AI agents should behave
- **CLAUDE.md** (project root): Shim file containing only `@AGENTS.md`
- **CLAUDE.md** (frontend/): Frontend-specific patterns and conventions
- **CLAUDE.md** (backend/): Backend-specific patterns and conventions

**AGENTS.md Content**:
- Workflow hierarchy: Constitution → Specify → Plan → Tasks → Implement
- Agent behavior rules (no freestyle coding, no inferring requirements)
- Spec-Kit lifecycle documentation
- Task ID referencing requirements
- Failure modes to avoid (creative implementations, spec violations)

**Integration with SpecKit Plus**:
- SpecKit Plus MCP Server MUST expose .specify/commands as MCP prompts
- All agents (Claude, Copilot, Gemini) read AGENTS.md for consistency
- Each command updates its prompt variable before agent execution
- Commands available via MCP work across any connected IDE/agent

**Rationale**: Multiple AI agents (Claude Code, GitHub Copilot, Gemini) may touch this codebase across Phases II-V. AGENTS.md ensures they all follow the same rules, preventing divergent implementations. The MCP server makes SpecKit commands portable across tools.

### XII. Process Documentation & Transparency
Every AI-assisted exchange MUST be documented for evaluation and learning.

**Documentation Requirements**:
- **PHR (Prompt History Records)**: Create PHR for every spec/plan/task/implement cycle
- **Prompt Logs**: Save all prompts sent to Claude Code
- **Iteration History**: Document spec refinements and why they were needed
- **Decision Trail**: Record all architectural decisions in ADRs
- **Process Screenshots**: Capture key workflow moments for demo video

**PHR Standards**:
- Use `sp.phr` skill after every major exchange
- Include verbatim prompt text
- Include concise response summary
- Organize by stage (constitution/spec/plan/tasks/implement)
- Route to appropriate history/prompts/ directory

**Evaluation Criteria**:
- Judges will review **process quality**, not just code quality
- Clear, well-refined prompts demonstrate mastery
- Iteration history shows learning and improvement
- Poor prompts with good final code score lower than good process throughout

**Rationale**: The hackathon evaluates your ability to architect AI-assisted development, not just produce code. Documentation proves you understand the methodology. This transparency enables future developers to learn from your process.

## Technical Standards

### Technology Stack

**Frontend**:
- Next.js 16 (App Router)
- React 19
- TypeScript 5+
- TailwindCSS 4
- Better Auth v1.4.7 (client)
- Lucide React (icons)

**Backend**:
- Python 3.13+
- FastAPI 0.110+
- SQLModel 0.0.16+
- Pydantic 2+
- Uvicorn (ASGI server)
- psycopg2 (PostgreSQL driver)

**Database**:
- PostgreSQL 16 (via Neon Serverless)
- Connection pooling built-in

**Development Tools**:
- Git for version control
- npm for frontend package management
- pip/uv for backend package management
- ESLint + Prettier for linting
- Claude Code + SpecKit Plus for development

### Project Structure

**Required Directory Layout** (Hackathon Compliance):
```
hackathon-2/                     # Project root
├── .specify/                    # SpecKit Plus configuration (MANDATORY)
│   ├── memory/
│   │   └── constitution.md      # Phase I constitution (preserved)
│   ├── templates/
│   │   ├── spec-template.md
│   │   ├── plan-template.md
│   │   ├── tasks-template.md
│   │   └── phr-template.prompt.md
│   ├── scripts/
│   │   └── bash/
│   │       ├── create-new-feature.sh
│   │       └── create-phr.sh
│   └── commands/                # MCP server prompts source
│       ├── sp.specify.md
│       ├── sp.plan.md
│       ├── sp.tasks.md
│       └── sp.implement.md
├── specs/                       # All feature specifications (organized)
│   ├── 001-fix-typescript-errors/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   ├── tasks.md
│   │   └── checklists/
│   ├── 002-organize-folder-structure/
│   │   ├── spec.md
│   │   └── checklists/
│   └── features/                # Organized by type (optional)
│       ├── api/
│       ├── database/
│       └── ui/
├── history/                     # Process documentation (MANDATORY)
│   └── prompts/
│       ├── constitution/        # Constitutional PHRs
│       ├── 001-fix-typescript-errors/
│       ├── 002-organize-folder-structure/
│       └── general/
├── AGENTS.md                    # Cross-agent truth (MANDATORY)
├── CLAUDE.md                    # Root shim: @AGENTS.md (MANDATORY)
├── README.md                    # Setup instructions
└── phase-2-web/
    ├── constitution.md          # This file - Phase II principles
    ├── CLAUDE.md                # Phase II specific guidance
    ├── frontend/                # Next.js application
    │   ├── CLAUDE.md            # Frontend-specific patterns
    │   ├── app/
    │   │   ├── (auth)/          # Auth pages (login, register)
    │   │   ├── (app)/           # Protected pages (dashboard, tasks)
    │   │   └── api/auth/        # Better Auth API routes
    │   ├── components/          # React components
    │   ├── contexts/            # React contexts (Auth, Theme, etc.)
    │   ├── lib/                 # Core libraries (api, auth)
    │   ├── types/               # TypeScript type definitions
    │   ├── utils/               # Utility functions
    │   └── hooks/               # Custom React hooks
    └── backend/                 # FastAPI application
        ├── CLAUDE.md            # Backend-specific patterns
        └── app/
            ├── routers/         # API endpoints
            ├── models/          # SQLModel database models
            ├── dependencies/    # FastAPI dependencies
            ├── utils/           # Utility functions
            ├── config/          # Configuration
            ├── database.py      # Database connection
            └── main.py          # Application entry point
```

**File Naming Conventions** (SpecKit Plus):
- Both `spec.md` and `speckit.specify` are acceptable
- Both `plan.md` and `speckit.plan` are acceptable
- Both `tasks.md` and `speckit.tasks` are acceptable
- Prefer `.md` extension for human readability
- SpecKit Plus tools work with either convention

### Data Models

**Core Entities**:
- User (Better Auth managed)
- Task (title, description, completed, priority, due_date, category_id, user_id)
- Category (name, color, user_id)
- Subtask (title, completed, task_id, order)
- Comment (content, task_id, user_id, created_at)
- Attachment (filename, file_path, file_size, task_id)
- TaskDependency (task_id, depends_on_task_id)

**Relationships**:
- User has many Tasks
- User has many Categories
- Task belongs to User
- Task belongs to Category (optional)
- Task has many Subtasks
- Task has many Comments
- Task has many Attachments
- Task has many Dependencies (self-referential)

### Environment Variables

**Frontend (.env.local)**:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env)**:
```
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-here
ALLOWED_ORIGINS=http://localhost:3000
```

## Quality Criteria

### Specification Quality
- [ ] Constitution clearly defines Phase II principles
- [ ] Each feature has a complete spec.md
- [ ] Each feature has an implementation plan.md
- [ ] Each feature has a tasks.md breakdown
- [ ] All specs include acceptance criteria
- [ ] All specs include API contracts (if applicable)
- [ ] All specs include UI mockups or descriptions
- [ ] ADRs document major architectural decisions

### Code Quality
- [x] TypeScript builds without errors
- [ ] Python code passes type checking (mypy)
- [ ] ESLint passes with no errors
- [x] All components are properly typed
- [x] All API endpoints have Pydantic models
- [x] Error handling in all async operations
- [x] Loading states for all data fetches
- [x] No console errors in browser
- [ ] No TODO comments without tickets

### Functional Quality
- [x] Authentication works (register, login, logout)
- [x] All CRUD operations work correctly
- [x] Filters and search return correct results
- [x] Data persists across sessions
- [x] Foreign key relationships enforced
- [x] Optimistic updates work correctly
- [x] Error messages display properly
- [x] No data loss on errors

### Security Quality
- [x] Passwords are hashed (never plain text)
- [x] JWT tokens are validated on all protected routes
- [x] CORS configured correctly
- [x] SQL injection prevented (parameterized queries)
- [x] XSS prevented (React escaping)
- [x] Secrets in environment variables
- [x] No credentials in git history

### UI/UX Quality
- [x] Responsive on mobile, tablet, desktop
- [x] Dark mode works correctly
- [x] Loading states visible during operations
- [x] Error messages are helpful
- [x] Success feedback for all actions
- [x] Keyboard navigation works
- [x] Forms have proper validation
- [ ] Accessible (WCAG 2.1 AA basics)

### Submission Requirements (Hackathon Deliverables)
- [ ] **Public GitHub Repository** with complete source code
  - All source code for Phase II
  - /specs folder with all specification files organized by feature
  - /history/prompts folder with all PHRs documenting the process
  - AGENTS.md defining cross-agent behavior
  - CLAUDE.md files (root, frontend, backend)
  - README.md with comprehensive setup instructions
  - Clear folder structure following constitution requirements
- [ ] **Deployed Application Links**
  - Frontend deployed on Vercel (or similar)
  - Backend API URL accessible
  - Working demo available for judges to test
- [ ] **Demo Video** (MAXIMUM 90 seconds)
  - Demonstrate all implemented features
  - Show spec-driven development workflow (prompts, specs, generated code)
  - Judges will **ONLY watch the first 90 seconds**
  - Can use NotebookLM or screen recording
  - Upload to YouTube/Vimeo/Google Drive
- [ ] **WhatsApp Number** for presentation invitation
- [ ] **Spec History** folder showing iterative refinement process
- [ ] **Process Documentation** demonstrating AI-assisted development mastery

### Bonus Points Opportunities (+600 Total)
Beyond the base 150 points for Phase II, earn bonus points:

| Bonus Category | Points | Requirements |
|----------------|--------|--------------|
| **Reusable Intelligence** | +200 | Create and use custom agents/skills via Claude Code Subagents and Agent Skills |
| **Cloud-Native Blueprints** | +200 | Create and use deployment blueprints via Agent Skills (Phase IV/V prep) |
| **Multi-language Support** | +100 | Support Urdu language in chatbot interface (Phase III prep) |
| **Voice Commands** | +200 | Add voice input for todo commands (advanced) |

**How to Earn Reusable Intelligence Bonus**:
- Create custom agents for exploration, planning, code review, testing
- Build agent skills for common workflows (e.g., database migration skill)
- Document agent/skill creation process in README
- Show reusable intelligence used across multiple features
- Include agent definitions in repo

**How to Earn Cloud-Native Blueprints Bonus**:
- Create Helm chart templates
- Docker Compose configurations
- Kubernetes manifest generators
- Infrastructure-as-Code (Terraform/Pulumi)
- Show blueprints accelerate Phase IV/V deployment

## Governance

### Constitutional Authority
This constitution is the supreme governing document for Phase II development. All development decisions must align with these principles.

### Spec-Driven Workflow (MANDATORY)
1. **Specify**: Write spec.md using `sp.specify` or create manually
2. **Clarify**: Use `sp.clarify` if requirements unclear
3. **Plan**: Generate plan.md using `sp.plan`
4. **Task**: Create tasks.md using `sp.tasks`
5. **Analyze**: Run `sp.analyze` for consistency check
6. **Implement**: Execute using `sp.implement`
7. **ADR**: Document decisions using `sp.adr`
8. **Commit**: Use `sp.git.commit_pr` for git operations
9. **PHR**: Record exchange using `sp.phr`

**Violations**: Manual coding without specs invalidates the work. Refine specs and regenerate.

### Quality Gates
- **Before Implementation**: Spec must be complete and reviewed
- **After Implementation**: All acceptance criteria must pass
- **Before Commit**: TypeScript build must succeed, no lint errors
- **Before PR**: All quality criteria checkboxes must be checked

### Amendment Process
- Constitution changes require clear rationale in Sync Impact Report
- Version number must follow semantic versioning:
  - MAJOR: Backward incompatible changes (principle removal/redefinition)
  - MINOR: New principle added or material expansion
  - PATCH: Clarifications, typos, non-semantic changes
- Last amended date must be updated to today (ISO format)
- Templates must be checked for consistency
- Changes must maintain Phase II scope boundaries

### Phase Transition Principles
- Phase II code is the foundation for Phase III (AI Chatbot)
- API design must support conversational interfaces
- Database schema must support AI agent operations
- Authentication must work for both users and AI agents
- Architecture must be cloud-native ready (Phase IV)

### Reusable Intelligence
- Create custom agents for repetitive tasks
- Build skills for common workflows
- Document agent/skill creation for team learning
- Share reusable intelligence across phases
- +200 bonus points for demonstrating reusable intelligence

### Evaluation Criteria
**Process Quality (40%)**:
- Quality of prompts and specifications
- Iteration and refinement process
- PHR completeness and clarity
- Adherence to spec-driven workflow

**Code Quality (30%)**:
- Type safety and clean code
- Architecture alignment with specs
- Security best practices
- Error handling and edge cases

**Feature Completeness (20%)**:
- Core features fully implemented
- Intermediate features functional
- Advanced features (bonus)
- User experience polish

**Documentation (10%)**:
- README clarity
- Spec organization
- Process transparency
- AGENTS.md completeness

**Version**: 1.1.0
**Ratified**: 2025-12-23
**Last Amended**: 2025-12-23
**Phase**: II - Full-Stack Web Application
**Hackathon**: The Evolution of Todo - Hackathon II
**Submission Deadline**: Sunday, December 14, 2025
**Base Points**: 150 (+ up to 600 bonus points)
