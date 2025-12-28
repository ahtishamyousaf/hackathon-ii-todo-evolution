# Implementation Plan: AI-Powered Todo Chatbot

**Branch**: `006-ai-chatbot` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-ai-chatbot/spec.md`

## Summary

Transform TaskFlow web application into an AI-powered conversational interface where users manage todo lists through natural language. Implementation uses MCP server architecture (Official MCP SDK for Python) to expose task operations as tools callable by OpenAI Agents SDK. Frontend integrates OpenAI ChatKit for chat UI. Backend maintains stateless architecture with all conversation state persisted in Neon PostgreSQL database.

**Core Technical Approach**:
- **MCP Tools**: 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)
- **Chat API**: POST /api/chat (stateless, fetches history from DB on each request)
- **Database**: New tables (conversations, messages) with foreign keys to existing users table
- **Frontend**: OpenAI ChatKit integrated in Next.js (additive, preserves existing UI)
- **Backend**: OpenAI Agents SDK processes natural language, calls MCP tools
- **Authentication**: Existing Better Auth JWT (user_id from token, not request)

## Technical Context

**Language/Version**:
- Frontend: TypeScript 5+ (Next.js 16)
- Backend: Python 3.13+

**Primary Dependencies**:
- **Frontend (NEW)**:
  - `@openai/chatkit` - Chat interface
- **Backend (NEW)**:
  - `openai` - OpenAI API client (for Agents SDK)
  - `openai-agents-sdk` - Agent framework
  - `mcp-sdk-python` - Official MCP SDK
- **Existing (Preserved)**:
  - Next.js 16, FastAPI 0.110+, SQLModel, Better Auth v1.4.7, PostgreSQL (Neon)

**Storage**:
- Neon PostgreSQL (existing database + 2 new tables)
- New tables: `conversations`, `messages`
- Existing tables: `users`, `tasks`, `categories`, etc. (UNCHANGED)

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest with async support
- Integration: Full conversation flow tests
- Security: JWT validation, user isolation tests

**Target Platform**:
- Frontend: Web browsers (desktop + mobile), deployed to Vercel
- Backend: Linux server, deployed with MCP server integration

**Project Type**: Web (full-stack)

**Performance Goals**:
- Chat response time: <3 seconds (including OpenAI API call)
- Conversation history load: <2 seconds (up to 100 messages)
- MCP tool execution: <500ms per tool call
- Database query performance: Indexed lookups on user_id, conversation_id

**Constraints**:
- **Stateless Architecture**: NO in-memory conversation state (hackathon requirement)
- **No Breaking Changes**: Existing Phase II features must remain functional
- **OpenAI Rate Limits**: Must handle rate limiting gracefully
- **JWT Token Expiration**: Handle expired tokens during long conversations
- **Mobile Responsive**: ChatKit must work on small screens without horizontal scroll

**Scale/Scope**:
- User base: Same as Phase II (100-1000 users for hackathon demo)
- Conversation volume: ~10-50 conversations per user
- Message volume: ~5-20 messages per conversation
- Concurrent chat requests: <100 concurrent (OpenAI API limit)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase III Constitution Compliance

**I. Stateless Architecture** ✓
- [X] NO in-memory conversation state
- [X] All messages stored in PostgreSQL
- [X] Conversation history fetched from DB on each request
- [X] System survives restarts without data loss

**II. MCP Server Architecture** ✓
- [X] Uses Official MCP SDK (Python)
- [X] Exposes 5 required tools
- [X] Tools are stateless (no caching)
- [X] Tools interact with existing database

**III. OpenAI Agents SDK Integration** ✓
- [X] Uses OpenAI Agents SDK (not raw API)
- [X] Registers MCP tools with agent
- [X] Passes conversation history on each request
- [X] Handles multi-turn conversations

**IV. OpenAI ChatKit Frontend** ✓
- [X] Uses OpenAI ChatKit (hackathon requirement)
- [X] Sends messages to /api/chat endpoint
- [X] Displays conversation history
- [X] Shows loading states and tool indicators

**V. Authentication Integration** ✓
- [X] Extracts user_id from JWT token (Depends(get_current_user))
- [X] NEVER accepts user_id from request body/URL
- [X] Validates conversation ownership
- [X] Enforces user isolation in all database queries

**VI. Database Schema Design** ✓
- [X] New tables: conversations, messages
- [X] Foreign keys to users table
- [X] Indexes on user_id, conversation_id
- [X] NO modifications to existing Phase II tables

**VII. Natural Language Understanding** ✓
- [X] AI interprets task creation commands
- [X] AI interprets list/filter commands
- [X] AI interprets update/delete commands
- [X] Handles ambiguity with clarification prompts

**VIII. No Breaking Changes to Phase II** ✓
- [X] Existing task management UI preserved
- [X] Existing REST API endpoints unchanged
- [X] Chat is additive, not replacement
- [X] Better Auth flow unaffected

**IX. Error Handling & User Feedback** ✓
- [X] Confirmations after successful operations
- [X] User-friendly error messages
- [X] Tool execution transparency
- [X] Retry logic for transient failures

**X. Testing & Validation** ✓
- [X] MCP tool tests (parameter validation, user isolation)
- [X] Chat endpoint tests (stateless, JWT auth)
- [X] Integration tests (full conversation flows)
- [X] Security tests (unauthorized access, SQL injection)

### Phase II Constitution Compliance

**Spec-Driven Development** ✓
- [X] Spec created using /sp.specify
- [X] Plan created using /sp.plan (this document)
- [X] Will use /sp.tasks for breakdown
- [X] Will use /sp.implement for execution

**No Manual Coding** ✓
- [X] All code generated through workflow
- [X] Process documented in PHRs
- [X] No freestyle implementation

**GATES: ALL PASS** ✓

## Project Structure

### Documentation (this feature)

```text
specs/006-ai-chatbot/
├── constitution.md      # Phase III principles
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (SDKs, integration patterns)
├── data-model.md        # Phase 1 output (conversations, messages schema)
├── quickstart.md        # Phase 1 output (test scenarios)
├── contracts/           # Phase 1 output (API contracts)
│   ├── chat-api.yaml    # POST /api/chat OpenAPI spec
│   └── mcp-tools.yaml   # MCP tools specification
├── checklists/
│   └── requirements.md  # Spec quality validation
└── tasks.md             # Phase 2 output (/sp.tasks - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase-2-web/
├── frontend/                    # Next.js Application
│   ├── app/
│   │   ├── (auth)/             # Existing auth pages (preserved)
│   │   ├── (app)/
│   │   │   ├── dashboard/      # Existing task UI (preserved)
│   │   │   ├── tasks/          # Existing task pages (preserved)
│   │   │   └── chat/           # NEW: Chat interface
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── auth/           # Existing Better Auth routes (preserved)
│   ├── components/
│   │   ├── ui/                 # Existing UI components (preserved)
│   │   ├── TaskList.tsx        # Existing (preserved)
│   │   └── ChatInterface.tsx   # NEW: ChatKit wrapper
│   ├── lib/
│   │   ├── auth.ts             # Existing Better Auth server (preserved)
│   │   ├── auth-client.ts      # Existing Better Auth client (preserved)
│   │   └── chatApi.ts          # NEW: Chat API client
│   └── types/
│       ├── task.ts             # Existing (preserved)
│       └── chat.ts             # NEW: Chat types
│
└── backend/                     # FastAPI Application
    └── app/
        ├── mcp/                 # NEW: MCP Server
        │   ├── __init__.py
        │   ├── server.py        # MCP server setup
        │   └── tools/           # MCP tool implementations
        │       ├── __init__.py
        │       ├── add_task.py
        │       ├── list_tasks.py
        │       ├── complete_task.py
        │       ├── delete_task.py
        │       └── update_task.py
        │
        ├── agents/              # NEW: OpenAI Agents
        │   ├── __init__.py
        │   └── task_agent.py    # Agent configuration
        │
        ├── routers/
        │   ├── auth.py          # Existing (preserved)
        │   ├── tasks.py         # Existing (preserved)
        │   ├── categories.py    # Existing (preserved)
        │   └── chat.py          # NEW: POST /api/chat
        │
        ├── models/
        │   ├── user.py          # Existing (preserved)
        │   ├── task.py          # Existing (preserved)
        │   ├── conversation.py  # NEW: Conversation model
        │   └── message.py       # NEW: Message model
        │
        ├── schemas/
        │   ├── task.py          # Existing (preserved)
        │   └── chat.py          # NEW: Chat request/response
        │
        ├── dependencies/
        │   └── auth.py          # Existing get_current_user (preserved)
        │
        ├── migrations/
        │   ├── 001-007_*.sql    # Existing Phase II migrations (preserved)
        │   ├── 008_create_conversations.sql   # NEW
        │   └── 009_create_messages.sql        # NEW
        │
        ├── database.py          # Existing (preserved)
        └── main.py              # Existing (add chat router)
```

**Structure Decision**:
Web application structure with clear separation:
- **Frontend**: Next.js with new `/chat` page + ChatKit component
- **Backend**: FastAPI with new `/mcp` and `/agents` directories
- **Database**: New migration files (008, 009) for conversation tables
- **Preserved**: All existing Phase II code unchanged

## Complexity Tracking

> **No constitution violations.** All gates pass. No complexity justification needed.

---

## Phase 0: Research & Unknown Resolution

### Research Questions

1. **OpenAI Agents SDK + MCP SDK Integration**
   - How to register MCP tools with OpenAI Agents SDK?
   - What's the correct import path for `openai-agents-sdk`?
   - How to handle tool results and pass them back to agent?
   - Example code for agent initialization with MCP tools?

2. **OpenAI ChatKit Configuration**
   - How to integrate ChatKit with Next.js App Router?
   - What's the domain allowlist configuration format?
   - How to send custom backend endpoint to ChatKit?
   - How to style ChatKit for dark mode?

3. **Stateless Conversation Management**
   - Best practices for loading conversation history efficiently?
   - How to handle very long conversations (>100 messages)?
   - Pagination strategy for message history?
   - Database query optimization for conversation fetching?

4. **MCP Tool Implementation Patterns**
   - Standard response format for MCP tools?
   - Error handling within MCP tools?
   - How to access database session in MCP tool?
   - How to inject user_id into MCP tool context?

5. **Natural Language Understanding Optimization**
   - System prompts for task management agent?
   - Few-shot examples for task commands?
   - How to handle ambiguous commands?
   - Confirmation patterns for destructive actions?

**Output**: `research.md` will document:
- SDK installation and setup
- Integration patterns with code examples
- Best practices for stateless architecture
- Configuration details for ChatKit and MCP

---

## Phase 1: Design & Contracts

### 1.1 Data Model (`data-model.md`)

**New Entities**:

1. **Conversation**
   - **Fields**: id (PK), user_id (FK), created_at, updated_at
   - **Relationships**: Belongs to User, Has many Messages
   - **Indexes**: user_id (for user isolation queries)
   - **Constraints**: CASCADE delete when user deleted

2. **Message**
   - **Fields**: id (PK), user_id (FK), conversation_id (FK), role (enum), content (text), created_at
   - **Relationships**: Belongs to Conversation and User
   - **Indexes**: conversation_id (for history fetching), user_id (for user isolation)
   - **Constraints**: CASCADE delete when conversation deleted, CHECK role IN ('user', 'assistant')

**Existing Entities (UNCHANGED)**:
- User (from Better Auth)
- Task
- Category
- Subtask
- Comment
- Attachment

**Relationships**:
```
User (existing)
  ├── has many Tasks (existing)
  ├── has many Categories (existing)
  └── has many Conversations (NEW)
         └── has many Messages (NEW)
```

### 1.2 API Contracts (`contracts/`)

**File: `contracts/chat-api.yaml`**
```yaml
openapi: 3.0.0
info:
  title: Chat API
  version: 1.0.0
  description: Stateless chat endpoint for AI-powered task management

paths:
  /api/chat:
    post:
      summary: Send chat message and get AI response
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                conversation_id:
                  type: integer
                  nullable: true
                  description: Optional conversation ID (omit to create new)
                message:
                  type: string
                  minLength: 1
                  maxLength: 5000
                  description: User message text
              required:
                - message
      responses:
        '200':
          description: Successful chat response
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversation_id:
                    type: integer
                  response:
                    type: string
                  tool_calls:
                    type: array
                    items:
                      type: object
                      properties:
                        tool:
                          type: string
                        parameters:
                          type: object
                        result:
                          type: object
        '401':
          description: Unauthorized (invalid/missing JWT)
        '403':
          description: Forbidden (conversation belongs to another user)
        '404':
          description: Conversation not found
        '500':
          description: Internal server error
```

**File: `contracts/mcp-tools.yaml`**
```yaml
mcp_tools:
  - name: add_task
    description: Create a new task for the user
    parameters:
      user_id:
        type: string
        required: true
        description: User ID from JWT token
      title:
        type: string
        required: true
        description: Task title
      description:
        type: string
        required: false
        description: Optional task description
    returns:
      task_id: integer
      status: string
      title: string

  - name: list_tasks
    description: List tasks for the user with optional filtering
    parameters:
      user_id:
        type: string
        required: true
      status:
        type: string
        enum: [all, pending, completed]
        default: all
    returns:
      type: array
      items:
        type: object
        properties:
          id: integer
          title: string
          completed: boolean
          description: string

  - name: complete_task
    description: Mark a task as complete
    parameters:
      user_id:
        type: string
        required: true
      task_id:
        type: integer
        required: true
    returns:
      task_id: integer
      status: string
      title: string

  - name: delete_task
    description: Delete a task
    parameters:
      user_id:
        type: string
        required: true
      task_id:
        type: integer
        required: true
    returns:
      task_id: integer
      status: string
      title: string

  - name: update_task
    description: Update task title or description
    parameters:
      user_id:
        type: string
        required: true
      task_id:
        type: integer
        required: true
      title:
        type: string
        required: false
      description:
        type: string
        required: false
    returns:
      task_id: integer
      status: string
      title: string
```

### 1.3 Integration Testing (`quickstart.md`)

Test scenarios for validating the implementation:

1. **Basic Chat Flow**
   - Create conversation
   - Send message "Add a task to buy groceries"
   - Verify task created in database
   - Verify AI confirmation message

2. **Conversation Persistence**
   - Start conversation (conversation_id = X)
   - Send multiple messages
   - Close and reopen (send new message with conversation_id = X)
   - Verify history loaded correctly

3. **User Isolation**
   - User A creates conversation
   - User B attempts to access User A's conversation
   - Verify 403 Forbidden response

4. **Stateless Validation**
   - Send chat message
   - Restart backend server
   - Send follow-up message with conversation_id
   - Verify history loaded from database

5. **Natural Language Commands**
   - "Add task to call mom" → verify add_task called
   - "Show me my tasks" → verify list_tasks called
   - "Complete task 3" → verify complete_task called
   - "Delete task 2" → verify delete_task called

### 1.4 Agent Context Update

**Action**: Run `.specify/scripts/bash/update-agent-context.sh claude`

**Updates to CLAUDE.md**:
- Add OpenAI Agents SDK patterns
- Add MCP tool implementation patterns
- Add ChatKit integration notes
- Add stateless architecture reminders
- Preserve existing Better Auth, FastAPI, Next.js patterns

---

## Post-Design Constitution Re-Check

**All gates still pass** ✓

- Stateless architecture maintained
- MCP SDK integration planned
- OpenAI Agents SDK integration planned
- ChatKit frontend integration planned
- JWT authentication preserved
- No breaking changes to Phase II
- Database design complete
- API contracts defined

**Ready for Phase 2**: `/sp.tasks` command to generate task breakdown

---

**Next Steps**:
1. Generate `research.md` (Phase 0 completion)
2. Generate `data-model.md` (Phase 1 completion)
3. Create `contracts/` directory with API specs (Phase 1 completion)
4. Generate `quickstart.md` (Phase 1 completion)
5. Update agent context (Phase 1 completion)
6. Run `/sp.tasks` to generate implementation tasks
7. Run `/sp.implement` to execute tasks
