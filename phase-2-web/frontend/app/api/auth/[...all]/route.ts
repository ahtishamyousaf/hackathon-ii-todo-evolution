/**
 * Better Auth API route handler.
 *
 * This exports all Better Auth endpoints:
 * - POST /api/auth/sign-up/email - Register new user
 * - POST /api/auth/sign-in/email - Login user
 * - POST /api/auth/sign-out - Logout user
 * - GET /api/auth/session - Get current session
 * - GET /api/auth/get-session - Get session with JWT token
 *
 * Better Auth handles JWT token creation and session management.
 * The FastAPI backend verifies these JWT tokens.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
