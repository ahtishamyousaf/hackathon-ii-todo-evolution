---
name: zod
description: Zod schema validation for TypeScript. Use when defining type-safe schemas, validating form data, API responses, environment variables, or ensuring runtime type safety.
---

# Zod Schema Validation

TypeScript-first schema declaration and validation library.

## Installation

```bash
npm install zod
```

## Basic Schema

```typescript
import { z } from 'zod';

// String schema
const nameSchema = z.string();

// Number schema
const ageSchema = z.number();

// Boolean schema
const activeSchema = z.boolean();

// Parse (throws on invalid)
nameSchema.parse('John'); // ✓
nameSchema.parse(123);    // ✗ throws ZodError

// Safe parse (returns result)
const result = nameSchema.safeParse('John');
if (result.success) {
  console.log(result.data); // "John"
} else {
  console.log(result.error);
}
```

## Object Schemas

```typescript
const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().min(0).max(150).optional(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof userSchema>;
// type User = {
//   id: number;
//   email: string;
//   name: string;
//   age?: number;
// }
```

## String Validation

```typescript
const stringSchemas = {
  // Min/max length
  username: z.string().min(3).max(20),

  // Email
  email: z.string().email(),

  // URL
  website: z.string().url(),

  // UUID
  id: z.string().uuid(),

  // Regex
  phone: z.string().regex(/^\d{10}$/),

  // Custom message
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain number'),

  // Transform
  trimmed: z.string().trim(),
  lowercase: z.string().toLowerCase(),
};
```

## Number Validation

```typescript
const numberSchemas = {
  // Min/max
  age: z.number().min(0).max(150),

  // Integer
  count: z.number().int(),

  // Positive
  price: z.number().positive(),

  // Finite
  rating: z.number().finite(),

  // Multiple of
  even: z.number().multipleOf(2),
};
```

## Common Schemas

### Login Form

```typescript
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginData = z.infer<typeof loginSchema>;
```

### Registration Form

```typescript
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterData = z.infer<typeof registerSchema>;
```

### Task Schema

```typescript
const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  completed: z.boolean().default(false),
});

type TaskData = z.infer<typeof taskSchema>;
```

## Optional and Nullable

```typescript
const schema = z.object({
  // Optional (can be undefined)
  middleName: z.string().optional(),

  // Nullable (can be null)
  deletedAt: z.date().nullable(),

  // Both
  notes: z.string().optional().nullable(),

  // With default
  status: z.string().default('active'),
});
```

## Arrays

```typescript
// Array of strings
const tagsSchema = z.array(z.string());

// Array with min/max
const itemsSchema = z.array(z.string()).min(1).max(10);

// Non-empty array
const nonEmptySchema = z.array(z.string()).nonempty();

// Array of objects
const tasksSchema = z.array(z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
}));

type Tasks = z.infer<typeof tasksSchema>;
// type Tasks = Array<{ id: number; title: string; completed: boolean }>
```

## Enums

```typescript
// Native enum
const statusSchema = z.enum(['pending', 'active', 'completed']);

type Status = z.infer<typeof statusSchema>;
// type Status = 'pending' | 'active' | 'completed'

// Usage in object
const taskSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'active', 'completed']),
});
```

## Unions

```typescript
// String or number
const idSchema = z.union([z.string(), z.number()]);

// Multiple types
const valueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

// Discriminated union
const responseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.any() }),
  z.object({ status: z.literal('error'), error: z.string() }),
]);
```

## Transforms

```typescript
// String to number
const numberString = z.string().transform((val) => parseInt(val));

// Trim and lowercase
const cleanEmail = z.string()
  .transform((val) => val.trim().toLowerCase())
  .email();

// Parse date
const dateSchema = z.string().transform((val) => new Date(val));
```

## Refinements (Custom Validation)

```typescript
// Single refinement
const passwordSchema = z.string()
  .refine((val) => val.length >= 8, {
    message: 'Password must be at least 8 characters',
  });

// Multiple refinements
const userSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], // Error appears on this field
});

// Async refinement
const emailSchema = z.string()
  .email()
  .refine(async (email) => {
    const available = await checkEmailAvailability(email);
    return available;
  }, {
    message: 'Email already taken',
  });
```

## Environment Variables

```typescript
// env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

// Validate and export
export const env = envSchema.parse(process.env);

// Type-safe usage
console.log(env.NEXT_PUBLIC_API_URL); // ✓ TypeScript knows this is a string
```

## API Response Validation

```typescript
// Define expected response
const taskResponseSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

// Validate API response
async function getTask(id: number) {
  const response = await fetch(`/api/tasks/${id}`);
  const data = await response.json();

  // Validate and parse
  const task = taskResponseSchema.parse(data);
  return task; // Type-safe!
}
```

## With React Hook Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

function TaskForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = (data: TaskFormData) => {
    // Data is validated and type-safe
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('description')} />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Error Handling

```typescript
try {
  const user = userSchema.parse(data);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.issues);
    // [
    //   {
    //     code: 'too_small',
    //     minimum: 1,
    //     type: 'string',
    //     inclusive: true,
    //     message: 'String must contain at least 1 character(s)',
    //     path: ['name']
    //   }
    // ]
  }
}

// Safe parse (no throw)
const result = userSchema.safeParse(data);
if (!result.success) {
  console.log(result.error.flatten());
  // {
  //   formErrors: [],
  //   fieldErrors: {
  //     name: ['String must contain at least 1 character(s)']
  //   }
  // }
}
```

## Partial and Pick

```typescript
const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  age: z.number(),
});

// Make all fields optional
const partialUserSchema = userSchema.partial();
// { id?: number; email?: string; name?: string; age?: number }

// Pick specific fields
const userLoginSchema = userSchema.pick({
  email: true,
  password: true,
});
// { email: string; password: string }

// Omit fields
const userWithoutIdSchema = userSchema.omit({ id: true });
// { email: string; name: string; age: number }
```

## Best Practices

1. **Define schemas once**: Reuse across frontend/backend
2. **Infer types**: Use `z.infer<typeof schema>` instead of manual types
3. **Validate early**: Validate at API boundaries and form submissions
4. **Custom messages**: Provide clear, user-friendly error messages
5. **Environment validation**: Validate env vars at startup
6. **API responses**: Validate external data for runtime safety
7. **Transform data**: Use `.transform()` for data normalization

## Key Concepts

- **Type Inference**: Automatic TypeScript types from schemas
- **Runtime Validation**: Ensures data matches expected shape
- **Composability**: Build complex schemas from simple ones
- **Type Safety**: Compile-time and runtime type checking
- **Error Messages**: Customizable validation messages
