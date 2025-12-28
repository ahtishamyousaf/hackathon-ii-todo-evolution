'use client';

/**
 * ConversationList component for Phase III: AI-Powered Todo Chatbot
 *
 * Displays a list of user's conversations with ability to switch between them.
 *
 * User Story: US4 - Conversation Persistence
 */

import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { getConversations } from '@/lib/chatApi';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: number;
  created_at: string;
  updated_at: string;
}

interface ConversationListProps {
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number | null) => void;
}

export default function ConversationList({ currentConversationId, onSelectConversation }: ConversationListProps) {
  const { token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load conversations if we have a token
    if (token) {
      setError(null); // Clear any previous auth errors
      loadConversations();
    }
  }, [token]); // Re-run when token becomes available

  const loadConversations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const convs = await getConversations(token);
      setConversations(convs);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    onSelectConversation(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full md:h-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header with New Conversation button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {error ? (
          <div className="p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
            No conversations yet.
            <br />
            Start a new chat!
          </div>
        ) : (
          <div className="py-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`
                  w-full px-4 py-3 text-left transition-colors
                  ${currentConversationId === conv.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className={`
                    w-5 h-5 mt-0.5 flex-shrink-0
                    ${currentConversationId === conv.id
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-500'
                    }
                  `} />
                  <div className="flex-1 min-w-0">
                    <div className={`
                      text-sm font-medium truncate
                      ${currentConversationId === conv.id
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                      }
                    `}>
                      Conversation #{conv.id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(conv.updated_at)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
