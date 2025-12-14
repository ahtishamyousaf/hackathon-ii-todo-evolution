---
name: tailwind-css
description: Tailwind CSS utility-first styling patterns and components. Use when styling React components, implementing responsive design, creating UI layouts, or building reusable component patterns with Tailwind.
---

# Tailwind CSS Patterns

Quick reference for Tailwind CSS utility-first styling used in Phase II.

## Installation (Next.js)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Configuration

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Common Utilities

### Layout
```tsx
<div className="container mx-auto">          {/* Container, centered */}
<div className="flex justify-between">       {/* Flexbox */}
<div className="grid grid-cols-3 gap-4">     {/* Grid with 3 columns */}
<div className="hidden md:block">            {/* Hide on mobile, show on desktop */}
```

### Spacing
```tsx
<div className="p-4">      {/* Padding: 1rem (16px) */}
<div className="px-6 py-4"> {/* px: horizontal, py: vertical */}
<div className="mt-8">      {/* Margin top: 2rem (32px) */}
<div className="space-y-4"> {/* Space between children */}
```

### Typography
```tsx
<h1 className="text-3xl font-bold">         {/* Large, bold text */}
<p className="text-gray-600 text-sm">       {/* Small, gray text */}
<span className="font-medium text-blue-600"> {/* Medium weight, blue */}
```

### Colors
```tsx
<div className="bg-blue-500">              {/* Background color */}
<div className="text-red-600">             {/* Text color */}
<div className="border-gray-300">          {/* Border color */}
<div className="bg-green-100">             {/* Light green background */}
```

### Borders & Rounded
```tsx
<div className="border border-gray-200">    {/* 1px gray border */}
<div className="rounded-lg">                {/* Large rounded corners */}
<div className="rounded-full">              {/* Fully rounded (circle) */}
<div className="border-t">                  {/* Top border only */}
```

### Shadows
```tsx
<div className="shadow-sm">                 {/* Small shadow */}
<div className="shadow-md">                 {/* Medium shadow */}
<div className="shadow-lg">                 {/* Large shadow */}
```

### Hover States
```tsx
<button className="hover:bg-blue-700">      {/* Hover background */}
<a className="hover:underline">             {/* Hover underline */}
<div className="hover:shadow-md">           {/* Hover shadow */}
```

### Focus States
```tsx
<input className="focus:outline-none focus:ring-2 focus:ring-blue-500" />
<button className="focus:ring-2 focus:ring-offset-2" />
```

### Responsive Design
```tsx
{/* Mobile first: base = mobile, then override at breakpoints */}
<div className="text-sm md:text-base lg:text-lg">
{/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */}

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
{/* 1 column on mobile, 2 on tablet, 3 on desktop */}
```

### Flexbox
```tsx
<div className="flex items-center justify-between">
{/* items-center: vertical alignment */}
{/* justify-between: horizontal spacing */}

<div className="flex flex-col gap-4">
{/* flex-col: vertical stack */}
{/* gap-4: space between items */}
```

### Grid
```tsx
<div className="grid grid-cols-3 gap-6">
{/* 3 equal columns with gap */}

<div className="grid grid-cols-1 lg:grid-cols-3">
{/* Responsive grid */}
```

## Common Component Patterns

### Button
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
  Click me
</button>
```

### Input
```tsx
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
```

### Card
```tsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

### Badge
```tsx
<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
  Completed
</span>
```

### Form
```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Email
    </label>
    <input
      type="email"
      className="w-full px-3 py-2 border rounded-lg focus:ring-2"
    />
  </div>
</form>
```

## Utility Combinations

### Centered Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Card Hover Effect
```tsx
<div className="transition-shadow hover:shadow-lg">
  {/* Card content */}
</div>
```

### Disabled State
```tsx
<button className="disabled:opacity-50 disabled:cursor-not-allowed">
  Submit
</button>
```

### Transition
```tsx
<div className="transition-colors duration-200 ease-in-out">
  {/* Smooth color transitions */}
</div>
```

### Group Hover
```tsx
<div className="group">
  <button className="opacity-0 group-hover:opacity-100">
    Show on parent hover
  </button>
</div>
```

## Custom Utilities

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
}
```

```tsx
<div className="bg-primary">    {/* Custom color */}
<div className="w-128">         {/* Custom spacing */}
```

## Responsive Breakpoints

```
sm:  640px   @media (min-width: 640px)
md:  768px   @media (min-width: 768px)
lg:  1024px  @media (min-width: 1024px)
xl:  1280px  @media (min-width: 1280px)
2xl: 1536px  @media (min-width: 1536px)
```

## Dark Mode (Optional)

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // or 'media'
}
```

```tsx
<div className="bg-white dark:bg-gray-800">
  <p className="text-gray-900 dark:text-white">
    Text
  </p>
</div>
```

## Best Practices

1. **Mobile-first**: Start with mobile styles, add breakpoints for larger screens
2. **Compose utilities**: Combine multiple utilities for complex styles
3. **Use @apply sparingly**: Prefer utilities in JSX
4. **Custom theme**: Extend theme for project-specific values
5. **Consistent spacing**: Use Tailwind's spacing scale (4, 8, 16, etc.)
6. **Color palette**: Stick to Tailwind's color system
7. **Component extraction**: For repeated patterns, create components

## Key Concepts

- **Utility-first**: Apply styles via class names
- **Responsive**: Mobile-first with breakpoint prefixes
- **State variants**: hover:, focus:, active:, disabled:
- **Composition**: Combine utilities for complex styles
- **Customization**: Extend theme via config file
