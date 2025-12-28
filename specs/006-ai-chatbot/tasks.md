# Tasks: AI-Powered Todo Chatbot

**Input**: Design documents from `/specs/006-ai-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: NOT included (not requested in spec - direct implementation only)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app structure**: `phase-2-web/backend/` and `phase-2-web/frontend/`
- Backend: Python with FastAPI
- Frontend: TypeScript with Next.js 16

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [ ] T001 Install backend dependencies: openai, modelcontextprotocol in phase-2-web/backend/pyproject.toml
- [ ] T002 [P] Install frontend dependency: @assistant-ui/react in phase-2-web/frontend/package.json
- [ ] T003 [P] Create MCP directory structure in phase-2-web/backend/app/mcp/
- [ ] T004 [P] Create agents directory structure in phase-2-web/backend/app/agents/
- [ ] T005 [P] Create chat types file in phase-2-web/frontend/types/chat.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create migration 008_create_conversations.sql in phase-2-web/backend/migrations/
- [ ] T007 Create migration 009_create_messages.sql in phase-2-web/backend/migrations/
- [ ] T008 Apply migrations using python phase-2-web/backend/run_migration.py 008
- [ ] T009 Apply migration 009 using python phase-2-web/backend/run_migration.py 009
- [ ] T010 [P] Create Conversation SQLModel in phase-2-web/backend/app/models/conversation.py
- [ ] T011 [P] Create Message SQLModel in phase-2-web/backend/app/models/message.py
- [ ] T012 [P] Create chat schemas (ChatRequest, ChatResponse) in phase-2-web/backend/app/schemas/chat.py
- [ ] T013 [P] Create MCP server base setup in phase-2-web/backend/app/mcp/server.py
- [ ] T014 [P] Create OpenAI client configuration in phase-2-web/backend/app/agents/task_agent.py
- [ ] T015 Update models __init__.py to export Conversation and Message in phase-2-web/backend/app/models/__init__.py
- [ ] T016 Verify get_current_user dependency works for chat in phase-2-web/backend/app/dependencies/auth.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add Tasks via Natural Language (Priority: P1) 🎯 MVP

**Goal**: Users can create new todo tasks by describing them in natural conversation

**Independent Test**: Send message "Add a task to buy groceries" via chat, verify task appears in database with correct user_id and title

### Implementation for User Story 1

- [X] T017 [P] [US1] Implement add_task MCP tool in phase-2-web/backend/app/mcp/tools/add_task.py
- [X] T018 [P] [US1] Create tools __init__.py to export add_task in phase-2-web/backend/app/mcp/tools/__init__.py
- [X] T019 [US1] Configure task agent with system prompt for task creation in phase-2-web/backend/app/agents/task_agent.py
- [X] T020 [US1] Register add_task tool with MCP server in phase-2-web/backend/app/mcp/server.py
- [X] T021 [US1] Implement POST /api/chat endpoint (basic conversation creation + message storage) in phase-2-web/backend/app/routers/chat.py
- [X] T022 [US1] Add chat router to main FastAPI app in phase-2-web/backend/app/main.py
- [X] T023 [P] [US1] Create chat page component in phase-2-web/frontend/app/(app)/chat/page.tsx
- [X] T024 [P] [US1] Create ChatInterface component with @assistant-ui/react in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T025 [US1] Create chat API client for POST /api/chat in phase-2-web/frontend/lib/chatApi.ts
- [X] T026 [US1] Integrate chat API client with ChatInterface component in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T027 [US1] Add navigation link to chat page in sidebar/navigation in phase-2-web/frontend/components/Sidebar.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can add tasks via natural language

---

## Phase 4: User Story 2 - View Tasks Through Conversation (Priority: P2)

**Goal**: Users can ask about their tasks in natural language and receive conversational responses

**Independent Test**: Pre-populate 3 tasks in database, ask "What's on my todo list?", verify all 3 tasks are listed in chat response

### Implementation for User Story 2

- [X] T028 [P] [US2] Implement list_tasks MCP tool with status filtering in phase-2-web/backend/app/mcp/tools/list_tasks.py
- [X] T029 [US2] Update tools __init__.py to export list_tasks in phase-2-web/backend/app/mcp/tools/__init__.py
- [X] T030 [US2] Update agent system prompt to include list/view command interpretation in phase-2-web/backend/app/agents/task_agent.py
- [X] T031 [US2] Register list_tasks tool with MCP server in phase-2-web/backend/app/mcp/server.py
- [X] T032 [US2] Update ChatInterface to display task lists in formatted manner in phase-2-web/frontend/components/ChatInterface.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can add and view tasks

---

## Phase 5: User Story 3 - Manage Tasks via Chat (Priority: P3)

**Goal**: Users can complete, delete, or update existing tasks through natural language commands

**Independent Test**: Pre-create task with id=5, send "Mark task 5 as done", verify task.completed=true in database

### Implementation for User Story 3

- [X] T033 [P] [US3] Implement complete_task MCP tool in phase-2-web/backend/app/mcp/tools/complete_task.py
- [X] T034 [P] [US3] Implement delete_task MCP tool in phase-2-web/backend/app/mcp/tools/delete_task.py
- [X] T035 [P] [US3] Implement update_task MCP tool in phase-2-web/backend/app/mcp/tools/update_task.py
- [X] T036 [US3] Update tools __init__.py to export all 3 new tools in phase-2-web/backend/app/mcp/tools/__init__.py
- [X] T037 [US3] Update agent system prompt to include management commands (complete, delete, update) in phase-2-web/backend/app/agents/task_agent.py
- [X] T038 [US3] Register complete_task, delete_task, update_task tools with MCP server in phase-2-web/backend/app/mcp/server.py
- [X] T039 [US3] Add confirmation dialogs for destructive actions (delete) in phase-2-web/frontend/components/ChatInterface.tsx

**Checkpoint**: All core task management operations work via chat - add, view, complete, delete, update

---

## Phase 6: User Story 4 - Conversation Persistence (Priority: P4)

**Goal**: Users can resume previous conversations across sessions with full message history preserved

**Independent Test**: Start conversation, send 3 messages, refresh browser, verify all 3 messages display in chat

### Implementation for User Story 4

- [X] T040 [US4] Implement conversation history fetching in POST /api/chat in phase-2-web/backend/app/routers/chat.py
- [X] T041 [US4] Update chat endpoint to pass full history to agent on each request in phase-2-web/backend/app/routers/chat.py
- [X] T042 [US4] Implement pagination logic for conversations with >20 messages in phase-2-web/backend/app/routers/chat.py
- [X] T043 [US4] Update ChatInterface to load and display conversation history on mount in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T044 [US4] Add conversation list/selector UI in phase-2-web/frontend/app/(app)/chat/page.tsx
- [X] T045 [US4] Implement GET /api/conversations endpoint for listing user conversations in phase-2-web/backend/app/routers/chat.py

**Checkpoint**: Conversation persistence works - users can resume chats across sessions without data loss

---

## Phase 7: User Story 5 - Seamless Authentication Integration (Priority: P5)

**Goal**: Chat interface integrates with existing Better Auth JWT, maintaining secure user isolation

**Independent Test**: Attempt chat with invalid token (expect 401), with valid token (expect success), access other user's conversation (expect 403)

### Implementation for User Story 5

- [X] T046 [US5] Add JWT authentication dependency to POST /api/chat endpoint in phase-2-web/backend/app/routers/chat.py
- [X] T047 [US5] Implement user_id extraction and injection for all MCP tool calls in phase-2-web/backend/app/mcp/server.py
- [X] T048 [US5] Add conversation ownership validation in chat endpoint in phase-2-web/backend/app/routers/chat.py
- [X] T049 [US5] Add user_id filtering to conversation listing endpoint in phase-2-web/backend/app/routers/chat.py
- [X] T050 [US5] Verify all MCP tools filter by user_id correctly in phase-2-web/backend/app/mcp/tools/*.py
- [X] T051 [US5] Add JWT token to chat API requests in frontend in phase-2-web/frontend/lib/chatApi.ts
- [X] T052 [US5] Handle 401 errors with re-authentication redirect in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T053 [US5] Handle 403 errors with appropriate error message in phase-2-web/frontend/components/ChatInterface.tsx

**Checkpoint**: Security is fully enforced - user isolation works, JWT validation works, unauthorized access blocked

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T054 [P] Add error handling for OpenAI API failures with retry logic in phase-2-web/backend/app/agents/task_agent.py
- [X] T055 [P] Add loading states during AI processing in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T056 [P] Add dark mode support to ChatInterface component in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T057 [P] Add mobile responsiveness checks to chat page in phase-2-web/frontend/app/(app)/chat/page.tsx
- [X] T058 [P] Add tool call indicators (e.g., "Adding task...") in phase-2-web/frontend/components/ChatInterface.tsx
- [X] T059 [P] Add helpful confirmations after tool executions in phase-2-web/backend/app/agents/task_agent.py
- [X] T060 [P] Add environment variable validation (OPENAI_API_KEY) in phase-2-web/backend/app/main.py
- [X] T061 [P] Update CLAUDE.md with Phase III patterns in CLAUDE.md
- [X] T062 [P] Create API documentation for chat endpoint in specs/006-ai-chatbot/contracts/
- [X] T063 Run quickstart.md test scenarios to validate all 8 scenarios pass (validation report created in TESTING_STATUS.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, but builds on US1 MCP infrastructure
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent, but reuses agent from US1/US2
- **User Story 4 (P4)**: Depends on US1 completion (needs basic chat endpoint) - Enhances conversation experience
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Independent security layer

### Within Each User Story

- MCP tools before agent configuration
- Agent configuration before endpoint implementation
- Backend endpoint before frontend integration
- Core implementation before UI polish

### Parallel Opportunities

**Phase 1 (Setup):**
- T002 (frontend deps) and T001 (backend deps) can run in parallel
- T003, T004, T005 (directory creation) can all run in parallel

**Phase 2 (Foundational):**
- T006 and T007 (migration file creation) can run in parallel
- T010 and T011 (model creation) can run in parallel after migrations applied
- T012, T013, T014 (schemas, MCP setup, agent setup) can run in parallel

**Phase 3 (US1):**
- T017 and T018 (MCP tool + export) can run in parallel
- T023 and T024 (chat page + ChatInterface) can run in parallel after backend complete

**Phase 4 (US2):**
- T028 (list_tasks tool) can run in parallel with T032 (frontend formatting)

**Phase 5 (US3):**
- T033, T034, T035 (all 3 MCP tools) can run in parallel

**Phase 8 (Polish):**
- Most polish tasks (T054-T062) can run in parallel as they touch different files

---

## Parallel Example: User Story 1

```bash
# Launch MCP tool creation and export together:
Task T017: "Implement add_task MCP tool in phase-2-web/backend/app/mcp/tools/add_task.py"
Task T018: "Create tools __init__.py to export add_task in phase-2-web/backend/app/mcp/tools/__init__.py"

# After backend complete, launch frontend components together:
Task T023: "Create chat page component in phase-2-web/frontend/app/(app)/chat/page.tsx"
Task T024: "Create ChatInterface component with @assistant-ui/react in phase-2-web/frontend/components/ChatInterface.tsx"
```

---

## Parallel Example: User Story 3

```bash
# Launch all 3 MCP tools together (different files):
Task T033: "Implement complete_task MCP tool in phase-2-web/backend/app/mcp/tools/complete_task.py"
Task T034: "Implement delete_task MCP tool in phase-2-web/backend/app/mcp/tools/delete_task.py"
Task T035: "Implement update_task MCP tool in phase-2-web/backend/app/mcp/tools/update_task.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (5 tasks)
2. Complete Phase 2: Foundational (11 tasks - CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (11 tasks)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md Scenario 1
5. Deploy/demo if ready - users can add tasks via natural language!

**Total MVP tasks**: 27 tasks

### Incremental Delivery

1. **Foundation** (Phase 1 + 2): Setup + database migrations → 16 tasks
2. **MVP** (Phase 3): Add US1 → Test independently → Deploy (27 total tasks)
3. **Enhanced** (Phase 4): Add US2 → Test independently → Deploy (32 total tasks)
4. **Full CRUD** (Phase 5): Add US3 → Test independently → Deploy (39 total tasks)
5. **Persistent** (Phase 6): Add US4 → Test independently → Deploy (45 total tasks)
6. **Secure** (Phase 7): Add US5 → Test independently → Deploy (53 total tasks)
7. **Polished** (Phase 8): Add polish → Final validation → Deploy (63 total tasks)

### Parallel Team Strategy

With multiple developers:

1. **All team**: Complete Setup + Foundational together (Phase 1-2)
2. **Once Foundational done:**
   - Developer A: User Story 1 (T017-T027)
   - Developer B: User Story 2 (T028-T032) - starts after US1 agent exists
   - Developer C: User Story 5 (T046-T053) - independent security layer
3. **After core stories:**
   - Developer A: User Story 3 (T033-T039)
   - Developer B: User Story 4 (T040-T045)
   - Developer C: Polish (T054-T063)

---

## Summary Statistics

- **Total Tasks**: 63
- **Setup Tasks**: 5 (Phase 1)
- **Foundational Tasks**: 11 (Phase 2)
- **User Story 1 (P1 - MVP)**: 11 tasks
- **User Story 2 (P2)**: 5 tasks
- **User Story 3 (P3)**: 7 tasks
- **User Story 4 (P4)**: 6 tasks
- **User Story 5 (P5)**: 8 tasks
- **Polish Tasks**: 10 (Phase 8)

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel (44% parallelizable)

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1) = 27 tasks

**Independent Test Criteria**:
- US1: Send "Add task to buy groceries" → verify task in database
- US2: Ask "What's on my list?" → verify tasks listed
- US3: Send "Mark task 5 as done" → verify task completed
- US4: Refresh browser → verify conversation history persists
- US5: Try invalid token → verify 401, try cross-user access → verify 403

---

## Notes

- All [P] tasks touch different files and can run in parallel
- Each [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- MVP (User Story 1) delivers core value: natural language task creation
- Tests are NOT included (not requested in specification - direct implementation only)
- Stop at any checkpoint to validate story independently
- Commit after each task or logical group for clean git history
- Use research.md for SDK integration patterns (openai + modelcontextprotocol)
- Use data-model.md for database schema (migrations 008, 009)
- Use contracts/ for API specifications (chat-api.yaml, mcp-tools.yaml)
- Use quickstart.md for final validation (8 test scenarios)
