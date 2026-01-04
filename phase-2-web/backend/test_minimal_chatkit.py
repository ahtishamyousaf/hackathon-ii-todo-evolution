"""
ABSOLUTE MINIMAL ChatKit Test

This bypasses everything:
- No database
- No MCP
- No Agents SDK
- Just hardcoded events

Tests if ChatKit UI can display ANYTHING AT ALL.
"""

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/chatkit")
async def minimal_chatkit():
    """Minimal ChatKit endpoint - just return hardcoded events."""

    async def generate():
        """Generate minimal event sequence."""

        # Event 1: thread.item.added
        yield f'data: {json.dumps({"type": "thread.item.added", "item": {"id": "msg_1", "type": "message", "role": "assistant", "content": []}})}\n\n'

        await asyncio.sleep(0.1)

        # Event 2: content delta
        yield f'data: {json.dumps({"type": "assistant_message.content_part.text_delta", "content_index": 0, "delta": "Hello! This is a MINIMAL test. If you see this, ChatKit is working!"})}\n\n'

        await asyncio.sleep(0.1)

        # Event 3: content done
        yield f'data: {json.dumps({"type": "assistant_message.content_part.done", "content_index": 0})}\n\n'

        await asyncio.sleep(0.1)

        # Event 4: item done
        yield f'data: {json.dumps({"type": "thread.item.done", "item_id": "msg_1"})}\n\n'

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting MINIMAL ChatKit test server on port 9000")
    print("This bypasses ALL complexity - just tests if ChatKit UI works")
    uvicorn.run(app, host="0.0.0.0", port=9000)
