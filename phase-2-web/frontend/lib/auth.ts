/**
 * Better Auth configuration following official docs.
 */

import { betterAuth } from "better-auth";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    // Use JWT tokens instead of session tokens
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 60, // 1 hour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 // 24 hours
    }
  },
  // Enable JWT for API authentication
  advanced: {
    generateId: () => crypto.randomUUID(),
    useSecureCookies: process.env.NODE_ENV === "production",
  }
});

export type Auth = typeof auth;
