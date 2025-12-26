"use client";

/**
 * Authentication context powered by Better Auth.
 *
 * Better Auth handles JWT token creation and session management.
 * Tokens are sent to FastAPI backend for verification.
 *
 * Flow:
 * 1. User logs in via Better Auth
 * 2. Better Auth issues JWT token
 * 3. Token stored in session/cookies
 * 4. Frontend sends JWT to FastAPI with each API request
 * 5. FastAPI verifies JWT and returns user-specific data
 *
 * Provides:
 * - User authentication state from Better Auth session
 * - Login/register/logout via Better Auth client
 * - JWT token for FastAPI API calls
 * - Loading states
 */

import { createContext, useContext, ReactNode, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use Better Auth session hook
  const { data: session, isPending, error } = authClient.useSession();

  // Extract session token from Better Auth
  // Better Auth stores JWT tokens in session
  const token = session?.session?.token || null;

  // Update API client with Better Auth token whenever it changes
  useEffect(() => {
    if (token) {
      api.setToken(token);
      console.log("[Auth] Token updated from Better Auth session");
    } else {
      api.setToken(null);
      console.log("[Auth] No token available");
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const result = await authClient.signIn.email({
      email,
      password,
    });

    if (result.error) {
      throw new Error(result.error.message || "Login failed");
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    const result = await authClient.signUp.email({
      email,
      password,
      name: name || email.split('@')[0], // Default to email username if no name provided
    });

    if (result.error) {
      throw new Error(result.error.message || "Registration failed");
    }
  };

  const logout = async () => {
    await authClient.signOut();
  };

  // Map Better Auth user to our User type
  const user: User | null = session?.user
    ? {
        id: parseInt(session.user.id),
        email: session.user.email,
        name: session.user.name,
        created_at: session.user.createdAt?.toISOString() || new Date().toISOString(),
      }
    : null;

  const value: AuthContextType = {
    user,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    token,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access Better Auth authentication context.
 *
 * Must be used within AuthProvider.
 *
 * @example
 * const { user, token, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
