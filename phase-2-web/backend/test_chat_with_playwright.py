#!/usr/bin/env python3
"""
Test the chat interface using Playwright to automate browser interaction.

This script:
1. Navigates to the chat page
2. Logs in if needed
3. Sends a test message
4. Captures the response
5. Takes a screenshot
"""
import asyncio
from playwright.async_api import async_playwright


async def test_chat_interface():
    """Test the AI chat interface."""
    print("=" * 70)
    print("Chat Interface Test - Using Playwright")
    print("=" * 70)

    async with async_playwright() as p:
        # Launch browser
        print("\n🌐 Launching browser...")
        browser = await p.chromium.launch(headless=False)  # headless=False to see it work
        context = await browser.new_context()
        page = await context.new_page()

        try:
            # Navigate to chat page
            print("📍 Navigating to http://localhost:3001/chat...")
            await page.goto("http://localhost:3001/chat", wait_until="networkidle")
            await page.wait_for_timeout(2000)  # Wait 2 seconds for page to settle

            # Take screenshot of initial state
            print("📸 Taking screenshot of chat page...")
            await page.screenshot(path="screenshots/chat_test_initial.png")
            print("   Saved: screenshots/chat_test_initial.png")

            # Check if we need to login
            print("\n🔐 Checking authentication status...")
            login_form = await page.query_selector('input[type="email"]')

            if login_form:
                print("   ⚠️  Not logged in - need to authenticate first")
                print("   Navigating to login page...")
                await page.goto("http://localhost:3001/login", wait_until="networkidle")

                # Login
                print("   Filling login form...")
                await page.fill('input[type="email"]', 'test_mcp@example.com')
                await page.fill('input[type="password"]', 'test_password_12345')

                print("   Submitting login...")
                await page.click('button[type="submit"]')

                # Wait for navigation after login (Better Auth redirects after successful login)
                print("   Waiting for login to complete...")
                await page.wait_for_timeout(5000)  # Wait longer for session to be established

                # Check if we're logged in by looking for session
                await page.goto("http://localhost:3001/api/auth/get-session")
                await page.wait_for_timeout(1000)

                # Navigate back to chat
                print("   Returning to chat page...")
                await page.goto("http://localhost:3001/chat", wait_until="networkidle")
                await page.wait_for_timeout(3000)  # Wait for React to render
            else:
                print("   ✅ Already authenticated")

            # Find the chat input
            print("\n💬 Looking for chat input field...")

            # Try multiple selectors (based on ChatInterface.tsx line 487-504)
            chat_input = None
            selectors = [
                'input[type="text"][placeholder*="Type a message"]',
                'input[placeholder*="Type a message"]',
                'input[type="text"]',
                'textarea[placeholder*="message"]',
                'input[placeholder*="message"]'
            ]

            for selector in selectors:
                chat_input = await page.query_selector(selector)
                if chat_input:
                    print(f"   ✅ Found input using selector: {selector}")
                    break

            if not chat_input:
                print("   ❌ Could not find chat input field!")
                print("   Page content preview:")
                content = await page.content()
                print(content[:500])
                await page.screenshot(path="screenshots/chat_test_no_input.png")
                return

            # Type the message
            test_message = "Show me all my tasks"
            print(f"\n⌨️  Typing message: '{test_message}'")
            await chat_input.fill(test_message)
            await page.wait_for_timeout(500)

            # Find and click send button (based on ChatInterface.tsx line 505-528)
            print("🔍 Looking for send button...")
            send_button = None
            button_selectors = [
                'button:has-text("Send")',
                'button:has-text("Sending")',
                'button[type="submit"]',
                'button[aria-label*="send"]'
            ]

            for selector in button_selectors:
                send_button = await page.query_selector(selector)
                if send_button:
                    print(f"   ✅ Found button using selector: {selector}")
                    break

            if not send_button:
                print("   ⚠️  No send button found, trying Enter key...")
                await chat_input.press("Enter")
            else:
                print("   Clicking send button...")
                await send_button.click()

            # Wait for response
            print("\n⏳ Waiting for AI response (10 seconds)...")
            await page.wait_for_timeout(10000)

            # Take screenshot of response
            print("📸 Taking screenshot of chat with response...")
            await page.screenshot(path="screenshots/chat_test_response.png", full_page=True)
            print("   Saved: screenshots/chat_test_response.png")

            # Try to extract the response text
            print("\n📝 Extracting response text...")
            response_selectors = [
                '.message-assistant',
                '.assistant-message',
                '[data-role="assistant"]',
                '.bg-blue-50',  # Common assistant message styling
            ]

            for selector in response_selectors:
                responses = await page.query_selector_all(selector)
                if responses:
                    last_response = responses[-1]
                    response_text = await last_response.inner_text()
                    print(f"\n💬 AI Response:")
                    print(f"   {response_text}")
                    break

            # Get all text content
            print("\n📄 Full page text content:")
            all_text = await page.inner_text('body')
            print(all_text[-500:])  # Last 500 characters

            print("\n✅ Test completed successfully!")
            print(f"   Screenshots saved in screenshots/ directory")

        except Exception as e:
            print(f"\n❌ Error during test: {e}")
            await page.screenshot(path="screenshots/chat_test_error.png")
            raise

        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(test_chat_interface())
