# Better Auth Quick Reference Card

Quick lookup for Better Auth integration with Next.js. For detailed guide, see `BETTER_AUTH_SETUP.md`.

## Critical Configuration Checklist

### 1. API Route Handler (MOST CRITICAL)

```typescript
// ✅ CORRECT - app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
export const { GET, POST } = toNextJsHandler(auth);
```

```typescript
// ❌ WRONG - This will NOT work
export const { GET, POST } = auth.handler;
```

### 2. Database Configuration

```typescript
// ✅ CORRECT - lib/auth.ts
database: new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})
```

```typescript
// ❌ WRONG - Don't wrap in object
database: { provider: "pg", pool: new Pool({...}) }
```

### 3. Proxy Configuration

```javascript
// ✅ CORRECT - next.config.js
source: '/api/:path((?!auth).*)*'  // Excludes /api/auth/*
```

```javascript
// ❌ WRONG - This proxies auth routes to FastAPI
source: '/api/:path*'
```

### 4. Import Separation

```typescript
// ✅ Server-side (API routes, server components)
import { auth } from "@/lib/auth";

// ✅ Client-side (React components, contexts)
import { authClient } from "@/lib/auth-client";

// ❌ WRONG - Never mix these!
```

## Quick Troubleshooting

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| 404 on `/api/auth/*` | Proxy config wrong | Check next.config.js regex |
| 405 Method Not Allowed | Missing handler export | Verify GET/POST exports |
| Database adapter failed | Wrong config or missing toNextJsHandler | Check both route.ts and lib/auth.ts |
| Import error | Wrong file imported | auth-client.ts for client, auth.ts for server |
| 400 Missing name | Required field not provided | Add default: `name \|\| email.split('@')[0]` |

## Environment Variables

```bash
# .env.local (required)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Setup Commands

```bash
# Install dependencies
npm install better-auth pg

# Create database tables
npx @better-auth/cli generate

# Test database connection
node -e "const {Pool}=require('pg');const p=new Pool({connectionString:process.env.DATABASE_URL});p.query('SELECT NOW()').then(r=>console.log('✓',r.rows[0])).catch(e=>console.error('✗',e)).finally(()=>p.end())"
```

## File Structure

```
lib/
├── auth.ts              # Server config (betterAuth)
└── auth-client.ts       # Client instance (createAuthClient)

app/api/auth/[...all]/
└── route.ts            # MUST use toNextJsHandler(auth)

contexts/
└── AuthContext.tsx     # Uses authClient from auth-client.ts
```

## Common Mistakes to Avoid

1. ❌ Using `auth.handler` instead of `toNextJsHandler(auth)`
2. ❌ Wrapping Pool in object for database config
3. ❌ Proxying `/api/auth/*` to FastAPI
4. ❌ Importing authClient from lib/auth.ts
5. ❌ Importing auth from lib/auth-client.ts
6. ❌ Not providing default for name field

## Testing Quick Check

```bash
# Should return 200 with session data
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'
```

## Key Insight

The #1 reason Better Auth fails in Next.js: **Not using `toNextJsHandler()`**

This wrapper is specifically designed for Next.js App Router and is **required** for proper integration. Without it, Better Auth will fail to initialize the database adapter properly.

## Resources

- Detailed Guide: `BETTER_AUTH_SETUP.md`
- Better Auth Docs: https://better-auth.com
- Project Docs: `/CLAUDE.md`
