#!/usr/bin/env python3
"""
Create test user through Better Auth registration endpoint.

This ensures the user exists in Better Auth's users table, not just the database directly.
"""
import requests
import json


def create_test_user_via_api():
    """Register test user through Better Auth API."""
    print("=" * 70)
    print("Creating Test User via Better Auth Registration")
    print("=" * 70)

    # Better Auth registration endpoint
    url = "http://localhost:3001/api/auth/sign-up/email"

    # Test user credentials
    payload = {
        "email": "test_mcp@example.com",
        "password": "test_password_12345",
        "name": "Test MCP User"
    }

    headers = {
        "Content-Type": "application/json"
    }

    print(f"\n📧 Registering user: {payload['email']}")
    print(f"🔗 Endpoint: {url}")

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)

        print(f"\n📊 Response Status: {response.status_code}")

        if response.status_code == 201 or response.status_code == 200:
            print("✅ User created successfully!")
            try:
                data = response.json()
                print(f"   User ID: {data.get('user', {}).get('id', 'N/A')}")
                print(f"   Email: {data.get('user', {}).get('email', 'N/A')}")
            except:
                print("   (Response not JSON, but registration succeeded)")
            return True

        elif response.status_code == 409 or response.status_code == 400:
            # User already exists
            print("ℹ️  User already exists")
            try:
                data = response.json()
                print(f"   Message: {data.get('message', 'User already registered')}")
            except:
                print("   (User likely already registered)")
            return True

        else:
            print(f"❌ Failed to create user")
            print(f"   Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Error: Frontend is not running!")
        print("   Please start the frontend server:")
        print("   cd phase-2-web/frontend && npm run dev")
        return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    success = create_test_user_via_api()

    if success:
        print("\n✅ Test user is ready for authentication!")
        print("\n📝 Credentials for testing:")
        print("   Email: test_mcp@example.com")
        print("   Password: test_password_12345")
    else:
        print("\n❌ Failed to create test user")
        exit(1)
