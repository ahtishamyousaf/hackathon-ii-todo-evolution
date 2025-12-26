# Frontend Development Guidelines

**Phase II - Next.js 16 Application**

> **CRITICAL**: Read `/AGENTS.md` and `/phase-2-web/constitution.md` FIRST before making any changes.

---

## Stack

- **Framework**: Next.js 16 (App Router ONLY)
- **Language**: TypeScript 5+
- **Styling**: TailwindCSS 4
- **State**: React Context API
- **Auth**: Better Auth v1.4.7 (client)
- **Icons**: Lucide React
- **HTTP**: Fetch API with custom client

---

## Project Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   │   ├── login/
│   │   └── register/
│   ├── (app)/             # Protected app pages
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── calendar/
│   │   └── settings/
│   ├── api/auth/          # Better Auth API routes
│   │   └── [...all]/      # Catch-all Better Auth handler
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
│
├── components/            # React components
│   ├── ui/               # Base UI components (Button, Card, etc.)
│   └── [feature]/        # Feature-specific components
│
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   ├── ThemeContext.tsx
│   └── NotificationContext.tsx
│
├── hooks/                # Custom React hooks
│   ├── useKeyboardShortcut.ts
│   ├── useBulkSelection.ts
│   └── useDragAndDrop.ts
│
├── lib/                  # Core libraries
│   ├── api.ts           # API client
│   ├── auth.ts          # Better Auth server config
│   └── auth-client.ts   # Better Auth client instance
│
├── types/                # TypeScript types
│   ├── task.ts
│   ├── category.ts
│   └── keyboard.ts
│
├── utils/                # Utility functions
│   ├── dateHelpers.ts
│   ├── filterParser.ts
│   └── fileHelpers.ts
│
└── styles/
    └── globals.css       # Global styles + Tailwind imports
```

---

## Coding Patterns

### 1. Component Structure

```typescript
'use client'; // ONLY if component uses hooks/interactivity

import { useState } from 'react';
import type { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onUpdate?: (task: Task) => void;
  onDelete?: (id: number) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // Implementation
    } catch (error) {
      console.error('Failed to update:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="...">
      {/* JSX */}
    </div>
  );
}
```

**Rules**:
- ✅ Use `'use client'` ONLY when needed (hooks, events, state)
- ✅ Server Components by default
- ✅ Props interface above component
- ✅ Destructure props in parameter
- ✅ Handle loading/error states
- ✅ Use TypeScript types from `/types`

### 2. API Calls

**ALWAYS use the API client** (`/lib/api.ts`):

```typescript
// ✅ CORRECT
import { api } from '@/lib/api';

const tasks = await api.getTasks();
const task = await api.createTask({ title, description });
```

**NEVER call fetch directly**:

```typescript
// ❌ WRONG
const response = await fetch('http://localhost:8000/api/tasks');
```

**API Client Pattern**:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = {
  async getTasks() {
    const response = await fetch(`${API_URL}/api/tasks`, {
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  },

  async createTask(data: TaskCreate) {
    const response = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: { ...await getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create');
    return response.json();
  },
};
```

### 3. Authentication (Better Auth)

**Client-Side Usage**:

```typescript
'use client';

import { useSession, signIn, signOut } from '@/lib/auth-client';

export default function LoginButton() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;

  if (session) {
    return <button onClick={() => signOut()}>Sign Out</button>;
  }

  return <button onClick={() => signIn.email({ email, password })}>Sign In</button>;
}
```

**Server-Side Usage** (API Routes):

```typescript
// app/api/auth/[...all]/route.ts
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/lib/auth'; // Server instance

export const { GET, POST } = toNextJsHandler(auth);
```

**CRITICAL Rules**:
- ✅ Use `@/lib/auth-client` in components
- ✅ Use `@/lib/auth` in API routes
- ❌ NEVER mix server and client instances
- ✅ JWT tokens handled automatically by Better Auth

### 4. State Management

**Use React Context for global state**:

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '@/lib/auth-client';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();

  return (
    <AuthContext.Provider value={{ session, isPending }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
```

**Usage in Components**:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { session, isPending } = useAuth();
  // ...
}
```

### 5. Styling with Tailwind

```typescript
// ✅ GOOD - Use Tailwind classes
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>

// ✅ GOOD - Conditional classes
<div className={`
  p-4 rounded-lg
  ${isActive ? 'bg-blue-500' : 'bg-gray-500'}
  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
`}>
  Content
</div>

// ❌ BAD - Inline styles
<button style={{ padding: '8px 16px', background: 'blue' }}>
  Click Me
</button>

// ❌ BAD - CSS-in-JS
const ButtonStyle = styled.button`
  padding: 8px 16px;
  background: blue;
`;
```

**Dark Mode**:

```typescript
// Always support dark mode with Tailwind's dark: prefix
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

### 6. Error Handling

```typescript
'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TaskForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await api.createTask({ title, description });
      // Success handling
    } catch (err) {
      console.error('Task creation failed:', err);
      setError('Failed to create task. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded">
          {error}
        </div>
      )}
      {/* Form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
```

### 7. Loading States

```typescript
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading tasks...</div>;
  }

  return (
    <div>
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}
```

### 8. TypeScript Types

**Import from `/types`**:

```typescript
import type { Task, TaskCreate, TaskUpdate } from '@/types/task';
import type { Category } from '@/types/category';
```

**Define in `/types/task.ts`**:

```typescript
export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  category_id: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  due_date?: string;
  category_id?: number;
}

export interface TaskUpdate extends Partial<TaskCreate> {}
```

---

## Environment Variables

```bash
# .env.local

# Better Auth
DATABASE_URL=postgresql://user:pass@host/dbname
BETTER_AUTH_SECRET=your-secret-here

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Access in Code**:

```typescript
// ✅ Client-side (NEXT_PUBLIC_ prefix)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ Server-side (any name)
const dbUrl = process.env.DATABASE_URL;
```

---

## Common Pitfalls to Avoid

### ❌ DON'T: Use Pages Router

```typescript
// ❌ WRONG - Pages Router pattern
// pages/dashboard.tsx
export default function Dashboard() { ... }
```

```typescript
// ✅ CORRECT - App Router pattern
// app/dashboard/page.tsx
export default function Dashboard() { ... }
```

### ❌ DON'T: Mix Auth Instances

```typescript
// ❌ WRONG
import { auth } from '@/lib/auth'; // Server instance
import { useSession } from '@/lib/auth'; // Doesn't exist here
```

```typescript
// ✅ CORRECT
// In components:
import { useSession } from '@/lib/auth-client';

// In API routes:
import { auth } from '@/lib/auth';
```

### ❌ DON'T: Use Inline Styles

```typescript
// ❌ WRONG
<div style={{ marginTop: '20px', color: 'blue' }}>Text</div>
```

```typescript
// ✅ CORRECT
<div className="mt-5 text-blue-600 dark:text-blue-400">Text</div>
```

### ❌ DON'T: Forget Dark Mode

```typescript
// ❌ WRONG - Only light mode
<div className="bg-white text-black">Content</div>
```

```typescript
// ✅ CORRECT - Supports both
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Generate Better Auth schema
npx @better-auth/cli generate
```

---

## Testing Checklist

Before committing frontend changes:

- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] No console errors in browser
- [ ] Dark mode works correctly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Loading states visible
- [ ] Error handling works
- [ ] Authentication flows work
- [ ] API calls use `/lib/api.ts`

---

## Additional Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://better-auth.dev)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Remember**: Read `/AGENTS.md` for the spec-driven workflow. Never code without a spec!
