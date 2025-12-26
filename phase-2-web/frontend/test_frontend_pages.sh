#!/bin/bash

# Frontend Page Loading Test
# Tests that all frontend pages load successfully

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "========================================"
echo "Frontend Page Loading Tests"
echo "========================================"
echo "Testing pages at: $BASE_URL"
echo ""

test_page() {
    local path="$1"
    local expected_status="${2:-200}"
    local name="$3"

    echo -n "Testing $name ($path)... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$path")

    if [ "$response" = "$expected_status" ]; then
        echo "✅ PASS (HTTP $response)"
        ((PASSED++))
    else
        echo "❌ FAIL (Expected $expected_status, got $response)"
        ((FAILED++))
    fi
}

# Test public pages
test_page "/" "200" "Homepage"
test_page "/login" "200" "Login Page"
test_page "/register" "200" "Register Page"

# Test protected pages (should redirect to login or load)
test_page "/tasks" "200" "Tasks Page"
test_page "/dashboard" "200" "Dashboard Page"
test_page "/kanban" "200" "Kanban Page"
test_page "/calendar" "200" "Calendar Page"

# Test API proxy
test_page "/api/auth/session" "200" "Auth API Endpoint"

echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed!"
    exit 0
else
    echo "⚠️  Some tests failed"
    exit 1
fi
