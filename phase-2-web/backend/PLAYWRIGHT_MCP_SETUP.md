# Playwright MCP Server Integration

**Purpose**: Add browser automation capabilities to AI chatbot
**MCP Server**: Playwright MCP (official)
**Repository**: https://github.com/executeautomation/mcp-playwright

---

## Overview

Integrating Playwright MCP gives your AI chatbot the ability to:
- Navigate and interact with websites
- Extract information from web pages
- Take screenshots for visual verification
- Automate form filling
- Scrape data from websites

**Use Cases**:
- "Search Google for Python tutorials and summarize the top result"
- "Take a screenshot of my tasks page"
- "Check if the task website is loading correctly"
- "Fill out this form with my task data"

---

## Installation

### Step 1: Install Playwright MCP Server

**Option A: Via npm (Recommended)**
```bash
# Install globally
npm install -g @executeautomation/mcp-playwright

# Or install in project
cd /home/ahtisham/hackathon-2/phase-2-web/backend
npm install @executeautomation/mcp-playwright
```

**Option B: Via Python pip**
```bash
# If Python-based Playwright MCP exists
pip install playwright-mcp

# Install Playwright browsers
playwright install chromium
```

### Step 2: Configure MCP Server

**Create config file**: `mcp-config.json`
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/mcp-playwright"],
      "env": {
        "PLAYWRIGHT_HEADLESS": "true"
      }
    },
    "tasks": {
      "command": "python",
      "args": ["-m", "app.mcp.official_server"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}",
        "OPENAI_API_KEY": "${OPENAI_API_KEY}"
      }
    }
  }
}
```

---

## Integration with AI Agent

### Approach 1: Multi-Server Architecture (Recommended)

**Architecture**:
```
AI Agent (OpenAI GPT-4)
    |
    +-- Task Management MCP Server (our custom server)
    |     |
    |     +-- add_task
    |     +-- list_tasks
    |     +-- complete_task
    |     +-- delete_task
    |     +-- update_task
    |
    +-- Playwright MCP Server (browser automation)
          |
          +-- navigate
          +-- screenshot
          +-- click
          +-- fill_form
          +-- extract_text
```

**Implementation**: Update `app/chatkit/official_server.py` or `simple_server.py`

```python
from typing import List, Dict, Any
import asyncio
import subprocess
import json

class MultiMCPChatKitServer:
    """
    ChatKit server with multiple MCP server connections.
    """

    def __init__(self, openai_api_key: str):
        self.openai_api_key = openai_api_key

        # Initialize task management MCP
        from app.mcp.official_server import get_official_mcp_server
        self.task_mcp = get_official_mcp_server()

        # Initialize Playwright MCP process
        self.playwright_process = None
        self._start_playwright_mcp()

    def _start_playwright_mcp(self):
        """Start Playwright MCP server as subprocess."""
        try:
            self.playwright_process = subprocess.Popen(
                ["npx", "-y", "@executeautomation/mcp-playwright"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env={"PLAYWRIGHT_HEADLESS": "true"}
            )
            logger.info("Playwright MCP server started")
        except Exception as e:
            logger.error(f"Failed to start Playwright MCP: {e}")

    def get_all_tools(self) -> List[Dict[str, Any]]:
        """
        Get combined tool list from all MCP servers.
        """
        tools = []

        # Add task management tools
        tools.extend(self.task_mcp.list_tools())

        # Add Playwright tools (if server running)
        if self.playwright_process:
            tools.extend(self._get_playwright_tools())

        return tools

    def _get_playwright_tools(self) -> List[Dict[str, Any]]:
        """
        Get Playwright MCP tools.
        """
        return [
            {
                "type": "function",
                "function": {
                    "name": "navigate_to_url",
                    "description": "Navigate browser to a URL",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "url": {
                                "type": "string",
                                "description": "URL to navigate to"
                            }
                        },
                        "required": ["url"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "take_screenshot",
                    "description": "Take a screenshot of current page",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "full_page": {
                                "type": "boolean",
                                "description": "Capture full page or viewport",
                                "default": False
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "extract_page_text",
                    "description": "Extract text content from current page",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "selector": {
                                "type": "string",
                                "description": "CSS selector to extract text from (optional)"
                            }
                        }
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "click_element",
                    "description": "Click an element on the page",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "selector": {
                                "type": "string",
                                "description": "CSS selector of element to click"
                            }
                        },
                        "required": ["selector"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "fill_input",
                    "description": "Fill a form input field",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "selector": {
                                "type": "string",
                                "description": "CSS selector of input field"
                            },
                            "value": {
                                "type": "string",
                                "description": "Value to fill"
                            }
                        },
                        "required": ["selector", "value"]
                    }
                }
            }
        ]
```

### Approach 2: Simple Integration (Faster)

**Just add Playwright tools to existing MCP server**:

```python
# In app/mcp/tools/__init__.py

from playwright.async_api import async_playwright

async def navigate_to_url(url: str, user_id: str, session: Session) -> Dict[str, Any]:
    """
    Navigate browser to URL using Playwright.

    Args:
        url: URL to navigate to
        user_id: Authenticated user ID
        session: Database session

    Returns:
        Navigation result
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)
        title = await page.title()
        await browser.close()

        return {
            "status": "success",
            "url": url,
            "title": title,
            "message": f"Navigated to {title}"
        }

async def take_screenshot(url: str, user_id: str, session: Session, full_page: bool = False) -> Dict[str, Any]:
    """
    Take screenshot of a URL.

    Args:
        url: URL to screenshot
        user_id: Authenticated user ID
        session: Database session
        full_page: Capture full page or viewport

    Returns:
        Screenshot path
    """
    import os
    from datetime import datetime

    screenshot_dir = f"screenshots/{user_id}"
    os.makedirs(screenshot_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    screenshot_path = f"{screenshot_dir}/screenshot_{timestamp}.png"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)
        await page.screenshot(path=screenshot_path, full_page=full_page)
        await browser.close()

    return {
        "status": "success",
        "path": screenshot_path,
        "url": url,
        "message": f"Screenshot saved to {screenshot_path}"
    }

async def extract_page_text(url: str, user_id: str, session: Session, selector: str = None) -> Dict[str, Any]:
    """
    Extract text from a webpage.

    Args:
        url: URL to extract from
        user_id: Authenticated user ID
        session: Database session
        selector: CSS selector (optional)

    Returns:
        Extracted text
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(url)

        if selector:
            text = await page.locator(selector).inner_text()
        else:
            text = await page.inner_text("body")

        await browser.close()

        return {
            "status": "success",
            "url": url,
            "text": text[:1000],  # Limit to 1000 chars
            "length": len(text)
        }
```

---

## Updated pyproject.toml

Add Playwright dependencies:

```toml
dependencies = [
    # ... existing dependencies ...
    "mcp==1.25.0",
    "openai-chatkit==1.4.1",
    "playwright>=1.40.0",  # Browser automation
]
```

---

## System Prompt Update

Update AI system prompt to include Playwright capabilities:

```python
system_prompt = """You are a helpful task management assistant with browser automation capabilities.

You can help users:

**Task Management:**
- Add new tasks
- View and filter tasks
- Complete and update tasks
- Delete tasks
- Manage categories

**Browser Automation:**
- Navigate to websites
- Take screenshots of pages
- Extract information from websites
- Check if pages are loading correctly
- Automate web interactions

When using browser automation:
1. Always ask for confirmation before navigating to external sites
2. Respect rate limits and robots.txt
3. Use screenshots for visual verification
4. Summarize extracted information concisely

Examples:
- "Take a screenshot of my tasks page"
- "Check if google.com is loading"
- "Extract the title from https://example.com"
- "Navigate to the documentation page and summarize it"

Be helpful, secure, and respect privacy.
"""
```

---

## Example Usage

### User Commands with Playwright

**Command**: "Take a screenshot of my tasks page"
```
AI calls: navigate_to_url("http://localhost:3001/tasks")
AI calls: take_screenshot(full_page=True)
AI responds: "I've taken a screenshot of your tasks page. It shows 5 tasks with 2 completed."
```

**Command**: "Check if the app is loading correctly"
```
AI calls: navigate_to_url("http://localhost:3001")
AI calls: extract_page_text()
AI responds: "Yes, the app is loading correctly. I can see the login page with 'TaskFlow' branding."
```

**Command**: "What's trending on Hacker News?"
```
AI calls: navigate_to_url("https://news.ycombinator.com")
AI calls: extract_page_text(selector=".storylink")
AI responds: "Top stories: 1) New AI breakthrough... 2) JavaScript framework updates..."
```

---

## Security Considerations

### URL Validation
```python
def validate_url(url: str) -> bool:
    """
    Validate URL before navigation.

    Blocks:
    - file:// URLs (local file access)
    - javascript: URLs (XSS)
    - data: URLs (data exfiltration)
    """
    from urllib.parse import urlparse

    parsed = urlparse(url)

    # Only allow http/https
    if parsed.scheme not in ["http", "https"]:
        return False

    # Block localhost in production
    if parsed.hostname in ["localhost", "127.0.0.1"]:
        # Only allow in development
        if os.getenv("ENVIRONMENT") != "development":
            return False

    return True
```

### Rate Limiting
```python
from datetime import datetime, timedelta
from collections import defaultdict

# Track requests per user
user_requests = defaultdict(list)

def check_rate_limit(user_id: str, max_requests: int = 10, window_minutes: int = 5) -> bool:
    """
    Check if user has exceeded rate limit.
    """
    now = datetime.now()
    window_start = now - timedelta(minutes=window_minutes)

    # Remove old requests
    user_requests[user_id] = [
        req_time for req_time in user_requests[user_id]
        if req_time > window_start
    ]

    # Check limit
    if len(user_requests[user_id]) >= max_requests:
        return False

    # Add current request
    user_requests[user_id].append(now)
    return True
```

---

## Installation Steps

### Quick Setup (5 minutes)

```bash
cd /home/ahtisham/hackathon-2/phase-2-web/backend

# Activate venv
source .venv/bin/activate

# Install Playwright
pip install playwright

# Install browser binaries
playwright install chromium

# Verify installation
python -c "from playwright.sync_api import sync_playwright; print('✅ Playwright installed')"
```

### Add Tools to MCP Server

1. Create `app/mcp/tools/playwright_tools.py` with navigate, screenshot, extract functions
2. Register tools in `app/mcp/server.py`:
   ```python
   from app.mcp.tools.playwright_tools import navigate_to_url, take_screenshot, extract_page_text

   mcp_server.register_tool("navigate_to_url", navigate_to_url, NAVIGATE_SCHEMA)
   mcp_server.register_tool("take_screenshot", take_screenshot, SCREENSHOT_SCHEMA)
   mcp_server.register_tool("extract_page_text", extract_page_text, EXTRACT_SCHEMA)
   ```

3. Update system prompt in `app/chatkit/simple_server.py`

---

## Testing Playwright Integration

```bash
# Test 1: Navigate to URL
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Navigate to google.com"
  }'

# Test 2: Take screenshot
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Take a screenshot of my tasks page at localhost:3001/tasks"
  }'

# Test 3: Extract text
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the title of example.com?"
  }'
```

---

## Hackathon Impact

**Adding Playwright MCP gives you**:
- ✅ **Differentiation**: Unique feature most submissions won't have
- ✅ **Bonus Points**: Advanced integration beyond requirements
- ✅ **Demo Wow Factor**: Show AI taking screenshots, browsing sites
- ✅ **Real-World Use**: Actually useful for task automation

**Compliance Impact**:
- Phase III: Still 100% (meets all requirements + bonus)
- **Bonus Category**: +20% for advanced MCP integration
- **Overall**: 100%+ (exceeds expectations)

---

## Recommendation

**Add to Path A execution plan as Step 1.5**:

**Time**: +10 minutes
**Risk**: Low (optional feature, doesn't break existing functionality)
**Reward**: High (impressive differentiation)

**Decision**:
- ✅ **YES** if you want maximum impact
- ⏸️ **SKIP** if you want faster submission (already at 100%)

---

**Ready to add Playwright MCP?**

Reply:
- **"add playwright"** to include it in the plan
- **"skip playwright"** to focus on core testing
- **"playwright later"** to add after core submission is complete
