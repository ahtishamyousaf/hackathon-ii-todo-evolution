# AI-Powered Todo Chatbot - Phase III Constitution

**Feature**: AI-Powered Todo Chatbot
**Phase**: III - Conversational Interface
**Version**: 1.0.0
**Created**: 2025-12-26
**Hackathon**: The Evolution of Todo - Hackathon II

---

## Core Principles

### I. Stateless Architecture (NON-NEGOTIABLE)

The chatbot server MUST be completely stateless with ALL state persisted in the database.

**Requirements**:
- NO in-memory conversation state
- NO session caching
- NO server-side conversation history
- ALL messages stored in PostgreSQL
- System survives restarts without data loss
- Conversation history fetched from database on every request

**Rationale**: Stateless design is a hackathon requirement (explicitly stated in PDF). It enables horizontal scaling, simplifies deployment, and demonstrates proper cloud-native architecture.

**Workflow Pattern**:
```
User Message → Backend Receives Request
    ↓
Fetch Conversation History from DB
    ↓
Build Message Array (history + new message)
    ↓
Store User Message in DB
    ↓
Call OpenAI Agents SDK with MCP Tools
    ↓
Store Assistant Response in DB
    ↓
Return Response to Client
    ↓
Server Forgets Everything (stateless)
```

### II. MCP Server Architecture (MANDATORY)

The chatbot MUST use the Official MCP SDK (Python) to expose tools to the OpenAI Agents SDK.

**MCP Tools Required**:
1. **add_task**: Create new task
   - Parameters: user_id (string), title (string), description (optional string)
   - Returns: task_id, status, title

2. **list_tasks**: Query tasks
   - Parameters: user_id (string), status (optional: "all"/"pending"/"completed")
   - Returns: Array of task objects

3. **complete_task**: Mark task complete
   - Parameters: user_id (string), task_id (integer)
   - Returns: task_id, status, title

4. **delete_task**: Remove task
   - Parameters: user_id (string), task_id (integer)
   - Returns: task_id, status, title

5. **update_task**: Modify task
   - Parameters: user_id (string), task_id (integer), title (optional), description (optional)
   - Returns: task_id, status, title

**Tool Design Rules**:
- ✅ Each tool MUST validate user_id parameter
- ✅ Each tool MUST interact with existing Neon PostgreSQL database
- ✅ Each tool MUST return consistent response format
- ✅ Each tool MUST handle errors gracefully
- ❌ Tools MUST NOT maintain state between calls
- ❌ Tools MUST NOT cache results

**Rationale**: MCP (Model Context Protocol) is the hackathon-required abstraction for exposing backend operations to AI agents. The Official MCP SDK ensures compatibility with OpenAI Agents SDK.

### III. OpenAI Agents SDK Integration (MANDATORY)

The backend MUST use the OpenAI Agents SDK to process natural language and call MCP tools.

**Integration Pattern**:
```python
# Chat endpoint receives user message
@app.post("/api/chat")
async def chat(request: ChatRequest, user_id: str = Depends(get_current_user)):
    # 1. Fetch conversation history from DB
    messages = get_conversation_messages(request.conversation_id)

    # 2. Append new user message
    messages.append({"role": "user", "content": request.message})

    # 3. Store user message in DB
    save_message(conversation_id, "user", request.message, user_id)

    # 4. Call OpenAI Agents SDK with MCP tools
    agent = create_agent_with_mcp_tools(user_id)
    response = await agent.run(messages)

    # 5. Store assistant response in DB
    save_message(conversation_id, "assistant", response.content, user_id)

    # 6. Return response
    return {"conversation_id": conversation_id, "response": response.content}
```

**Requirements**:
- Use OpenAI Agents SDK (NOT raw OpenAI API)
- Register MCP tools with the agent
- Pass conversation history on each request
- Extract tool calls from agent response
- Handle multi-turn conversations

**Rationale**: OpenAI Agents SDK provides the agent framework required by the hackathon. It handles tool selection, parameter extraction, and natural language understanding.

### IV. OpenAI ChatKit Frontend (MANDATORY)

The frontend MUST use OpenAI ChatKit for the chat interface.

**Integration Requirements**:
- Replace existing task management UI with ChatKit
- Configure domain allowlist for hosted deployment
- Set `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` environment variable
- Send chat messages to `/api/chat` backend endpoint
- Display conversation history from database
- Show loading states during AI processing
- Display tool calls/actions to user (transparency)

**UI/UX Requirements**:
- Mobile-friendly chat interface
- Dark mode support (preserve existing theme)
- Message timestamps
- User vs Assistant message differentiation
- Tool execution indicators (e.g., "Adding task...")
- Error messages for failed operations
- Conversation resume capability

**Rationale**: OpenAI ChatKit is the hackathon-required frontend framework. It provides a production-ready chat UI optimized for AI interactions.

### V. Authentication Integration (SECURITY-CRITICAL)

ALL chat operations MUST use existing Better Auth JWT authentication.

**Security Rules**:
- ✅ ALWAYS extract user_id from JWT token (Depends(get_current_user))
- ✅ ALWAYS pass authenticated user_id to MCP tools
- ✅ ALWAYS filter conversations by authenticated user
- ✅ ALWAYS validate conversation ownership before access
- ❌ NEVER accept user_id from request body or URL parameters
- ❌ NEVER trust client-provided user identifiers
- ❌ NEVER expose other users' conversations or messages

**Conversation Isolation Pattern**:
```python
# ✅ CORRECT - User ID from JWT
@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    current_user: str = Depends(get_current_user)  # From JWT token
):
    # Verify conversation belongs to current user
    conversation = get_conversation(request.conversation_id)
    if conversation.user_id != current_user:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Pass authenticated user_id to MCP tools
    agent = create_agent_with_mcp_tools(current_user)
```

**Rationale**: JWT authentication ensures secure user isolation. MCP tools must operate on behalf of the authenticated user, not any user specified in the message content.

### VI. Database Schema Design

Phase III adds two new tables while preserving all Phase II tables.

**New Tables**:

1. **conversations**:
   ```sql
   CREATE TABLE conversations (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_conversations_user ON conversations(user_id);
   ```

2. **messages**:
   ```sql
   CREATE TABLE messages (
       id SERIAL PRIMARY KEY,
       user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
       conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
       role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
       content TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   CREATE INDEX idx_messages_conversation ON messages(conversation_id);
   CREATE INDEX idx_messages_user ON messages(user_id);
   ```

**Design Rules**:
- ✅ Use foreign key constraints for referential integrity
- ✅ Add indexes on frequently queried columns (user_id, conversation_id)
- ✅ Use CHECK constraint for role enum
- ✅ Cascade deletes (delete user → delete conversations → delete messages)
- ✅ Immutable messages (no UPDATE operations, append-only)
- ❌ DO NOT modify existing Phase II tables (tasks, categories, etc.)

**Rationale**: Proper schema design ensures data integrity and query performance. Append-only message table preserves conversation history integrity.

### VII. Natural Language Understanding

The AI agent MUST correctly interpret common task management commands.

**Required Command Patterns**:

| User Input | Expected Behavior | MCP Tool Called |
|------------|-------------------|-----------------|
| "Add a task to buy groceries" | Creates task with title "Buy groceries" | add_task |
| "Show me all my tasks" | Lists all tasks | list_tasks(status="all") |
| "What's pending?" | Lists incomplete tasks | list_tasks(status="pending") |
| "Mark task 3 as complete" | Completes task ID 3 | complete_task(task_id=3) |
| "Delete the meeting task" | Lists tasks, confirms, deletes | list_tasks → delete_task |
| "Change task 1 to 'Call mom tonight'" | Updates task 1 title | update_task(task_id=1, title=...) |

**Handling Ambiguity**:
- If multiple tasks match (e.g., "delete grocery task"), list matches and ask for clarification
- If command is unclear, ask follow-up questions
- For destructive actions (delete), provide confirmation prompt
- For failed operations, explain error in user-friendly language

**Rationale**: Natural language understanding is the core value proposition. Users should manage tasks conversationally without learning command syntax.

### VIII. No Breaking Changes to Phase II

The chatbot MUST be additive - existing Phase II functionality MUST remain intact.

**Compatibility Requirements**:
- ✅ Existing task management UI still works
- ✅ Existing REST API endpoints unchanged
- ✅ Existing Better Auth flow unaffected
- ✅ Existing database schema preserved (only new tables added)
- ✅ Existing dark mode, categories, filters still functional
- ✅ Chat interface is ALTERNATIVE, not REPLACEMENT

**User Choice Pattern**:
```
User can choose:
- Traditional UI: Dashboard with task list, filters, forms
- Chat UI: Conversational interface with natural language
- Both: Switch between interfaces as needed
```

**Rationale**: Phase III builds ON TOP OF Phase II. Users should have choice of interfaces. Breaking existing functionality invalidates Phase II work.

### IX. Error Handling & User Feedback

The chatbot MUST provide clear, helpful feedback for all operations.

**User Feedback Requirements**:
- ✅ Confirmations after successful operations
  - "I've added 'Buy groceries' to your tasks"
  - "Task 3 marked as complete"
  - "I've deleted the meeting task"

- ✅ Clear error messages for failures
  - "I couldn't find task 3. Your tasks are numbered 1, 2, 4."
  - "Failed to connect to the server. Please try again."
  - "You don't have permission to access that conversation."

- ✅ Tool execution transparency
  - Show when AI is calling tools (loading indicator)
  - Explain what actions were taken
  - Provide task details after creation (ID, status)

**Error Handling Rules**:
- Catch all exceptions in MCP tools
- Return user-friendly error messages (not stack traces)
- Log errors server-side for debugging
- Implement retry logic for transient failures (network, rate limits)
- Gracefully degrade if OpenAI API is unavailable

**Rationale**: Conversational interfaces require clear feedback. Users can't see backend operations, so transparency is critical for trust.

### X. Testing & Validation

Phase III implementation MUST be thoroughly tested before submission.

**Testing Requirements**:

1. **MCP Tool Tests**:
   - Each tool validates parameters correctly
   - Each tool returns expected format
   - Each tool enforces user isolation
   - Each tool handles errors gracefully

2. **Chat Endpoint Tests**:
   - Creates conversation if conversation_id omitted
   - Fetches history from database
   - Stores user and assistant messages
   - Enforces JWT authentication
   - Handles invalid conversation_id

3. **Integration Tests**:
   - Full conversation flow (multiple turns)
   - Task creation via natural language
   - Task listing with filters
   - Task completion and deletion
   - Conversation persistence across sessions

4. **Security Tests**:
   - Unauthorized access rejected (no JWT)
   - Cross-user conversation access blocked
   - SQL injection prevented
   - Tool parameter validation

**Acceptance Criteria Validation**:
- All acceptance criteria from spec.md MUST pass
- Manual testing of natural language commands
- Demo video captures all required functionality

**Rationale**: Proper testing validates that the chatbot works as specified. Judges will test the live deployment.

---

## Technical Standards

### Technology Stack (MANDATORY)

**Frontend**:
- OpenAI ChatKit (hackathon requirement)
- Next.js 16 (existing from Phase II)
- Better Auth client (existing from Phase II)
- Environment variable: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY`

**Backend**:
- OpenAI Agents SDK (hackathon requirement)
- Official MCP SDK for Python (hackathon requirement)
- FastAPI (existing from Phase II)
- SQLModel (existing from Phase II)
- Neon PostgreSQL (existing from Phase II)

**New Dependencies**:
```bash
# Frontend
npm install @openai/chatkit

# Backend
pip install openai-agents-sdk
pip install mcp-sdk-python
pip install openai  # For API access
```

### Environment Variables

**Frontend (.env.local)**:
```bash
# Existing (preserved)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000

# New for Phase III
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-chatkit-domain-key
```

**Backend (.env)**:
```bash
# Existing (preserved)
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-here
ALLOWED_ORIGINS=http://localhost:3000

# New for Phase III
OPENAI_API_KEY=your-openai-api-key
```

### Project Structure

```
phase-2-web/
├── frontend/
│   ├── app/
│   │   └── (app)/
│   │       └── chat/           # NEW: Chat interface page
│   │           └── page.tsx
│   ├── components/
│   │   └── ChatInterface.tsx   # NEW: ChatKit wrapper
│   └── lib/
│       └── chatApi.ts          # NEW: Chat API client
└── backend/
    └── app/
        ├── mcp/                # NEW: MCP server
        │   ├── server.py       # MCP server setup
        │   └── tools/          # MCP tool implementations
        │       ├── add_task.py
        │       ├── list_tasks.py
        │       ├── complete_task.py
        │       ├── delete_task.py
        │       └── update_task.py
        ├── agents/             # NEW: OpenAI Agents
        │   └── task_agent.py   # Agent configuration
        ├── routers/
        │   └── chat.py         # NEW: POST /api/chat
        └── models/
            ├── conversation.py # NEW: Conversation model
            └── message.py      # NEW: Message model
```

---

## Quality Criteria

### Specification Quality
- [X] Phase III constitution defines chatbot principles
- [X] spec.md includes 5 prioritized user stories
- [X] spec.md includes acceptance criteria for all stories
- [X] spec.md defines MCP tools and chat API
- [ ] plan.md includes MCP server architecture
- [ ] plan.md includes OpenAI Agents SDK integration
- [ ] tasks.md breaks down by user story

### Code Quality
- [ ] MCP server uses Official MCP SDK
- [ ] OpenAI Agents SDK integrated correctly
- [ ] All MCP tools validate parameters
- [ ] Chat endpoint is stateless (fetches history from DB)
- [ ] Conversation and Message tables created
- [ ] All database operations use SQLModel
- [ ] JWT authentication enforced on chat endpoint
- [ ] User isolation in all database queries

### Functional Quality
- [ ] ChatKit displays conversation history
- [ ] Users can add tasks via natural language
- [ ] Users can list tasks with filters
- [ ] Users can complete/delete/update tasks
- [ ] Conversation persists across sessions
- [ ] Server restart doesn't lose data (stateless validated)
- [ ] Existing Phase II features still work

### Security Quality
- [ ] JWT token required for all chat operations
- [ ] user_id extracted from token (not request)
- [ ] Conversation ownership validated
- [ ] MCP tools enforce user isolation
- [ ] SQL injection prevented
- [ ] No data leakage between users

### Deployment Quality
- [ ] Frontend deployed to Vercel with ChatKit
- [ ] Backend deployed with MCP server
- [ ] OpenAI domain allowlist configured
- [ ] Environment variables set correctly
- [ ] Chat endpoint accessible and functional
- [ ] Demo video shows all features (<90 seconds)

---

## Hackathon Submission

### Deliverables

- [ ] **Public GitHub Repository**:
  - All Phase III source code
  - specs/006-ai-chatbot/ with spec, plan, tasks
  - history/prompts/006-ai-chatbot/ with PHRs
  - This constitution file
  - Updated AGENTS.md (if needed)
  - Updated README.md

- [ ] **Deployed Application**:
  - Frontend on Vercel with ChatKit
  - Backend API with MCP server
  - Working chat interface accessible to judges

- [ ] **Demo Video (MAX 90 seconds)**:
  - Show chatbot creating tasks via natural language
  - Show chatbot listing/filtering tasks
  - Show chatbot completing/deleting tasks
  - Show conversation persistence
  - Show spec-driven workflow (prompts → specs → code)

### Evaluation Criteria (Phase III Specific)

**Process Quality (40%)**:
- Quality of Phase III specification
- MCP server design decisions documented
- Iteration history for chatbot development
- PHR completeness

**Code Quality (30%)**:
- Stateless architecture validated
- MCP SDK usage correct
- OpenAI Agents SDK integration proper
- Security (JWT auth) maintained

**Feature Completeness (20%)**:
- All 5 user stories implemented
- Natural language understanding works
- Conversation persistence functional
- No breaking changes to Phase II

**Documentation (10%)**:
- Phase III spec clarity
- MCP tools documented
- README updated with chat setup
- Constitution completeness

### Bonus Points Opportunities

From hackathon PDF:
- **Multi-language Support (+100 points)**: Add Urdu language support to chatbot
- **Voice Commands (+200 points)**: Add voice input for todo commands

---

## Governance

### Constitutional Authority

This Phase III constitution extends (not replaces) the Phase II constitution. When conflicts arise:
1. Phase III constitution takes precedence for chatbot-specific features
2. Phase II constitution applies to existing web app features
3. AGENTS.md applies to all phases for workflow consistency

### Spec-Driven Workflow (MANDATORY)

```
/sp.specify → /sp.plan → /sp.tasks → /sp.implement → /sp.git.commit_pr → /sp.phr
```

**No deviations allowed.** Manual coding invalidates Phase III work.

### Quality Gates

- **Before Implementation**: Spec, plan, and tasks complete
- **After Implementation**: All acceptance criteria pass
- **Before Commit**: Tests pass, no breaking changes
- **Before Submission**: Demo video ready, deployment live

### Amendment Process

- Version: Semantic versioning (MAJOR.MINOR.PATCH)
- Rationale required for all changes
- Updated date required
- Consistency check with Phase II constitution

---

**Version**: 1.0.0
**Ratified**: 2025-12-26
**Last Amended**: 2025-12-26
**Phase**: III - AI-Powered Todo Chatbot
**Hackathon**: The Evolution of Todo - Hackathon II
**Worth**: 200 points (base)
**Deadline**: December 21, 2025
