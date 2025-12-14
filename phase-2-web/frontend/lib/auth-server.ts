/**
 * Better Auth server configuration for Next.js API routes.
 *
 * This handles authentication on the Next.js side and issues JWT tokens.
 * The FastAPI backend verifies these tokens using the shared BETTER_AUTH_SECRET.
 *
 * Flow:
 * 1. User logs in via Better Auth (Next.js API routes)
 * 2. Better Auth creates user in FastAPI backend
 * 3. Better Auth issues JWT token
 * 4. Frontend sends JWT token to FastAPI
 * 5. FastAPI verifies token and returns user-specific data
 */

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const SECRET = process.env.BETTER_AUTH_SECRET || "your-secret-key-change-in-production";

/**
 * Better Auth instance with JWT plugin and FastAPI integration.
 */
export const auth = betterAuth({
  // Database configuration - use FastAPI as backend
  database: {
    provider: "custom",
    customAdapter: {
      /**
       * Create user in FastAPI backend during registration.
       */
      async create(data: { email: string; password: string; name?: string }) {
        const response = await fetch(`${FASTAPI_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: "Registration failed" }));
          throw new Error(error.detail);
        }

        const result = await response.json();

        return {
          id: result.user.id.toString(),
          email: result.user.email,
          emailVerified: false,
          name: null,
          image: null,
          createdAt: new Date(result.user.created_at),
          updatedAt: new Date(result.user.created_at),
        };
      },

      /**
       * Find user by email (used during login).
       * This verifies credentials with FastAPI.
       */
      async findOne(filter: { email?: string; id?: string }) {
        if (filter.email && (this as any).password) {
          // Login attempt - authenticate with FastAPI
          const response = await fetch(`${FASTAPI_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: filter.email,
              password: (this as any).password,
            }),
          });

          if (!response.ok) {
            return null; // Invalid credentials
          }

          const result = await response.json();

          return {
            id: result.user.id.toString(),
            email: result.user.email,
            emailVerified: false,
            name: null,
            image: null,
            createdAt: new Date(result.user.created_at),
            updatedAt: new Date(result.user.created_at),
            // Store FastAPI token temporarily
            _fastapiToken: result.access_token,
          };
        }

        if (filter.id) {
          // Get user by ID - would need to call FastAPI /api/auth/me
          // For now, return null and let JWT handle authentication
          return null;
        }

        return null;
      },

      async update() {
        // User updates handled by FastAPI
        return null;
      },

      async delete() {
        // User deletion handled by FastAPI
        return null;
      },
    },
  },

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60, // Update every hour
  },

  // Shared secret for JWT signing
  secret: SECRET,

  // Enable JWT plugin for token-based authentication
  plugins: [
    jwt({
      // JWT configuration
      schema: {
        expiresIn: "7d",
      },
    }),
  ],

  // Trust proxy (for deployment)
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});

export type Auth = typeof auth;
