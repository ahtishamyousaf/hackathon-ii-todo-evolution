'use client';

/**
 * Chat page for Phase III: AI-Powered Todo Chatbot
 *
 * This page provides a conversational interface for task management
 * using natural language with an AI assistant.
 *
 * User Stories:
 * - US1 (Add Tasks): "Add a task to buy groceries"
 * - US2 (View Tasks): "What's on my todo list?"
 * - US3 (Manage Tasks): "Mark task 3 as complete"
 * - US4 (Conversation Persistence): Resume previous conversations
 * - US5 (Authentication): Secured with Better Auth JWT
 */

import { useEffect } from 'react';
import SimpleChatPanel from '@/components/SimpleChatPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-5xl mx-auto w-full h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <SimpleChatPanel className="h-full w-full" />
      </div>
    </div>
  );
}
