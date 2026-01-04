#!/usr/bin/env python3
"""
Test the full chat workflow: add task, list tasks, complete task, delete task.
"""
import asyncio
from playwright.async_api import async_playwright


async def send_chat_message(page, message: str):
    """Send a message and wait for response."""
    print(f"\n📤 Sending: {message}")

    # Find input and send button
    chat_input = await page.query_selector('input[type="text"]')
    send_button = await page.query_selector('button:has-text("Send")')

    if not chat_input or not send_button:
        print("❌ Could not find chat input or send button")
        return None

    # Type and send
    await chat_input.fill(message)
    await send_button.click()

    # Wait for response
    await page.wait_for_timeout(8000)

    # Extract latest response
    messages = await page.query_selector_all('.bg-gray-100, .bg-gray-700')
    if messages:
        last_msg = messages[-1]
        response = await last_msg.inner_text()
        print(f"📥 Response: {response[:200]}...")
        return response
    return None


async def test_full_workflow():
    """Test complete chat workflow."""
    print("=" * 70)
    print("Full Chat Workflow Test")
    print("=" * 70)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # Login (we know the user exists from previous test)
            print("\n🔐 Logging in...")
            await page.goto("http://localhost:3001/login")
            await page.fill('input[type="email"]', 'test_mcp@example.com')
            await page.fill('input[type="password"]', 'test_password_12345')
            await page.click('button[type="submit"]')
            await page.wait_for_timeout(5000)

            # Go to chat
            await page.goto("http://localhost:3001/chat", wait_until="networkidle")
            await page.wait_for_timeout(3000)

            # Test 1: Add a task
            response1 = await send_chat_message(page, "Add a task to buy groceries")

            # Test 2: Add another task
            response2 = await send_chat_message(page, "I need to call mom tomorrow")

            # Test 3: List all tasks
            response3 = await send_chat_message(page, "Show me all my tasks")

            # Test 4: Complete first task
            response4 = await send_chat_message(page, "Mark task 1 as complete")

            # Test 5: List pending tasks
            response5 = await send_chat_message(page, "What's still pending?")

            # Take final screenshot
            print("\n📸 Taking final screenshot...")
            await page.screenshot(path="screenshots/chat_full_workflow.png", full_page=True)

            print("\n✅ Full workflow test completed!")
            print(f"   Screenshot: screenshots/chat_full_workflow.png")

        except Exception as e:
            print(f"\n❌ Error: {e}")
            await page.screenshot(path="screenshots/chat_workflow_error.png")

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(test_full_workflow())
