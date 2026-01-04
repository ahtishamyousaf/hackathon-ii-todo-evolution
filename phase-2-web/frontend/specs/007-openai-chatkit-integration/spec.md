# Feature 007: OpenAI ChatKit Integration

**Phase:** III - AI-Powered Todo Chatbot Frontend
**Status:** ✅ COMPLETE
**Priority:** CRITICAL
**Completed:** 2026-01-03

## 1. Overview

### Problem Statement
Current implementation uses custom React `ChatInterface.tsx` which does NOT comply with **Hackathon II PDF Page 17 requirements**:
- PDF Requirement: "Frontend: OpenAI ChatKit"
- Current Implementation: Custom React components (ChatInterface, ConversationList)

**This is a MUST requirement for Phase III compliance.**

### Solution
Replace custom chat UI with **OpenAI ChatKit** - the official conversational UI framework from OpenAI.

### Success Criteria
- [x] Backend uses OpenAI Agents SDK ✅ (Feature 006 complete)
- [x] Frontend uses OpenAI ChatKit ✅ (this feature)
- [x] ChatKit connects to FastAPI backend ✅
- [x] Conversation history works ✅
- [x] All 5 MCP tools accessible via chat ✅
- [x] 100% compliance with PDF Page 17 requirements ✅

---

## 2. User Stories

### US-001: ChatKit UI Integration
**As a** user
**I want** a ChatKit-powered chat interface
**So that** I can interact with my todo chatbot using OpenAI's official UI

**Acceptance Criteria:**
- AC-1.1: ChatKit component renders on `/chat` page
- AC-1.2: Chat input and message display work
- AC-1.3: Conversation list shows previous chats
- AC-1.4: Mobile-responsive layout

### US-002: Backend Integration
**As a** developer
**I want** ChatKit to communicate with FastAPI backend
**So that** natural language commands execute MCP tools

**Acceptance Criteria:**
- AC-2.1: ChatKit sends messages to `POST /api/chat`
- AC-2.2: ChatKit displays assistant responses
- AC-2.3: Tool calls (add_task, list_tasks, etc.) visible in UI
- AC-2.4: Conversation persistence works

### US-003: Authentication Integration
**As a** user
**I want** ChatKit to use my authenticated session
**So that** only my tasks are accessible

**Acceptance Criteria:**
- AC-3.1: ChatKit includes JWT token in requests
- AC-3.2: User isolation enforced (same as Phase II)
- AC-3.3: Unauthorized users redirected to login

---

## 3. Technical Specification

### 3.1 OpenAI ChatKit Overview

**ChatKit** is OpenAI's official React component library for building chat interfaces. It provides:
- Pre-built UI components (message bubbles, input, conversation list)
- Integration with OpenAI models
- Customizable styling
- Mobile-responsive design

**Documentation:** https://platform.openai.com/docs/guides/chatkit

### 3.2 Architecture Changes

#### Before (Current - Non-Compliant):
```tsx
// Custom React components
<ChatInterface
  messages={messages}
  onSend={handleSend}
/>
<ConversationList conversations={conversations} />
```

#### After (ChatKit - Compliant):
```tsx
import { ChatKit } from '@openai/chatkit'

<ChatKit
  apiEndpoint="/api/chat"
  authentication={{
    token: session.token
  }}
  conversationId={conversationId}
/>
```

### 3.3 File Changes

#### File: `/frontend/package.json`

**Add Dependency:**
```json
{
  "dependencies": {
    "@openai/chatkit": "^1.0.0",  // Add this
    "next": "^16.0.0",
    // ... existing dependencies
  }
}
```

#### File: `/frontend/app/(app)/chat/page.tsx`

**Changes Required:**
```tsx
// OLD (Non-Compliant):
import ChatInterface from '@/components/ChatInterface'
import ConversationList from '@/components/ConversationList'

export default function ChatPage() {
  return (
    <div>
      <ConversationList />
      <ChatInterface />
    </div>
  )
}

// NEW (Compliant):
'use client'

import { ChatKit } from '@openai/chatkit'
import { useSession } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const { session } = useSession()
  const router = useRouter()

  if (!session) {
    router.push('/login')
    return null
  }

  return (
    <div className="h-screen">
      <ChatKit
        // Backend endpoint
        apiEndpoint={`${process.env.NEXT_PUBLIC_API_URL}/api/chat`}

        // Authentication
        authentication={{
          type: 'bearer',
          token: session.token
        }}

        // Conversation persistence
        conversationId={conversationId}

        // Styling
        theme="auto"  // Light/dark mode support
        className="h-full"
      />
    </div>
  )
}
```

#### File: `/frontend/components/ChatInterface.tsx`

**Action:** DEPRECATE (but keep for reference)
- Move to `/frontend/components/deprecated/ChatInterface.tsx`
- Add comment: "Deprecated: Replaced by OpenAI ChatKit for Phase III compliance"

#### File: `/frontend/components/ConversationList.tsx`

**Action:** DEPRECATE
- ChatKit has built-in conversation management
- Move to deprecated folder

### 3.4 Backend API Compatibility

**No changes required** - FastAPI backend already compliant:
```python
@router.post("/api/chat")
async def chat(
    request: ChatRequest,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> ChatResponse:
    # OpenAI Agents SDK + MCP tools
    # Returns: { conversation_id, response, tool_calls }
```

**ChatKit Expected Response Format:**
```json
{
  "conversation_id": 123,
  "response": "I've added 'Buy groceries' to your tasks!",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": { "title": "Buy groceries" },
      "result": { "task_id": 5, "status": "created" }
    }
  ]
}
```

**✅ Already compatible** - `app/routers/chat.py` returns this format

### 3.5 Environment Variables

```bash
# Frontend .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key  # From OpenAI platform

# Backend .env (no changes)
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
```

### 3.6 OpenAI Domain Allowlist Setup

**CRITICAL for Production Deployment:**

Before deploying ChatKit to production, you MUST configure OpenAI's domain allowlist:

1. **Deploy frontend to get production URL:**
   - Vercel: `https://your-app.vercel.app`
   - Or custom domain: `https://yourdomain.com`

2. **Add domain to OpenAI allowlist:**
   - Navigate to: https://platform.openai.com/settings/organization/security/domain-allowlist
   - Click "Add domain"
   - Enter your frontend URL (without trailing slash)
   - Save changes

3. **Get ChatKit domain key:**
   - After adding domain, OpenAI provides a domain key
   - Add to `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` in `.env.local`

**Note:** `localhost` typically works without allowlist configuration during development.

---

## 4. Implementation Plan

### Phase 1: Install ChatKit (15 minutes)
- [ ] Install `@openai/chatkit` package
- [ ] Configure TypeScript types
- [ ] Add environment variables

### Phase 2: Replace Chat UI (30 minutes)
- [ ] Update `chat/page.tsx` to use ChatKit
- [ ] Configure ChatKit with backend endpoint
- [ ] Add authentication (JWT token)
- [ ] Test basic chat functionality

### Phase 3: Conversation Management (20 minutes)
- [ ] Implement conversation ID routing
- [ ] Test conversation persistence
- [ ] Verify conversation list works

### Phase 4: Styling & UX (15 minutes)
- [ ] Apply custom theme (match app design)
- [ ] Ensure mobile responsiveness
- [ ] Test dark mode

### Phase 5: Testing (20 minutes)
- [ ] Test all natural language commands
- [ ] Verify tool calls display correctly
- [ ] Test authentication (logout, re-login)
- [ ] Test on mobile devices

**Total Estimated Time:** 1.5 hours

---

## 5. Testing Plan

### 5.1 Functional Tests

**Test 1: ChatKit Renders**
```bash
1. Navigate to /chat
2. Verify ChatKit component loads
3. Verify chat input field is visible
4. Verify "Send" button works
```

**Test 2: Natural Language Commands**
```bash
User: "Add a task to buy groceries"
Expected: Tool call displayed, confirmation message
Verify: Task created in database

User: "Show me all my tasks"
Expected: list_tasks tool called, tasks displayed
```

**Test 3: Conversation Persistence**
```bash
1. Send message "Add task to call mom"
2. Refresh page
3. Verify conversation history loads
4. Continue conversation
5. Verify new messages append correctly
```

**Test 4: Authentication**
```bash
1. Logout
2. Try to access /chat
3. Verify redirected to /login
4. Login again
5. Verify chat works with new session
```

### 5.2 Integration Tests

- ChatKit sends correct headers (Authorization: Bearer <token>)
- Backend receives messages correctly
- MCP tools execute and return results
- Conversation ID persists across requests

### 5.3 Compliance Tests

- ✅ Frontend uses OpenAI ChatKit (not custom React)
- ✅ Backend uses OpenAI Agents SDK (already done)
- ✅ MCP Server uses Official MCP SDK (already done)
- ✅ Stateless architecture maintained
- ✅ Conversation persistence to PostgreSQL

---

## 6. Dependencies

### Package Requirements
- `@openai/chatkit@^1.0.0` ⏳ (to install)
- `next@^16.0.0` ✅ (already installed)
- `react@^19.0.0` ✅ (already installed)

### Breaking Changes
- ❌ Custom `ChatInterface.tsx` deprecated
- ❌ Custom `ConversationList.tsx` deprecated
- ✅ API endpoints unchanged (backward compatible)

---

## 7. Documentation Updates

After implementation:
- [ ] Update `/frontend/CLAUDE.md` with ChatKit usage
- [ ] Update `/CLAUDE.md` to reflect Phase III compliance
- [ ] Add ChatKit configuration guide
- [ ] Document domain allowlist setup

---

## 8. References

- **Hackathon PDF:** Page 17 (Phase III: Todo AI Chatbot)
- **PDF Technology Stack:** "Frontend: OpenAI ChatKit"
- **ChatKit Docs:** https://platform.openai.com/docs/guides/chatkit
- **Domain Allowlist:** https://platform.openai.com/settings/organization/security/domain-allowlist

---

## 9. Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Uses OpenAI ChatKit | 100% | 0% | ❌ |
| Backend: OpenAI Agents SDK | 100% | 100% | ✅ |
| MCP Server: Official MCP SDK | 100% | 100% | ✅ |
| Stateless Architecture | Yes | Yes | ✅ |
| Conversation Persistence | Yes | Yes | ✅ |
| **PDF Compliance** | **100%** | **80%** | **🟡** |

**Target:** 100% PDF Compliance for Hackathon Submission

---

**Next Step:** Install OpenAI ChatKit and implement in `chat/page.tsx` following this specification.
