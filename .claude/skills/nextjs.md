# Next.js 14 Skill

Quick reference for Next.js 14 App Router patterns used in Phase II.

## Project Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── about/
│   └── page.tsx        # About page (/about)
└── dashboard/
    ├── layout.tsx      # Dashboard layout
    └── page.tsx        # Dashboard page (/dashboard)
```

## Server vs Client Components

### Server Component (Default)
```typescript
// app/page.tsx
// No 'use client' directive = Server Component
export default function Page() {
  return <h1>Server Component</h1>;
}
```

### Client Component
```typescript
// components/Counter.tsx
'use client';  // Required for interactivity

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

## Layouts

```typescript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Data Fetching

### Server Component
```typescript
async function getTasks() {
  const res = await fetch('http://localhost:8000/api/tasks');
  return res.json();
}

export default async function TasksPage() {
  const tasks = await getTasks();
  return <div>{tasks.map(t => <div key={t.id}>{t.title}</div>)}</div>;
}
```

### Client Component
```typescript
'use client';

import { useEffect, useState } from 'react';

export function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(setTasks);
  }, []);

  return <div>{tasks.map(t => <div key={t.id}>{t.title}</div>)}</div>;
}
```

## API Routes (Route Handlers)

```typescript
// app/api/hello/route.ts
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return Response.json(body, { status: 201 });
}
```

## Dynamic Routes

```typescript
// app/tasks/[id]/page.tsx
export default function TaskPage({ params }: { params: { id: string } }) {
  return <div>Task ID: {params.id}</div>;
}
```

## Route Groups

```
app/
├── (marketing)/        # Group without affecting URL
│   ├── about/
│   └── contact/
└── (app)/
    └── dashboard/
```

## Loading States

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

## Error Handling

```typescript
// app/dashboard/error.tsx
'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Metadata

```typescript
// app/page.tsx
export const metadata = {
  title: 'My App',
  description: 'Welcome to my app',
};
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://...
```

```typescript
// Access in code
const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // Client-side
const dbUrl = process.env.DATABASE_URL;           // Server-side only
```

## Key Concepts

- **Server Components**: Default, no JS sent to client
- **Client Components**: Interactive, use hooks
- **App Router**: File-system based routing
- **Layouts**: Shared UI across routes
- **Loading/Error UI**: Special files for states
- **Route Handlers**: API endpoints in Next.js
