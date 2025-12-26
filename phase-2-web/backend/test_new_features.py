#!/usr/bin/env python3
"""
Comprehensive Test Suite for New Features

Tests:
1. Time Tracking (start/stop timer, manual entry)
2. Task Templates (create, list, create task from template)
3. Real-time Notifications (create, list, mark as read)
4. Email Notifications (email service availability)
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api"

tests_passed = 0
tests_failed = 0
test_results = []

def log_test(test_name, passed, message=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"

    result = f"{status}: {test_name}"
    if message:
        result += f" - {message}"
    test_results.append(result)
    print(result)

# Setup: Create test user and login
print("=" * 70)
print("TESTING NEW FEATURES (Phase III)")
print("=" * 70)

# Register and login
email = f"test_features_{datetime.now().timestamp()}@example.com"
password = "TestPassword123"

response = requests.post(f"{API_URL}/auth/register", json={"email": email, "password": password})
log_test("Register Test User", response.status_code == 201, f"Status: {response.status_code}")

response = requests.post(f"{API_URL}/auth/login", json={"email": email, "password": password})
log_test("Login Test User", response.status_code == 200, f"Status: {response.status_code}")

if response.status_code == 200:
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
else:
    print("❌ CRITICAL: Authentication failed. Cannot continue tests.")
    exit(1)

# Create a test task for our tests
response = requests.post(
    f"{API_URL}/tasks",
    headers=headers,
    json={"title": "Test Task for New Features", "description": "Testing time tracking, templates, etc."}
)
log_test("Create Test Task", response.status_code == 201, f"Status: {response.status_code}")

task_id = response.json().get("id") if response.status_code == 201 else None

print("\n" + "=" * 70)
print("1. TIME TRACKING TESTS")
print("=" * 70)

# Test 1.1: Start Timer
if task_id:
    response = requests.post(
        f"{API_URL}/time-entries/start",
        headers=headers,
        json={"task_id": task_id, "description": "Testing timer functionality"}
    )
    log_test("Start Timer", response.status_code == 201, f"Status: {response.status_code}")

    timer_entry_id = response.json().get("id") if response.status_code == 201 else None

    if timer_entry_id:
        # Verify timer is running
        is_running = response.json().get("is_running", False)
        log_test("Timer Is Running", is_running == True, f"is_running: {is_running}")

        # Test 1.2: Get Running Timer
        response = requests.get(f"{API_URL}/time-entries/running", headers=headers)
        log_test("Get Running Timer", response.status_code == 200, f"Status: {response.status_code}")

        if response.status_code == 200:
            running_timer = response.json()
            log_test("Running Timer Matches", running_timer.get("id") == timer_entry_id,
                    f"Expected {timer_entry_id}, got {running_timer.get('id')}")

        # Test 1.3: Stop Timer
        import time
        time.sleep(2)  # Let timer run for 2 seconds

        response = requests.post(f"{API_URL}/time-entries/stop/{timer_entry_id}", headers=headers)
        log_test("Stop Timer", response.status_code == 200, f"Status: {response.status_code}")

        if response.status_code == 200:
            stopped_timer = response.json()
            duration = stopped_timer.get("duration")
            log_test("Timer Has Duration", duration is not None and duration >= 2,
                    f"Duration: {duration} seconds")
            log_test("Timer Stopped", stopped_timer.get("is_running") == False,
                    f"is_running: {stopped_timer.get('is_running')}")

# Test 1.4: Manual Time Entry
if task_id:
    start_time = datetime.now() - timedelta(hours=2)
    end_time = datetime.now() - timedelta(hours=1)

    response = requests.post(
        f"{API_URL}/time-entries/manual",
        headers=headers,
        json={
            "task_id": task_id,
            "start_time": start_time.isoformat() + "Z",
            "end_time": end_time.isoformat() + "Z",
            "description": "Manual entry test"
        }
    )
    log_test("Add Manual Time Entry", response.status_code == 201, f"Status: {response.status_code}")

    if response.status_code == 201:
        manual_entry = response.json()
        log_test("Manual Entry Has Duration", manual_entry.get("duration") == 3600,
                f"Expected 3600s (1 hour), got {manual_entry.get('duration')}s")
        log_test("Manual Entry Flag Set", manual_entry.get("is_manual") == True,
                f"is_manual: {manual_entry.get('is_manual')}")

# Test 1.5: List Time Entries
if task_id:
    response = requests.get(f"{API_URL}/time-entries/task/{task_id}", headers=headers)
    log_test("List Task Time Entries", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        entries = response.json()
        log_test("Time Entries Count", len(entries) >= 2, f"Expected >=2, got {len(entries)}")

print("\n" + "=" * 70)
print("2. TASK TEMPLATE TESTS")
print("=" * 70)

# Test 2.1: Create Template
template_data = {
    "name": "Daily Standup Template",
    "description": "Template for daily standup tasks",
    "template_data": {
        "title": "Daily Standup",
        "description": "Prepare and attend daily standup meeting",
        "priority": "high"
    }
}

response = requests.post(f"{API_URL}/templates/", headers=headers, json=template_data)
log_test("Create Template", response.status_code == 201, f"Status: {response.status_code}")

template_id = response.json().get("id") if response.status_code == 201 else None

# Test 2.2: List Templates
response = requests.get(f"{API_URL}/templates/", headers=headers)
log_test("List Templates", response.status_code == 200, f"Status: {response.status_code}")

if response.status_code == 200:
    templates = response.json()
    log_test("Template Exists in List", len(templates) >= 1, f"Found {len(templates)} templates")

# Test 2.3: Get Specific Template
if template_id:
    response = requests.get(f"{API_URL}/templates/{template_id}", headers=headers)
    log_test("Get Template by ID", response.status_code == 200, f"Status: {response.status_code}")

    if response.status_code == 200:
        template = response.json()
        log_test("Template Name Matches", template.get("name") == "Daily Standup Template",
                f"Name: {template.get('name')}")

# Test 2.4: Create Task from Template
if template_id:
    response = requests.post(f"{API_URL}/templates/{template_id}/create-task", headers=headers)
    log_test("Create Task from Template", response.status_code == 201, f"Status: {response.status_code}")

    if response.status_code == 201:
        new_task = response.json()
        log_test("Task Created with Template Data", new_task.get("title") == "Daily Standup",
                f"Title: {new_task.get('title')}")
        log_test("Task Has Template Priority", new_task.get("priority") == "high",
                f"Priority: {new_task.get('priority')}")

# Test 2.5: Update Template
if template_id:
    response = requests.put(
        f"{API_URL}/templates/{template_id}",
        headers=headers,
        json={"name": "Updated Template Name"}
    )
    log_test("Update Template", response.status_code == 200, f"Status: {response.status_code}")

# Test 2.6: Delete Template
if template_id:
    response = requests.delete(f"{API_URL}/templates/{template_id}", headers=headers)
    log_test("Delete Template", response.status_code == 204, f"Status: {response.status_code}")

print("\n" + "=" * 70)
print("3. NOTIFICATION TESTS")
print("=" * 70)

# Test 3.1: Get Notifications (should be empty for new user)
response = requests.get(f"{API_URL}/notifications/", headers=headers)
log_test("Get Notifications", response.status_code == 200, f"Status: {response.status_code}")

if response.status_code == 200:
    notifications = response.json()
    log_test("Initial Notifications Empty", len(notifications) == 0, f"Found {len(notifications)} notifications")

# Note: We can't easily test WebSocket and notification creation without triggering events
# But we can test the API endpoints are accessible
response = requests.get(f"{API_URL}/notifications/?unread_only=true", headers=headers)
log_test("Get Unread Notifications", response.status_code == 200, f"Status: {response.status_code}")

print("\n" + "=" * 70)
print("4. EMAIL NOTIFICATION SERVICE TEST")
print("=" * 70)

# Test email service existence (can't send actual emails without SMTP config)
try:
    from app.services.email_service import email_service
    log_test("Email Service Importable", True, "EmailService class exists")
    log_test("Email Service Has Send Method", hasattr(email_service, 'send_email'),
            "send_email method exists")
    log_test("Email Service Has Templates", hasattr(email_service, 'send_task_due_reminder'),
            "Email templates available")
except Exception as e:
    log_test("Email Service Check", False, f"Error: {str(e)}")

print("\n" + "=" * 70)
print("5. INTEGRATION TESTS")
print("=" * 70)

# Test 5.1: Time Tracking + Templates Integration
# Create a template, create task from it, start timer on it
template_data2 = {
    "name": "Timed Task Template",
    "description": "Template for tasks that need time tracking",
    "template_data": {
        "title": "Timed Task",
        "priority": "medium"
    }
}

response = requests.post(f"{API_URL}/templates/", headers=headers, json=template_data2)
if response.status_code == 201:
    temp_id = response.json().get("id")

    # Create task from template
    response = requests.post(f"{API_URL}/templates/{temp_id}/create-task", headers=headers)
    if response.status_code == 201:
        timed_task_id = response.json().get("id")

        # Start timer on the task
        response = requests.post(
            f"{API_URL}/time-entries/start",
            headers=headers,
            json={"task_id": timed_task_id}
        )
        log_test("Template + Time Tracking Integration", response.status_code == 201,
                "Created task from template and started timer")

        if response.status_code == 201:
            # Stop the timer
            entry_id = response.json().get("id")
            import time
            time.sleep(1)
            requests.post(f"{API_URL}/time-entries/stop/{entry_id}", headers=headers)

print("\n" + "=" * 70)
print("TEST SUMMARY")
print("=" * 70)
print(f"Tests Passed: {tests_passed}")
print(f"Tests Failed: {tests_failed}")
print(f"Total Tests: {tests_passed + tests_failed}")
print(f"Success Rate: {(tests_passed/(tests_passed+tests_failed)*100):.1f}%")

print("\nDetailed Results:")
for result in test_results:
    print(f"  {result}")

print("\n" + "=" * 70)
if tests_failed == 0:
    print("🎉 ALL TESTS PASSED!")
else:
    print(f"⚠️  {tests_failed} test(s) failed. Review above for details.")
print("=" * 70)
