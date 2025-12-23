# Better Auth Integration Guide

This document explains how Better Auth is integrated in this Next.js application. It was created after successfully debugging and implementing Better Auth v1.4.7.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Configuration](#configuration)
5. [Critical Success Factors](#critical-success-factors)
6. [Common Errors and Solutions](#common-errors-and-solutions)
7. [Testing Checklist](#testing-checklist)

## Overview

Better Auth is a TypeScript-first authentication framework that handles JWT token creation and session management. In this application:

- **Frontend (Next.js)**: Better Auth handles authentication via Next.js API routes
- **Backend (FastAPI)**: Verifies JWT tokens issued by Better Auth
- **Database (Neon PostgreSQL)**: Shared database storing auth tables

## Architecture

```
User Browser
    |
    | (Auth requests: /api/auth/*)
    v
Next.js Frontend (Port 3000)
    |
    |--> Better Auth API Routes (/api/auth/[...all]/route.ts)
    |        |
    |        |--> Better Auth Server (lib/auth.ts)
    |        |        |
    |        |        |--> PostgreSQL Database
    |        |        |    (user, session, account, verification tables)
    |        |        |
    |        |        |--> Issues JWT Token
    |        |
    |--> Better Auth Client (lib/auth-client.ts)
    |        |
    |        |--> React Context (contexts/AuthContext.tsx)
    |
    | (API requests: /api/tasks/*, /api/users/*)
    v
FastAPI Backend (Port 8000)
    |
    |--> Verifies JWT Token
    |--> Returns user-specific data
```

## File Structure

### Core Auth Files

```
frontend/
├── lib/
│   ├── auth.ts              # Server-side Better Auth configuration
│   └── auth-client.ts       # Client-side Better Auth instance
├── app/
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts # Next.js API route handler (CRITICAL FILE)
├── contexts/
│   └── AuthContext.tsx      # React Context for auth state
└── .env.local              # Environment variables
```

### What Each File Does

**1. `/lib/auth.ts` (Server-side config)**
- Creates Better Auth instance with database connection
- Configures email/password authentication
- Used ONLY in API routes (server-side)

**2. `/lib/auth-client.ts` (Client-side instance)**
- Creates client-side Better Auth instance
- Used in React components and contexts
- Connects to `/api/auth/*` endpoints

**3. `/app/api/auth/[...all]/route.ts` (API route handler)**
- Exports GET and POST handlers for all auth endpoints
- **MUST use `toNextJsHandler(auth)`** - this is critical for Next.js integration

**4. `/contexts/AuthContext.tsx` (React Context)**
- Provides auth state to React components
- Uses Better Auth session hook
- Extracts JWT token and user data

## Configuration

### 1. Environment Variables

Add to `/frontend/.env.local`:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here  # Generate with: openssl rand -base64 32
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Database Schema

Better Auth requires these tables (auto-created by CLI):

```sql
-- user table
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  emailVerified BOOLEAN NOT NULL DEFAULT false,
  name TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- session table
CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  expiresAt TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

-- account table
CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TIMESTAMP,
  refreshTokenExpiresAt TIMESTAMP,
  scope TEXT,
  password TEXT,
  createdAt TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP NOT NULL
);

-- verification table
CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

**To create tables:**
```bash
cd frontend
npx @better-auth/cli generate
```

### 3. Next.js Configuration

Update `/frontend/next.config.js` to exclude auth routes from FastAPI proxy:

```javascript
async rewrites() {
  return [
    {
      // Exclude /api/auth/* from proxy (handled by Better Auth)
      source: '/api/:path((?!auth).*)*',
      destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
    },
  ];
}
```

### 4. Install Dependencies

```bash
cd frontend
npm install better-auth pg
```

## Critical Success Factors

These are the KEY configurations that MUST be correct:

### 1. Use `toNextJsHandler()` in API Route

**WRONG (doesn't work):**
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
export const { GET, POST } = auth.handler;  // ❌ WILL NOT WORK
```

**CORRECT (works!):**
```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";  // ✅ CRITICAL IMPORT
export const { GET, POST } = toNextJsHandler(auth);     // ✅ WORKS!
```

### 2. Pass Pool Directly to Database Config

**WRONG:**
```typescript
database: {
  provider: "pg",
  pool: new Pool({...}),
  type: "postgres"
}
```

**CORRECT:**
```typescript
database: new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
```

### 3. Separate Server and Client Instances

- **Server:** Use `betterAuth()` from `"better-auth"` in `lib/auth.ts`
- **Client:** Use `createAuthClient()` from `"better-auth/react"` in `lib/auth-client.ts`
- **Never mix them!**

### 4. Proxy Configuration

Make sure `/api/auth/*` routes are NOT proxied to FastAPI:

```javascript
// Use negative lookahead: (?!auth)
source: '/api/:path((?!auth).*)*'
```

## Common Errors and Solutions

### Error 1: "Failed to initialize database adapter"

**Symptoms:**
```
[Error [BetterAuthError]: Failed to initialize database adapter]
```

**Causes:**
1. Wrong database configuration format
2. Missing `toNextJsHandler()` wrapper
3. Database tables not created
4. Invalid DATABASE_URL

**Solutions:**
1. Pass Pool directly: `database: new Pool({...})`
2. Use `toNextJsHandler(auth)` in route.ts
3. Run `npx @better-auth/cli generate`
4. Verify DATABASE_URL with test connection

### Error 2: 404 on Auth Endpoints

**Symptoms:**
```
POST /api/auth/sign-up/email 404 (Not Found)
GET /api/auth/get-session 404 (Not Found)
```

**Cause:** Next.js proxy forwarding auth requests to FastAPI

**Solution:** Update next.config.js to exclude `/api/auth/*`:
```javascript
source: '/api/:path((?!auth).*)*'
```

### Error 3: 405 Method Not Allowed

**Symptoms:**
```
GET /api/auth/get-session 405 (Method Not Allowed)
```

**Cause:** Missing GET or POST handler export

**Solution:** Ensure both handlers are exported:
```typescript
export const { GET, POST } = toNextJsHandler(auth);
```

### Error 4: "Module has no exported member 'authClient'"

**Symptoms:**
```
Module './lib/auth' has no exported member 'authClient'
```

**Cause:** Importing client from server file

**Solution:** Import from correct file:
```typescript
// Wrong:
import { authClient } from "@/lib/auth";

// Correct:
import { authClient } from "@/lib/auth-client";
```

### Error 5: 400 Bad Request - Missing Name

**Symptoms:**
```
[body.name] Invalid input: expected string, received undefined
```

**Cause:** Better Auth requires name field for email/password signup

**Solution:** Provide default name:
```typescript
const register = async (email: string, password: string, name?: string) => {
  const result = await authClient.signUp.email({
    email,
    password,
    name: name || email.split('@')[0],  // Default to email username
  });
};
```

## Testing Checklist

### 1. Backend Verification

```bash
# Test database connection
cd frontend
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT NOW()').then(r=>console.log('✓ Connected:',r.rows[0])).catch(e=>console.error('✗ Error:',e)).finally(()=>p.end())"

# Verify tables exist
npx @better-auth/cli generate
# Should show: "Your schema is already up to date"
```

### 2. Development Server

```bash
# Start frontend
cd frontend
npm run dev

# Should see:
# - Local: http://localhost:3000
# - No database adapter errors
```

### 3. Browser Testing

1. **Registration Flow:**
   - Navigate to http://localhost:3000/register
   - Fill in: email, password
   - Click "Create Account"
   - Should redirect to dashboard with user session

2. **Login Flow:**
   - Navigate to http://localhost:3000/login
   - Enter registered credentials
   - Should login and redirect to dashboard

3. **Session Persistence:**
   - Refresh page while logged in
   - Should remain logged in
   - Check browser dev tools for token in cookies

4. **Logout Flow:**
   - Click logout button
   - Should redirect to homepage
   - Session should be cleared

### 4. API Endpoint Testing

```bash
# Test registration endpoint
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Should return 200 with session data

# Test session endpoint
curl http://localhost:3000/api/auth/get-session

# Should return session data or null
```

## Best Practices

1. **Always use `toNextJsHandler()`** - This is non-negotiable for Next.js integration
2. **Separate server and client code** - Never import server auth in client components
3. **Validate environment variables** - Check DATABASE_URL and BETTER_AUTH_SECRET on startup
4. **Test database connection** - Verify connection before running Better Auth CLI
5. **Use TypeScript types** - Export and use Auth types for type safety
6. **Handle errors gracefully** - Show user-friendly error messages
7. **Secure your secret** - Never commit BETTER_AUTH_SECRET to version control

## Troubleshooting Decision Tree

```
Auth not working?
├── 404 errors on /api/auth/*?
│   └── Check next.config.js proxy exclusion
├── 405 Method Not Allowed?
│   └── Verify GET/POST exports in route.ts
├── "Failed to initialize database adapter"?
│   ├── Check database config format (direct Pool)
│   ├── Verify toNextJsHandler() usage
│   └── Test database connection
├── Import errors?
│   └── Check importing from correct file (auth vs auth-client)
└── 400 Bad Request?
    └── Check required fields (email, password, name)
```

## Additional Resources

- [Better Auth Official Docs](https://better-auth.com)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Summary

The key to successful Better Auth integration in Next.js:

1. Use `toNextJsHandler(auth)` in API route handler
2. Pass Pool directly to database config
3. Separate server (`lib/auth.ts`) and client (`lib/auth-client.ts`) instances
4. Exclude `/api/auth/*` from FastAPI proxy
5. Create database tables with Better Auth CLI
6. Provide all required fields (email, password, name)

Follow these guidelines and you'll have a working Better Auth setup!
