# Quick Start: Phase III Integration Testing

**Feature**: AI-Powered Todo Chatbot
**Date**: 2025-12-26
**Purpose**: Test scenarios to validate implementation

---

## Prerequisites

```bash
# Backend running
cd phase-2-web/backend
uvicorn app.main:app --reload

# Frontend running
cd phase-2-web/frontend
npm run dev

# Database migrations applied
python run_migration.py 008
python run_migration.py 009

# Environment variables set
OPENAI_API_KEY=sk-...
BETTER_AUTH_SECRET=...
DATABASE_URL=postgresql://...
```

---

## Test Scenario 1: Basic Chat Flow

**Objective**: Verify end-to-end chat functionality

**Steps**:
1. Open frontend at `http://localhost:3000/chat`
2. Log in with test credentials
3. Send message: "Add a task to buy groceries"
4. Verify AI response confirms task creation
5. Check database: `SELECT * FROM tasks WHERE title LIKE '%groceries%';`

**Expected Results**:
- ✓ Chat interface displays user message
- ✓ AI responds: "I've added 'Buy groceries' to your tasks!"
- ✓ Database has new task row with correct user_id
- ✓ Conversation and message records created

**SQL Verification**:
```sql
-- Check conversation created
SELECT * FROM conversations WHERE user_id = 'test-user-id';

-- Check messages stored
SELECT role, content FROM messages WHERE conversation_id = 1;

-- Check task created
SELECT * FROM tasks WHERE title = 'Buy groceries' AND user_id = 'test-user-id';
```

---

## Test Scenario 2: Conversation Persistence

**Objective**: Validate stateless architecture and conversation history

**Steps**:
1. Start conversation (Scenario 1)
2. Note conversation_id from response
3. Send follow-up: "What's on my list?"
4. Refresh browser
5. Send new message with same conversation_id
6. Verify full history displayed

**Expected Results**:
- ✓ Conversation history loaded from database
- ✓ AI has context from previous messages
- ✓ Browser refresh doesn't lose conversation
- ✓ Messages display in chronological order

**Curl Test**:
```bash
# Get JWT token
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  | jq -r '.token')

# Start conversation
CONV_ID=$(curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Add task to call mom"}' \
  | jq -r '.conversation_id')

# Continue conversation
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"conversation_id\":$CONV_ID,\"message\":\"Show me my tasks\"}"
```

---

## Test Scenario 3: User Isolation

**Objective**: Verify security and data isolation

**Steps**:
1. User A logs in and creates conversation (conv_id = X)
2. User B logs in
3. User B attempts to access conversation X via API
4. Verify 403 Forbidden response

**Expected Results**:
- ✓ User B receives 403 Forbidden
- ✓ Error message: "Not authorized to access this conversation"
- ✓ No data leakage between users
- ✓ Database queries filtered by user_id

**Curl Test**:
```bash
# User A creates conversation
TOKEN_A="user-a-jwt-token"
CONV_A=$(curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN_A" \
  -d '{"message":"My private task"}' \
  | jq -r '.conversation_id')

# User B tries to access User A's conversation
TOKEN_B="user-b-jwt-token"
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN_B" \
  -d "{\"conversation_id\":$CONV_A,\"message\":\"Hack attempt\"}"
# Expected: 403 Forbidden
```

---

## Test Scenario 4: Stateless Validation

**Objective**: Confirm server holds no state between requests

**Steps**:
1. Send chat message, note conversation_id
2. Restart backend server
3. Send follow-up message with conversation_id
4. Verify history loaded correctly

**Expected Results**:
- ✓ Backend restarts without data loss
- ✓ Conversation history fetched from database
- ✓ AI has full context despite restart
- ✓ No "session expired" errors

**Test Commands**:
```bash
# Send initial message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"First message"}' > response1.json

# Restart backend
pkill -f uvicorn
uvicorn app.main:app --reload &

# Continue conversation
CONV_ID=$(jq -r '.conversation_id' response1.json)
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"conversation_id\":$CONV_ID,\"message\":\"Second message\"}"
```

---

## Test Scenario 5: Natural Language Commands

**Objective**: Verify AI interprets task commands correctly

**Test Cases**:

| Input | Expected Tool Call | Expected Response |
|-------|-------------------|-------------------|
| "Add a task to call mom" | add_task(title="Call mom") | "I've added 'Call mom' to your tasks!" |
| "Show me my tasks" | list_tasks(status="all") | Lists all tasks |
| "What's pending?" | list_tasks(status="pending") | Lists incomplete tasks |
| "Mark task 3 as done" | complete_task(task_id=3) | "I've marked task 3 as complete." |
| "Delete task 2" | delete_task(task_id=2) | "I've deleted task 2." |
| "Change task 1 to 'Call mom tonight'" | update_task(task_id=1, title="Call mom tonight") | "I've updated task 1." |

**Testing Script**:
```python
import requests

TOKEN = "test-jwt-token"
BASE_URL = "http://localhost:8000"

def send_message(message, conv_id=None):
    payload = {"message": message}
    if conv_id:
        payload["conversation_id"] = conv_id

    response = requests.post(
        f"{BASE_URL}/api/chat",
        headers={"Authorization": f"Bearer {TOKEN}"},
        json=payload
    )
    return response.json()

# Test each command
commands = [
    "Add a task to call mom",
    "Show me my tasks",
    "What's pending?",
    "Mark task 3 as done",
    "Delete task 2",
    "Change task 1 to 'Call mom tonight'"
]

for cmd in commands:
    result = send_message(cmd)
    print(f"Input: {cmd}")
    print(f"Response: {result['response']}")
    print(f"Tool Calls: {result.get('tool_calls', [])}")
    print("---")
```

---

## Test Scenario 6: MCP Tool Error Handling

**Objective**: Verify graceful error handling

**Test Cases**:

| Scenario | Input | Expected Behavior |
|----------|-------|-------------------|
| Non-existent task | "Complete task 999" | "I couldn't find task 999." |
| Invalid JWT | Request with bad token | 401 Unauthorized |
| Empty message | "" | 422 Validation Error |
| Very long message | 6000 chars | 422 or truncation with warning |
| Database down | Any message | 500 with retry message |

**Error Testing**:
```bash
# Test invalid task ID
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":"Complete task 9999"}'
# Expected: AI says "I couldn't find task 9999"

# Test invalid JWT
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer invalid-token" \
  -d '{"message":"Test"}'
# Expected: 401 Unauthorized

# Test empty message
curl -X POST http://localhost:8000/api/chat \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"message":""}'
# Expected: 422 Validation Error
```

---

## Test Scenario 7: Conversation History Pagination

**Objective**: Verify handling of long conversations

**Steps**:
1. Create conversation
2. Send 30 messages (more than default limit)
3. Request conversation history
4. Verify only last 20 messages loaded

**Expected Results**:
- ✓ Recent 20 messages loaded instantly
- ✓ Older messages available via pagination
- ✓ Performance remains acceptable (<2s)
- ✓ AI has sufficient context from recent history

**SQL Setup**:
```sql
-- Create test conversation with 30 messages
INSERT INTO conversations (user_id) VALUES ('test-user') RETURNING id;

DO $$
DECLARE
    conv_id INTEGER := 1;  -- Use returned ID
BEGIN
    FOR i IN 1..30 LOOP
        INSERT INTO messages (user_id, conversation_id, role, content)
        VALUES ('test-user', conv_id, 'user', 'Message ' || i);
    END LOOP;
END $$;
```

---

## Test Scenario 8: ChatKit Integration

**Objective**: Verify frontend ChatKit component works

**Manual Testing**:
1. Open `/chat` page in browser
2. Verify ChatKit interface renders
3. Send message and verify response displays
4. Check dark mode toggle
5. Verify mobile responsiveness

**Expected Results**:
- ✓ Chat interface renders correctly
- ✓ Messages display in chat bubbles
- ✓ User messages right-aligned, AI left-aligned
- ✓ Timestamps visible
- ✓ Loading indicators during AI processing
- ✓ Tool call indicators shown ("Adding task...")
- ✓ Dark mode styling works
- ✓ Mobile layout has no horizontal scroll

---

## Acceptance Criteria Checklist

From spec.md, verify all acceptance criteria:

**User Story 1 (Add Tasks)**:
- [ ] User types "Add a task to buy groceries"
- [ ] System creates task with correct title
- [ ] AI confirms with friendly message
- [ ] Task has user_id from JWT (not from message)
- [ ] Unauthenticated request returns 401

**User Story 2 (View Tasks)**:
- [ ] User asks "What's on my todo list?"
- [ ] AI lists all pending tasks
- [ ] Filtering by status works (pending/completed/all)
- [ ] Empty state message when no tasks
- [ ] Only user's tasks returned (user isolation)

**User Story 3 (Manage Tasks)**:
- [ ] "Mark task 3 as complete" updates database
- [ ] "Delete the meeting task" confirms then deletes
- [ ] "Change task 1 to X" updates title
- [ ] Cross-user access rejected with error

**User Story 4 (Conversation Persistence)**:
- [ ] Conversation history displays on page load
- [ ] New messages append to existing conversation
- [ ] Server restart doesn't lose data
- [ ] Only user's conversations shown

**User Story 5 (Authentication)**:
- [ ] Valid JWT allows chat operations
- [ ] Expired JWT returns 401
- [ ] Cross-user conversation access returns 403
- [ ] MCP tools receive correct user_id

---

**Testing Complete**: All scenarios pass → Ready for deployment
