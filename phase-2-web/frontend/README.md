# Todo Frontend

Next.js 16+ frontend for web-based todo application with Better Auth integration.

## Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Update BETTER_AUTH_SECRET in .env.local (must match backend)

# Run development server
npm run dev
```

## Development

- **Dev Server**: http://localhost:3000
- **API Backend**: http://localhost:8000

## Tech Stack

- **Framework**: Next.js 16+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 3.4+
- **Auth**: Better Auth
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + React Testing Library

## Project Structure

- `app/` - Next.js App Router pages
- `components/` - React components
- `lib/` - Utilities and helpers
- `types/` - TypeScript type definitions
- `hooks/` - Custom React hooks
- `contexts/` - React context providers

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
