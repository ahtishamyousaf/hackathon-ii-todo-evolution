# 🤖 AI-Powered Todo App | Natural Language Task Management

> **Hackathon 2 - Phase III Submission**  
> Manage tasks through conversation, not clicks!

[![Phase I](https://img.shields.io/badge/Phase_I-Complete-success)]()
[![Phase II](https://img.shields.io/badge/Phase_II-Complete-success)]()
[![Phase III](https://img.shields.io/badge/Phase_III-Complete-success)]()
[![Security](https://img.shields.io/badge/Security-Enterprise_Grade-blue)]()
[![AI](https://img.shields.io/badge/AI-GPT4_Turbo-purple)]()

---

## 🌟 What Makes This Different?

**This is NOT another CRUD todo app.**  
**This is an AI-powered natural language task manager.**

```
👤 You: "Add a task to buy groceries tomorrow"
🤖 AI:  "✅ I've added 'Buy groceries' with due date tomorrow!"

👤 You: "What's on my todo list?"
🤖 AI:  "You have 3 tasks: Buy groceries (due tomorrow), Finish report..."

👤 You: "Mark the grocery task as complete"
🤖 AI:  "✅ Great! I've marked 'Buy groceries' as complete."
```

No forms. No clicking. Just conversation.

---

## 🚀 Unique Innovation (Competitive Advantage)

### 1. **AI-First Architecture** ⭐⭐⭐
- **OpenAI GPT-4 Turbo** - Natural language understanding
- **Model Context Protocol (MCP)** - 5 custom tools
- **OpenAI Agents SDK** - Intelligent tool calling
- **Stateless design** - All state in database

### 2. **Natural Language Task Management** ⭐⭐⭐
Say it naturally, AI does it:
- "Add a task to..." → Creates task
- "Show me all..." → Lists tasks
- "Mark task X as..." → Completes task
- "Update task Y to..." → Updates task
- "Delete task Z" → Deletes task (with confirmation!)

### 3. **Production-Ready MCP Server** ⭐⭐
- Official MCP SDK for Python
- User isolation via JWT injection
- Prevents AI impersonation attacks
- RESTful API integration

### 4. **Advanced Features (Phase II)** ⭐⭐
- Task categories with colors
- Drag & drop reordering
- Bulk operations
- Smart date picker
- File attachments
- Advanced search (`is:completed`, `priority:high`)
- Keyboard shortcuts (N, /, Esc, etc.)

---

## 🔐 Security-First Design

Security is **primary architecture**, not an afterthought.

### Authentication
✅ **Better Auth v1.4.7** (production-grade)  
✅ **JWT tokens** with expiration  
✅ **Bcrypt hashing** (12 rounds + salt)  
✅ **HTTP-only cookies** (XSS protection)

### Authorization
✅ **Database-level isolation** (every query filters by user_id)  
✅ **API-level protection** (403 Forbidden checks)  
✅ **MCP tool security** (user_id injection from JWT)  
✅ **Ownership validation** (users can ONLY access their data)

### Protection
✅ **SQL injection prevention** (SQLModel ORM)  
✅ **CORS** properly configured  
✅ **Rate limiting** (3 retries with backoff)  
✅ **No hardcoded secrets** (environment variables)

**Full security docs:** [SECURITY.md](SECURITY.md)

---

## ⚙️ Core Functionality

### 🤖 AI-Powered (Phase III)
- ✅ Natural language task creation
- ✅ Conversational task management
- ✅ AI-powered queries
- ✅ Context-aware responses
- ✅ Multi-conversation support
- ✅ Conversation history persistence

### ⚡ Advanced Features (Phase II)
- ✅ Task categories + color coding
- ✅ Drag & drop reordering
- ✅ Bulk operations
- ✅ Smart date picker (Today, Tomorrow, Next Week)
- ✅ File attachments + preview
- ✅ Advanced search (`is:completed`, `priority:high`)
- ✅ Keyboard shortcuts (N, /, Esc)

### 📝 Core CRUD (Phase I)
- ✅ Create, update, delete tasks
- ✅ Task status (pending/completed)
- ✅ Priority levels (low, medium, high)
- ✅ Due dates
- ✅ Descriptions
- ✅ Subtasks

---

## 🧠 Tech Stack

**Frontend:** Next.js 16, TypeScript, Tailwind CSS, Better Auth  
**Backend:** FastAPI, SQLModel, PostgreSQL (Neon), JWT  
**AI/ML:** OpenAI GPT-4 Turbo, OpenAI Agents SDK, Official MCP SDK  
**DevOps:** Git, Environment Variables, Vercel, Railway

---

## 🔧 MCP Tools (Model Context Protocol)

### 1. add_task
Creates tasks from natural language
```
User: "Add a task to call mom tomorrow at 3pm"
AI calls: add_task(title="Call mom", due_date="2025-12-31T15:00")
Result: {"task_id": 42, "status": "created"}
```

### 2. list_tasks
Queries tasks with filters
```
User: "What pending tasks do I have?"
AI calls: list_tasks(status="pending")
Result: {"tasks": [...], "count": 5}
```

### 3. complete_task
Marks tasks complete/incomplete
```
User: "Mark task 42 as done"
AI calls: complete_task(task_id=42)
Result: {"status": "completed"}
```

### 4. update_task
Modifies task details
```
User: "Change task 42 to 'Call mom AND dad'"
AI calls: update_task(task_id=42, title="Call mom AND dad")
Result: {"status": "updated"}
```

### 5. delete_task
Deletes tasks (with AI safety confirmation)
```
User: "Delete task 42"
AI: "Are you sure? This cannot be undone."
User: "Yes, I'm sure"
AI calls: delete_task(task_id=42)
Result: {"status": "deleted"}
```

---

## 🏗 Architecture

### Stateless AI Agent Design
```
User → Next.js → FastAPI → OpenAI GPT-4 → MCP Server → PostgreSQL
       (Chat)   (JWT)      (Tool Call)    (Execution)  (Persistence)
```

**Key Principle:** Server holds **NO state** between requests.  
All conversation history fetched from database on each request.

**Why This Matters:**
- ✅ Horizontal scaling ready
- ✅ No memory leaks
- ✅ Survives server restarts
- ✅ Clean separation of concerns

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.13+
- PostgreSQL (Neon recommended)
- OpenAI API key

### Setup

```bash
# Frontend
cd phase-2-web/frontend
npm install
npm run dev  # http://localhost:3000

# Backend
cd phase-2-web/backend
pip install -r requirements.txt
uvicorn app.main:app --reload  # http://localhost:8000

# Database
python run_migration.py
```

### Environment Variables

**Frontend (.env.local):**
```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-32-char-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env):**
```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-32-char-secret
OPENAI_API_KEY=sk-...
SECRET_KEY=your-fastapi-secret
```

### First Run
1. Register at http://localhost:3000/register
2. Login at http://localhost:3000/login
3. Chat at http://localhost:3000/chat
4. Try: "Add a task to test the AI chatbot"

---

## 🎯 Usage Examples

### Natural Language
```
"Add a task to finish the hackathon project by Friday"
"Show me all my tasks"
"What's on my todo list?"
"Mark task 5 as done"
"Change task 3 to say 'Deploy to production'"
"Delete the test task"
```

### Advanced Search
```
is:completed          # Completed tasks
is:active             # Active tasks
priority:high         # High priority
category:work         # Work category
due:today             # Due today
due:overdue           # Overdue
```

### Keyboard Shortcuts
```
N         - New task
/         - Search
Esc       - Close modal
↑/↓       - Navigate
Enter     - Edit
Space     - Toggle complete
Delete    - Delete task
```

---

## 📊 Test Results

**Phase III Validation:** [PHASE3_VALIDATION_COMPLETE.md](phase-2-web/backend/PHASE3_VALIDATION_COMPLETE.md)

✅ All 5 MCP tools: **PASSING**  
✅ Natural language: **WORKING**  
✅ Security: **VALIDATED**  
✅ Conversation persistence: **WORKING**  
✅ User isolation: **ENFORCED**

**Live Testing:** Comprehensive Playwright tests passed (see validation doc)

---

## 📚 Documentation

- [SECURITY.md](SECURITY.md) - Enterprise security architecture
- [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md) - Future enhancements
- [PHASE3_VALIDATION_COMPLETE.md](phase-2-web/backend/PHASE3_VALIDATION_COMPLETE.md) - Test results
- [CHAT_AUTH_FIX.md](phase-2-web/backend/CHAT_AUTH_FIX.md) - Auth debugging notes

---

## 🏆 Competitive Comparison

| Feature | Traditional Todo App | Our AI-Powered App |
|---------|---------------------|-------------------|
| Task Creation | ❌ Fill forms | ✅ Natural language |
| Task Management | ❌ Click buttons | ✅ Conversation |
| AI Integration | ❌ None | ✅ GPT-4 Turbo |
| MCP Tools | ❌ None | ✅ 5 custom tools |
| Conversation | ❌ N/A | ✅ Persistent chat |
| Security | ✅ JWT + Bcrypt | ✅ JWT + Bcrypt + AI isolation |
| Advanced Features | ✅ Categories, filters | ✅ Same + AI |
| Innovation | ⭐ | ⭐⭐⭐ |

---

## 💡 Key Learnings

1. **Stateless AI Agents** - All state in database, not memory
2. **MCP Tool Security** - User ID injection prevents impersonation
3. **Better Auth Integration** - Production-grade auth
4. **OpenAI Function Calling** - Structured tool execution
5. **SSE Streaming** - Real-time AI responses

---

## 🚧 Future Enhancements

- Toast notifications
- Skeleton loaders
- Calendar view
- Animations (GSAP/Framer Motion)
- Email notifications
- Recurring tasks
- Team collaboration

**Full roadmap:** [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md)

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

OpenAI, MCP Team, Better Auth, FastAPI, Next.js, Neon

---

<div align="center">

**🚀 Built with AI, MCP, and Innovation 🚀**

Made with ❤️ for Hackathon 2

[🌐 Live Demo](#) | [📹 Video](#) | [📘 Docs](SECURITY.md)

</div>
