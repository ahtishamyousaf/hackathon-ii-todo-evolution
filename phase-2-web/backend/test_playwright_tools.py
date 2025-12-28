#!/usr/bin/env python3
"""
Smoke test for Playwright MCP tools.

Tests the 3 browser automation tools to verify they work correctly.
"""
import asyncio
import sys
from app.mcp.tools.playwright_tools import (
    navigate_to_url,
    take_screenshot,
    extract_page_text,
)


async def test_navigate_to_url():
    """Test navigate_to_url tool."""
    print("🧪 Testing navigate_to_url...")
    result = await navigate_to_url(
        url="https://example.com",
        user_id="test_user_smoke",
        session=None  # Not using database for smoke test
    )

    if result["status"] == "success":
        print(f"✅ navigate_to_url: {result['message']}")
        print(f"   Title: {result['title']}")
        return True
    else:
        print(f"❌ navigate_to_url failed: {result['message']}")
        return False


async def test_take_screenshot():
    """Test take_screenshot tool."""
    print("\n🧪 Testing take_screenshot...")
    result = await take_screenshot(
        url="https://example.com",
        user_id="test_user_smoke",
        session=None,
        full_page=False
    )

    if result["status"] == "success":
        print(f"✅ take_screenshot: {result['message']}")
        print(f"   Saved to: {result['path']}")
        return True
    else:
        print(f"❌ take_screenshot failed: {result['message']}")
        return False


async def test_extract_page_text():
    """Test extract_page_text tool."""
    print("\n🧪 Testing extract_page_text...")
    result = await extract_page_text(
        url="https://example.com",
        user_id="test_user_smoke",
        session=None,
        selector=None
    )

    if result["status"] == "success":
        print(f"✅ extract_page_text: {result['message']}")
        print(f"   Text length: {result['length']} characters")
        print(f"   Preview: {result['text'][:100]}...")
        return True
    else:
        print(f"❌ extract_page_text failed: {result['message']}")
        return False


async def main():
    """Run all smoke tests."""
    print("=" * 60)
    print("Playwright MCP Tools - Smoke Test")
    print("=" * 60)

    results = []

    # Test 1: Navigate
    results.append(await test_navigate_to_url())

    # Test 2: Screenshot
    results.append(await test_take_screenshot())

    # Test 3: Extract text
    results.append(await test_extract_page_text())

    # Summary
    print("\n" + "=" * 60)
    print("Test Results")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")

    if passed == total:
        print("\n🎉 All Playwright tools working correctly!")
        return 0
    else:
        print("\n⚠️  Some Playwright tools failed!")
        return 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
