# Claude Code Configuration

This directory contains expert agents, skills, and commands for Phase II development.

## 📁 Structure

```
.claude/
├── agents/              # Domain expert agents
│   ├── database-expert.md
│   ├── backend-expert.md
│   ├── frontend-expert.md
│   ├── ui-expert.md
│   └── testing-expert.md
├── skills/              # Technology quick references
│   ├── crud-spec-generator.md
│   ├── fastapi.md
│   ├── nextjs.md
│   ├── sqlmodel.md
│   ├── neon-postgres.md
│   ├── better-auth.md
│   └── tailwind-css.md
├── commands/            # SpecKit Plus slash commands
│   ├── sp.specify.md
│   ├── sp.plan.md
│   ├── sp.tasks.md
│   └── ...
└── README.md           # This file
```

## 🤖 Expert Agents

Specialized AI agents for different aspects of development:

### Database Expert
**Use for**: Database schema design, SQLModel models, query optimization
```
Can you help design the database schema for tasks and users?
```

### Backend Expert
**Use for**: FastAPI endpoints, API design, authentication, business logic
```
I need help building the FastAPI backend with task CRUD operations.
```

### Frontend Expert
**Use for**: Next.js components, TypeScript, API integration, state management
```
Create the Next.js frontend with task list and authentication.
```

### UI Expert
**Use for**: Tailwind CSS styling, responsive design, accessibility, components
```
Design a beautiful, responsive UI for the todo app with Tailwind.
```

### Testing Expert
**Use for**: Pytest tests, Jest tests, test strategy, fixtures, mocks
```
Write comprehensive tests for the backend API and frontend components.
```

## 📚 Technology Skills

Quick reference guides for technologies used in Phase II:

- **fastapi.md**: FastAPI patterns, routes, dependencies, CORS
- **nextjs.md**: Next.js 14 App Router, server/client components, routing
- **sqlmodel.md**: SQLModel models, relationships, CRUD operations
- **neon-postgres.md**: Neon database setup, connection, pooling
- **better-auth.md**: Authentication patterns for Python/FastAPI and Next.js
- **tailwind-css.md**: Tailwind utilities, components, responsive design

## 🎯 How to Use

### 1. Ask Expert Agents for Help

Simply mention what you need and Claude will use the appropriate expert knowledge:

```
I need to implement user authentication with JWT tokens.
```
→ Claude will reference the Backend Expert and Better Auth skill

```
Design a responsive task card component with hover effects.
```
→ Claude will reference the UI Expert and Tailwind CSS skill

### 2. Use SpecKit Plus Commands

For structured development workflow:

- `/sp.specify` - Create feature specification
- `/sp.plan` - Generate implementation plan
- `/sp.tasks` - Generate actionable tasks
- `/sp.implement` - Execute the plan
- `/sp.git.commit_pr` - Commit and create PR

### 3. Reference Skills Directly

Skills provide quick answers to common questions:

```
How do I create a SQLModel with relationships?
```
→ See sqlmodel.md for examples

```
What's the syntax for responsive grid in Tailwind?
```
→ See tailwind-css.md for patterns

## 🚀 Phase II Tech Stack

**Backend**:
- FastAPI (Python web framework)
- SQLModel (ORM with Pydantic)
- Neon PostgreSQL (Serverless database)
- Passlib + JWT (Authentication)
- Pytest (Testing)

**Frontend**:
- Next.js 14 (React framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)
- React Hook Form (Forms)
- Jest + React Testing Library (Testing)

## 💡 Tips

1. **Combine Experts**: "Use the backend expert to create the API and the testing expert to write tests"
2. **Reference Skills**: Claude automatically references relevant skills when needed
3. **Parallel Development**: Ask for multiple components at once
4. **Quality Focus**: Experts follow best practices and design patterns

## 📊 Benefits

- **Faster Development**: Domain experts know best practices
- **Better Code Quality**: Following established patterns
- **Comprehensive**: Covers all aspects (DB, backend, frontend, UI, tests)
- **Reusable**: Skills serve as documentation for future phases
- **Hackathon Edge**: Shows advanced Claude Code usage (bonus points!)

## 🎓 Learning Resources

Each skill includes:
- Quick start examples
- Common patterns
- Best practices
- Key concepts

Use them as reference material throughout development!

---

**Created for**: Hackathon Phase II - Web Application
**Purpose**: Accelerate development with specialized AI assistance
