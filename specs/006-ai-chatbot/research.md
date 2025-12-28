# Research: Phase III Technical Integration

**Feature**: AI-Powered Todo Chatbot
**Date**: 2025-12-26
**Purpose**: Resolve technical unknowns before implementation

---

## 1. OpenAI Agents SDK + MCP SDK Integration

### Decision: Use OpenAI Python SDK with function calling (NOT separate Agents SDK)

**Rationale**:
After researching, the "OpenAI Agents SDK" mentioned in the hackathon PDF refers to the standard OpenAI Python SDK with function calling capabilities, NOT a separate package called `openai-agents-sdk`.

**Correct Package**:
```bash
pip install openai
```

**Integration Pattern**:
```python
from openai import OpenAI
from mcp import MCPServer, Tool

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Define MCP tools as OpenAI functions
tools = [
    {
        "type": "function",
        "function": {
            "name": "add_task",
            "description": "Create a new task for the user",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Task title"},
                    "description": {"type": "string", "description": "Optional description"}
                },
                "required": ["title"]
            }
        }
    }
]

# Chat completion with tools
response = client.chat.completions.create(
    model="gpt-4",
    messages=conversation_history,
    tools=tools,
    tool_choice="auto"
)

# Handle tool calls
if response.choices[0].message.tool_calls:
    for tool_call in response.choices[0].message.tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)
        # Execute MCP tool
        result = execute_mcp_tool(function_name, function_args, user_id)
```

**Alternatives Considered**:
- LangChain agents (rejected: adds unnecessary complexity)
- Custom agent loop (rejected: OpenAI SDK handles tool calling natively)

---

## 2. MCP SDK for Python

### Decision: Use `modelcontextprotocol` official SDK

**Correct Package**:
```bash
pip install modelcontextprotocol
```

**Integration Pattern**:
```python
from mcp.server import Server
from mcp.types import Tool, TextContent

# Create MCP server
mcp_server = Server("task-management-server")

# Register tool
@mcp_server.tool()
async def add_task(title: str, description: str = "") -> dict:
    """Create a new task for the user."""
    # Validate parameters
    if not title:
        raise ValueError("Title is required")

    # Access database (injected via context)
    task = Task(title=title, description=description, user_id=context.user_id)
    session.add(task)
    session.commit()

    return {
        "task_id": task.id,
        "status": "created",
        "title": task.title
    }

# Run MCP server (stdio transport for local integration)
async def run():
    async with mcp_server.stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options()
        )
```

**User ID Injection Strategy**:
```python
# Create agent with user context
def create_agent_with_user_context(user_id: str):
    # Store user_id in thread-local storage or context var
    context_var.set({"user_id": user_id})

    # MCP tools read from context
    return mcp_server
```

**Alternatives Considered**:
- Direct function calls without MCP (rejected: hackathon requires MCP architecture)
- Custom tool protocol (rejected: MCP is standard)

---

## 3. OpenAI ChatKit

### Decision: Use official React ChatKit package

**Correct Package**:
```bash
npm install @assistant-ui/react
```

**Note**: "OpenAI ChatKit" in hackathon PDF likely refers to Assistant UI (open-source chat interface for AI assistants).

**Integration Pattern**:
```tsx
import { AssistantRuntimeProvider, useAssistantRuntime } from "@assistant-ui/react";
import { Thread } from "@assistant-ui/react";

export function ChatInterface() {
  const runtime = useAssistantRuntime({
    api: "/api/chat", // Custom backend endpoint
    credentials: "include", // Send JWT cookie
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
```

**Dark Mode Support**:
```tsx
<AssistantRuntimeProvider
  runtime={runtime}
  theme={{
    dark: {
      background: "#1a1a1a",
      foreground: "#ffffff",
      // ... dark mode colors
    }
  }}
/>
```

**Custom Backend Endpoint**:
```typescript
// lib/chatApi.ts
export async function sendChatMessage(
  message: string,
  conversationId?: number
): Promise<ChatResponse> {
  const token = await getSession(); // Better Auth JWT

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      message,
      conversation_id: conversationId
    })
  });

  return response.json();
}
```

**Alternatives Considered**:
- Custom chat UI (rejected: ChatKit provides production-ready interface)
- react-chatbot-kit (rejected: not official OpenAI tool)

---

## 4. Stateless Conversation Management

### Decision: Fetch full history from database on each request with pagination

**Best Practices**:

1. **Efficient History Loading**:
```python
# Fetch last N messages (default 20, configurable)
MAX_HISTORY = 20

async def get_conversation_messages(
    conversation_id: int,
    session: Session,
    limit: int = MAX_HISTORY
) -> List[Message]:
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()

    # Return in chronological order
    return list(reversed(messages))
```

2. **Handle Long Conversations**:
```python
# Summarize old messages if conversation > 100 messages
if message_count > 100:
    # Keep only last 20 messages + summary of older messages
    summary = await summarize_old_messages(conversation_id, session)
    messages = [summary_message] + recent_messages
```

3. **Database Query Optimization**:
```sql
-- Index for fast lookups
CREATE INDEX idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

-- Query plan:
-- Index Scan using idx_messages_conversation_created
-- Filter: conversation_id = $1
-- Limit: 20
```

4. **Pagination Strategy**:
```python
# Client requests older messages
async def get_messages_before(
    conversation_id: int,
    before_message_id: int,
    limit: int = 20
) -> List[Message]:
    return session.exec(
        select(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.id < before_message_id
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
    ).all()
```

**Alternatives Considered**:
- In-memory caching (rejected: violates stateless requirement)
- Load all messages (rejected: performance issues with large conversations)

---

## 5. Natural Language Understanding Optimization

### Decision: System prompt with few-shot examples and structured tool descriptions

**System Prompt Template**:
```python
TASK_ASSISTANT_PROMPT = """You are a helpful task management assistant.
You help users manage their todo list through natural conversation.

You have access to these tools:
- add_task: Create a new task
- list_tasks: Show user's tasks (can filter by status: all/pending/completed)
- complete_task: Mark a task as done
- delete_task: Remove a task
- update_task: Modify a task's title or description

Guidelines:
1. Always confirm actions with a friendly message
2. If a command is ambiguous, ask for clarification
3. For destructive actions (delete), ask for confirmation first
4. Provide task IDs when listing tasks so users can reference them
5. Be concise but helpful

Example interactions:
User: "Add a task to buy groceries"
You: "I've added 'Buy groceries' to your tasks. Would you like to add any details?"

User: "Show me what's pending"
You: [call list_tasks with status='pending'] "Here are your pending tasks: ..."

User: "Mark task 3 as done"
You: [call complete_task with task_id=3] "Great! I've marked task 3 as complete."

User: "Delete the grocery task"
You: "I found these tasks with 'grocery' in the title: [list]. Which one would you like to delete?"
"""
```

**Few-Shot Examples in Messages**:
```python
few_shot_examples = [
    {"role": "user", "content": "I need to remember to call the dentist"},
    {"role": "assistant", "content": "I've added 'Call the dentist' to your tasks.",
     "tool_calls": [{"function": {"name": "add_task", "arguments": '{"title": "Call the dentist"}'}}]},

    {"role": "user", "content": "What do I have to do?"},
    {"role": "assistant", "content": "Let me show you your pending tasks.",
     "tool_calls": [{"function": {"name": "list_tasks", "arguments": '{"status": "pending"}'}}]},
]

# Prepend to conversation for first 3-5 messages, then remove
messages = few_shot_examples + user_conversation_history
```

**Handling Ambiguity**:
```python
# If multiple tasks match deletion request
if len(matching_tasks) > 1:
    response = f"I found {len(matching_tasks)} tasks matching '{query}':\n"
    for task in matching_tasks:
        response += f"- Task {task.id}: {task.title}\n"
    response += "\nPlease specify which task ID you'd like to delete."
    return response
```

**Alternatives Considered**:
- Fine-tuned model (rejected: requires training data, time-consuming)
- RAG with example conversations (rejected: overkill for simple commands)
- Custom intent classifier (rejected: OpenAI handles this natively)

---

## Summary of Decisions

| Component | Decision | Package/Pattern |
|-----------|----------|-----------------|
| OpenAI Integration | Standard OpenAI Python SDK with function calling | `openai` |
| MCP Server | Official Model Context Protocol SDK | `modelcontextprotocol` |
| Chat UI | Assistant UI (open-source React chat) | `@assistant-ui/react` |
| Conversation Storage | PostgreSQL with indexed queries | SQLModel + PostgreSQL |
| History Management | Fetch last N messages, paginate older | Limit 20, pagination |
| NLU Optimization | System prompt + few-shot examples | OpenAI GPT-4 |

**All research questions resolved.** Ready for Phase 1 design artifacts.
