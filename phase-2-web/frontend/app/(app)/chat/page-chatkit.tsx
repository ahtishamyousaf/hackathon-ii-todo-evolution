'use client';

/**
 * ChatKit page for Phase III: OpenAI ChatKit Integration
 *
 * This page provides the official OpenAI ChatKit interface for
 * task management using natural language with an AI assistant.
 *
 * User Stories:
 * - US1 (Add Tasks): "Add a task to buy groceries"
 * - US2 (View Tasks): "What's on my todo list?"
 * - US3 (Manage Tasks): "Mark task 3 as complete"
 * - US4 (Conversation Persistence): Resume previous conversations
 * - US5 (Authentication): Secured with Better Auth JWT
 */

import { useEffect } from 'react';
import ChatKitPanel from '@/components/ChatKitPanel';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';

export default function ChatKitPage() {
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
    <AppLayout
      title="AI Chat Assistant"
      subtitle="Manage your tasks through natural language conversation"
    >
      <div className="h-[calc(100vh-12rem)] w-full">
        <ChatKitPanel className="h-full w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700" />
      </div>
    </AppLayout>
  );
}
