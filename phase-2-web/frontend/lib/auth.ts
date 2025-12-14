/**
 * Better Auth client configuration for Next.js frontend.
 *
 * Better Auth issues JWT tokens that are verified by the FastAPI backend.
 * Both services share the same BETTER_AUTH_SECRET for token signing/verification.
 */

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance.
 *
 * This connects to Next.js API routes (/app/api/auth/[...all]/route.ts)
 * which handle authentication and issue JWT tokens.
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
  basePath: "/api/auth",
});

/**
 * Type for Better Auth session with JWT token.
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    token: string;
    expiresAt: Date;
  };
}
