/**
 * Better Auth client for React components.
 *
 * This is the client-side Better Auth instance used in React components.
 * It connects to the Next.js API routes at /api/auth/*
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  basePath: "/api/auth",
});

export type AuthClient = typeof authClient;
