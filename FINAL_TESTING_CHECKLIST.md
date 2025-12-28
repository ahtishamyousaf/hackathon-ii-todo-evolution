# Final Testing Checklist - Phase III AI Chatbot

**Purpose**: Verify 100% compliance before hackathon submission
**Date**: 2025-12-28

---

## Backend API Tests

### Test 1: Health Check
```bash
curl http://localhost:8000/
```
**Expected**: `{"message":"Todo API is running","version":"1.0.0",...}`

### Test 2: API Documentation
```bash
curl http://localhost:8000/docs
```
**Expected**: OpenAPI/Swagger UI loads

---

## AI Chatbot Tests (via API)

**Note**: Replace `YOUR_JWT_TOKEN` with actual token from Better Auth session

### Test 3: Add Task via Natural Language
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

**Expected Response**:
```json
{
  "response": "I've added 'Buy groceries' to your tasks with a due date of tomorrow!"
}
```

**Verification**: Check database or list tasks to confirm task was created

### Test 4: List Tasks
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all my tasks"
  }'
```

**Expected Response**:
```json
{
  "response": "You have 5 tasks:\n✓ Buy groceries (completed)\n□ Call mom (high priority, due today)\n..."
}
```

### Test 5: Complete Task
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark task 1 as complete"
  }'
```

**Expected Response**:
```json
{
  "response": "Great! I've marked 'Buy groceries' as complete."
}
```

### Test 6: Update Task
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change task 2 to Call mom tonight"
  }'
```

**Expected Response**:
```json
{
  "response": "I've updated task 2 to 'Call mom tonight'."
}
```

### Test 7: Delete Task
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete task 3"
  }'
```

**Expected Response**:
```json
{
  "response": "I've deleted task 3 from your list."
}
```

### Test 8: Filter Tasks
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What tasks are pending?"
  }'
```

**Expected Response**:
```json
{
  "response": "You have 3 pending tasks:\n□ Call mom (high priority)\n□ Finish report\n□ Pay bills"
}
```

---

## Frontend UI Tests

### Test 9: Chat Interface Loads
1. Open: http://localhost:3001/chat
2. Verify: Chat interface displays
3. Verify: Input field present
4. Verify: Conversation history sidebar (desktop)
5. Verify: Hamburger menu (mobile)

### Test 10: Natural Language Commands (Frontend)

**Commands to try**:
- "Add a task to buy groceries"
- "Show me all my tasks"
- "What's pending?"
- "Mark task 1 as complete"
- "Delete the meeting task"
- "Change task 2 to 'Call mom tonight'"
- "I need to remember to pay bills"
- "What have I completed?"

**Expected**: AI responds naturally, tasks update in real-time

### Test 11: Conversation Persistence
1. Send message: "Add a task to test persistence"
2. Refresh page
3. Verify: Conversation history still shows the message
4. Verify: Conversation continues from where it left off

### Test 12: Tool Calls Display
1. Send message: "Add a task to buy milk"
2. Verify: Response shows tool was called
3. Verify: Confirmation message displayed
4. Verify: Task appears in task list

---

## Mobile Responsiveness Tests

### Test 13: Mobile Chat View
1. Resize browser to 375px width (iPhone size)
2. Verify: Sidebar hidden by default
3. Verify: Hamburger menu appears
4. Tap hamburger menu
5. Verify: Sidebar slides in with overlay
6. Tap outside sidebar
7. Verify: Sidebar closes

### Test 14: Mobile Task Input
1. On mobile view, type natural language command
2. Verify: Input field responsive
3. Verify: Send button accessible
4. Verify: Response displays correctly

---

## Authentication Tests

### Test 15: Unauthenticated Access
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my tasks"
  }'
```

**Expected**: 401 Unauthorized error

### Test 16: Invalid Token
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer invalid_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my tasks"
  }'
```

**Expected**: 401 Unauthorized error

### Test 17: User Isolation
1. Login as User A, create task via chat
2. Logout, login as User B
3. Ask: "Show me all my tasks"
4. Verify: User A's task NOT visible to User B

---

## Database Persistence Tests

### Test 18: Conversation Storage
1. Send chat message via API
2. Check database:
   ```sql
   SELECT * FROM conversations WHERE user_id = 'YOUR_USER_ID';
   SELECT * FROM messages WHERE user_id = 'YOUR_USER_ID';
   ```
3. Verify: Conversation and messages stored correctly

### Test 19: Task Storage via AI
1. AI command: "Add task to test storage"
2. Check database:
   ```sql
   SELECT * FROM tasks WHERE title LIKE '%test storage%';
   ```
3. Verify: Task created with correct user_id

---

## Error Handling Tests

### Test 20: Invalid Task ID
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Complete task 99999"
  }'
```

**Expected**: AI responds with "Task 99999 not found" or similar

### Test 21: Malformed Request
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invalid": "field"
  }'
```

**Expected**: 422 Unprocessable Entity error

### Test 22: Empty Message
```bash
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": ""
  }'
```

**Expected**: AI responds with helpful prompt or validation error

---

## Performance Tests

### Test 23: Response Time
- Send simple query: "Show my tasks"
- Measure response time
- **Expected**: < 3 seconds (including OpenAI API call)

### Test 24: Concurrent Requests
- Send 5 chat requests simultaneously
- Verify: All complete successfully
- Verify: No race conditions in database

---

## Final Checklist

### Code Quality
- [ ] No errors in backend logs
- [ ] No errors in frontend console
- [ ] TypeScript compiles without errors
- [ ] Python type hints pass (if using mypy)
- [ ] ESLint clean
- [ ] Prettier formatted

### Features Working
- [ ] All 5 MCP tools callable by AI
- [ ] Natural language understanding accurate
- [ ] Conversation history persists
- [ ] User isolation enforced
- [ ] Mobile responsive
- [ ] Dark mode works

### Documentation
- [ ] README.md comprehensive
- [ ] CLAUDE.md technical guidelines complete
- [ ] AGENTS.md workflow documented
- [ ] MIGRATION_TO_OFFICIAL_SDKS.md created
- [ ] ADR-0001 documents learning
- [ ] This testing checklist complete

### Security
- [ ] OPENAI_API_KEY not in git
- [ ] .env in .gitignore
- [ ] JWT authentication working
- [ ] User isolation verified
- [ ] No SQL injection vulnerabilities
- [ ] API key rotated after exposure

### Process Quality
- [ ] Pre-commit hook installed
- [ ] Spec files exist for all features
- [ ] PHRs document key decisions
- [ ] ADRs document architectural choices
- [ ] Git history shows incremental progress

---

## Test Results Log

| Test # | Description | Result | Notes |
|--------|-------------|--------|-------|
| 1 | Health Check | ⏳ | |
| 2 | API Docs | ⏳ | |
| 3 | Add Task | ⏳ | |
| 4 | List Tasks | ⏳ | |
| 5 | Complete Task | ⏳ | |
| 6 | Update Task | ⏳ | |
| 7 | Delete Task | ⏳ | |
| 8 | Filter Tasks | ⏳ | |
| 9 | Chat UI Loads | ⏳ | |
| 10 | Natural Language | ⏳ | |
| 11 | Conversation Persist | ⏳ | |
| 12 | Tool Calls Display | ⏳ | |
| 13 | Mobile Chat | ⏳ | |
| 14 | Mobile Input | ⏳ | |
| 15 | Unauth Access | ⏳ | |
| 16 | Invalid Token | ⏳ | |
| 17 | User Isolation | ⏳ | |
| 18 | Conversation Storage | ⏳ | |
| 19 | Task Storage | ⏳ | |
| 20 | Invalid Task ID | ⏳ | |
| 21 | Malformed Request | ⏳ | |
| 22 | Empty Message | ⏳ | |
| 23 | Response Time | ⏳ | |
| 24 | Concurrent Requests | ⏳ | |

Legend: ⏳ Pending | ✅ Pass | ❌ Fail

---

**After completing all tests, mark this checklist as complete and proceed to final submission.**
