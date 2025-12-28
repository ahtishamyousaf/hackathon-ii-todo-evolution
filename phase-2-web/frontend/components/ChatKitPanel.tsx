'use client';

/**
 * ChatKit Panel Component for Phase III: OpenAI ChatKit Integration
 *
 * This component integrates the official OpenAI ChatKit React component
 * with our FastAPI backend via the /chatkit endpoint.
 *
 * User Stories:
 * - US1: Add tasks via natural language
 * - US2: View tasks through conversation
 * - US3: Manage tasks via chat
 * - US4: Conversation persistence
 * - US5: Better Auth JWT authentication
 */

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const CHATKIT_API_URL = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/chatkit`
  : '/chatkit';

const CHATKIT_DOMAIN_KEY = process.env.NEXT_PUBLIC_CHATKIT_DOMAIN_KEY || 'domain_pk_localhost_dev';

interface ChatKitPanelProps {
  className?: string;
}

export default function ChatKitPanel({ className }: ChatKitPanelProps) {
  const { theme } = useTheme();
  const { token } = useAuth();

  const chatkit = useChatKit({
    api: {
      url: CHATKIT_API_URL,
      domainKey: CHATKIT_DOMAIN_KEY,
      headers: async () => {
        // Add Authorization header with Better Auth token
        if (!token) {
          console.warn('No auth token available');
          return {};
        }
        return {
          'Authorization': `Bearer ${token}`,
        };
      },
    },
    theme: {
      density: 'comfortable',
      colorScheme: theme as 'light' | 'dark',
      color: {
        accent: {
          primary: theme === 'dark' ? '#60a5fa' : '#3b82f6',
        },
      },
      radius: 'medium',
    },
    startScreen: {
      greeting: 'Welcome to your AI Task Assistant',
      prompts: [
        {
          label: 'Add a task',
          prompt: 'Add a task to buy groceries',
          icon: 'sparkle',
        },
        {
          label: 'View my tasks',
          prompt: 'Show me all my tasks',
          icon: 'list',
        },
        {
          label: 'Check pending',
          prompt: "What's pending on my list?",
          icon: 'circle-question',
        },
        {
          label: 'Complete a task',
          prompt: 'Mark task 1 as complete',
          icon: 'circle-check',
        },
      ],
    },
    composer: {
      placeholder: 'Ask about your tasks or tell me what needs to be done...',
    },
    threadItemActions: {
      feedback: true,
    },
    onError: ({ error }) => {
      console.error('ChatKit error:', error);
    },
    onReady: () => {
      console.log('ChatKit is ready');
    },
  });

  return (
    <div className={className || 'h-full w-full'}>
      <ChatKit control={chatkit.control} className="h-full w-full" />
    </div>
  );
}
