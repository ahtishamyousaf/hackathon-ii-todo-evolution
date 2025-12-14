---
name: react-hook-form
description: React Hook Form for efficient form management in Next.js. Use when building forms, handling form state, validation, submission, or integrating with Zod schemas in React applications.
---

# React Hook Form

Performant, flexible forms with easy-to-use validation for React and Next.js.

## Installation

```bash
npm install react-hook-form
```

## Basic Usage

```typescript
'use client';

import { useForm } from 'react-hook-form';

interface FormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

## With Zod Validation

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await api.login(data.email, data.password);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="w-full px-3 py-2 border rounded"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

## Advanced Patterns

### Default Values

```typescript
const { register } = useForm<TaskFormData>({
  defaultValues: {
    title: task?.title || '',
    description: task?.description || '',
    completed: task?.completed || false,
  },
});
```

### Watch Fields

```typescript
const { register, watch } = useForm<FormData>();

// Watch single field
const email = watch('email');

// Watch multiple fields
const [email, password] = watch(['email', 'password']);

// Watch all fields
const allFields = watch();
```

### Set Values Programmatically

```typescript
const { register, setValue } = useForm<FormData>();

// Set single value
setValue('email', 'user@example.com');

// Set with validation
setValue('email', 'user@example.com', {
  shouldValidate: true,
  shouldDirty: true
});
```

### Reset Form

```typescript
const { register, reset } = useForm<FormData>();

// Reset to default values
reset();

// Reset to specific values
reset({
  email: '',
  password: '',
});
```

### Controlled Components

```typescript
import { Controller } from 'react-hook-form';

<Controller
  name="category"
  control={control}
  render={({ field }) => (
    <select {...field}>
      <option value="personal">Personal</option>
      <option value="work">Work</option>
    </select>
  )}
/>
```

## Error Handling

### Built-in Validation

```typescript
<input
  {...register('email', {
    required: 'Email is required',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Invalid email address',
    },
  })}
/>

<input
  {...register('password', {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
  })}
/>
```

### Server-Side Errors

```typescript
const { register, handleSubmit, setError } = useForm<FormData>();

const onSubmit = async (data: FormData) => {
  try {
    await api.login(data);
  } catch (error) {
    // Set server error on specific field
    setError('email', {
      type: 'server',
      message: 'Invalid credentials',
    });

    // Or set root error
    setError('root', {
      type: 'server',
      message: 'Login failed. Please try again.',
    });
  }
};
```

## Form State

```typescript
const {
  formState: {
    errors,        // Validation errors
    isSubmitting,  // Form is submitting
    isSubmitted,   // Form has been submitted
    isDirty,       // Form has been modified
    isValid,       // Form is valid
    touchedFields, // Fields that have been touched
    dirtyFields,   // Fields that have been modified
  },
} = useForm<FormData>();
```

## Reusable Form Component

```typescript
// components/forms/FormField.tsx
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  register: any;
  error?: string;
  placeholder?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  register,
  error,
  placeholder,
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

// Usage
<FormField
  label="Email"
  name="email"
  type="email"
  register={register}
  error={errors.email?.message}
/>
```

## Async Validation

```typescript
<input
  {...register('email', {
    validate: async (value) => {
      const available = await checkEmailAvailability(value);
      return available || 'Email already taken';
    },
  })}
/>
```

## Complete Example: Task Form

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description
        </label>
        <textarea
          id="description"
          {...register('description')}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          placeholder="Enter task description (optional)"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

## Best Practices

1. **Use TypeScript**: Define form data types
2. **Use Zod**: For schema validation with `zodResolver`
3. **Destructure carefully**: Only destructure what you need from `useForm`
4. **Handle errors**: Display validation errors to users
5. **Disable on submit**: Prevent multiple submissions
6. **Reset after success**: Clear form after successful submission
7. **Server errors**: Handle and display API errors
8. **Accessibility**: Use proper labels and ARIA attributes

## Key Concepts

- **Uncontrolled**: React Hook Form uses uncontrolled components by default (better performance)
- **Register**: Connect inputs to form state
- **Validation**: Built-in or Zod schema validation
- **Form State**: Track submission, errors, dirty fields
- **Type Safety**: Full TypeScript support
