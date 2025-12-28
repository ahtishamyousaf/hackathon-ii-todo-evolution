"""
Playwright MCP Tools for browser automation.

Provides three MCP tools for web automation:
- navigate_to_url: Navigate browser to a URL and get page title
- take_screenshot: Capture screenshot of a webpage
- extract_page_text: Extract text content from a webpage

All tools enforce user isolation and include security validations.
"""

from typing import Dict, Any, Optional
from urllib.parse import urlparse
import os
from datetime import datetime
from sqlmodel import Session


async def validate_url(url: str) -> bool:
    """
    Validate URL before navigation for security.

    Blocks:
    - file:// URLs (local file access)
    - javascript: URLs (XSS)
    - data: URLs (data exfiltration)
    - localhost in production (only allow in development)

    Args:
        url: URL to validate

    Returns:
        True if URL is safe to navigate, False otherwise
    """
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


async def navigate_to_url(url: str, user_id: str, session: Session) -> Dict[str, Any]:
    """
    Navigate browser to a URL using Playwright.

    Args:
        url: URL to navigate to
        user_id: Authenticated user ID (injected from JWT)
        session: Database session (injected)

    Returns:
        Navigation result with status, URL, and page title

    Raises:
        ValueError: If URL is invalid or blocked for security
    """
    # Validate URL for security
    if not await validate_url(url):
        return {
            "status": "error",
            "message": f"URL '{url}' is not allowed for security reasons"
        }

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Navigate to URL
            await page.goto(url, timeout=10000)  # 10 second timeout

            # Get page title
            title = await page.title()

            await browser.close()

            return {
                "status": "success",
                "url": url,
                "title": title,
                "message": f"Navigated to '{title}'"
            }
    except ImportError:
        return {
            "status": "error",
            "message": "Playwright is not installed. Run: pip install playwright && playwright install chromium"
        }
    except Exception as e:
        return {
            "status": "error",
            "url": url,
            "message": f"Navigation failed: {str(e)}"
        }


async def take_screenshot(
    url: str,
    user_id: str,
    session: Session,
    full_page: bool = False
) -> Dict[str, Any]:
    """
    Take a screenshot of a URL.

    Args:
        url: URL to screenshot
        user_id: Authenticated user ID (injected from JWT)
        session: Database session (injected)
        full_page: If True, capture full page; if False, capture viewport only

    Returns:
        Screenshot result with status, path, and URL

    Raises:
        ValueError: If URL is invalid or blocked for security
    """
    # Validate URL for security
    if not await validate_url(url):
        return {
            "status": "error",
            "message": f"URL '{url}' is not allowed for security reasons"
        }

    try:
        from playwright.async_api import async_playwright

        # Create screenshots directory for this user
        screenshot_dir = f"screenshots/{user_id}"
        os.makedirs(screenshot_dir, exist_ok=True)

        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        screenshot_path = f"{screenshot_dir}/screenshot_{timestamp}.png"

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Navigate to URL
            await page.goto(url, timeout=10000)

            # Take screenshot
            await page.screenshot(path=screenshot_path, full_page=full_page)

            await browser.close()

            return {
                "status": "success",
                "path": screenshot_path,
                "url": url,
                "full_page": full_page,
                "message": f"Screenshot saved to {screenshot_path}"
            }
    except ImportError:
        return {
            "status": "error",
            "message": "Playwright is not installed. Run: pip install playwright && playwright install chromium"
        }
    except Exception as e:
        return {
            "status": "error",
            "url": url,
            "message": f"Screenshot failed: {str(e)}"
        }


async def extract_page_text(
    url: str,
    user_id: str,
    session: Session,
    selector: Optional[str] = None
) -> Dict[str, Any]:
    """
    Extract text content from a webpage.

    Args:
        url: URL to extract text from
        user_id: Authenticated user ID (injected from JWT)
        session: Database session (injected)
        selector: Optional CSS selector to extract text from specific element

    Returns:
        Extracted text with status, URL, text content, and length

    Raises:
        ValueError: If URL is invalid or blocked for security
    """
    # Validate URL for security
    if not await validate_url(url):
        return {
            "status": "error",
            "message": f"URL '{url}' is not allowed for security reasons"
        }

    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            # Navigate to URL
            await page.goto(url, timeout=10000)

            # Extract text
            if selector:
                # Extract from specific element
                element = page.locator(selector)
                text = await element.inner_text()
            else:
                # Extract all body text
                text = await page.inner_text("body")

            await browser.close()

            # Limit response size to prevent overwhelming the AI
            MAX_TEXT_LENGTH = 2000
            truncated = len(text) > MAX_TEXT_LENGTH
            display_text = text[:MAX_TEXT_LENGTH] if truncated else text

            return {
                "status": "success",
                "url": url,
                "selector": selector or "body",
                "text": display_text,
                "length": len(text),
                "truncated": truncated,
                "message": f"Extracted {len(text)} characters" + (" (truncated to 2000)" if truncated else "")
            }
    except ImportError:
        return {
            "status": "error",
            "message": "Playwright is not installed. Run: pip install playwright && playwright install chromium"
        }
    except Exception as e:
        return {
            "status": "error",
            "url": url,
            "message": f"Text extraction failed: {str(e)}"
        }


# Tool schemas for OpenAI function calling

NAVIGATE_TO_URL_SCHEMA = {
    "type": "function",
    "function": {
        "name": "navigate_to_url",
        "description": (
            "Navigate to a URL and get the page title. "
            "Use this when the user wants to visit a website or check if a page is loading. "
            "Examples: 'Go to google.com', 'Check if example.com is loading', 'Visit my tasks page'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "URL to navigate to (must start with http:// or https://)"
                }
            },
            "required": ["url"]
        }
    }
}

TAKE_SCREENSHOT_SCHEMA = {
    "type": "function",
    "function": {
        "name": "take_screenshot",
        "description": (
            "Take a screenshot of a webpage. "
            "Use this when the user wants to capture or save a visual of a page. "
            "Examples: 'Screenshot my tasks page', 'Take a picture of google.com', 'Capture the homepage'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "URL to screenshot (must start with http:// or https://)"
                },
                "full_page": {
                    "type": "boolean",
                    "description": "If true, capture the full page; if false, capture only the visible viewport",
                    "default": False
                }
            },
            "required": ["url"]
        }
    }
}

EXTRACT_PAGE_TEXT_SCHEMA = {
    "type": "function",
    "function": {
        "name": "extract_page_text",
        "description": (
            "Extract text content from a webpage. "
            "Use this when the user wants to read or get information from a page. "
            "Examples: 'What does google.com say?', 'Extract the title from example.com', 'Read the content of the homepage'"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "description": "URL to extract text from (must start with http:// or https://)"
                },
                "selector": {
                    "type": "string",
                    "description": "Optional CSS selector to extract text from a specific element (e.g., 'h1', '.title', '#content')"
                }
            },
            "required": ["url"]
        }
    }
}
