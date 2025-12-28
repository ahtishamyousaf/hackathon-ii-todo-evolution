'use client';

/**
 * ChatInterface component for Phase III: AI-Powered Todo Chatbot
 *
 * Main chat UI using @assistant-ui/react (ChatKit alternative).
 * Provides conversational interface for task management.
 *
 * User Stories:
 * - US1: Add tasks via natural language
 * - US2: View tasks through conversation
 * - US3: Manage tasks via chat
 * - US4: Conversation persistence
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, AlertCircle, Keyboard } from 'lucide-react';
import { sendChatMessage, getConversationMessages } from '@/lib/chatApi';
import type { ChatResponse, ToolCall } from '@/types/chat';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/components/ToastContainer';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { notifyTaskCreated, notifyTaskUpdated, notifyTaskCompleted, notifyTaskDeleted } from '@/lib/taskEvents';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tool_calls?: ToolCall[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  initialConversationId?: number;
  embedded?: boolean; // If true, renders without padding for floating widget
}

export default function ChatInterface({ initialConversationId, embedded = false }: ChatInterfaceProps = {}) {
  const router = useRouter();
  const { token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(initialConversationId || null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history on mount if conversationId provided
  // Wait for token to be available before making API call
  useEffect(() => {
    if (initialConversationId && token) {
      loadConversationHistory(initialConversationId);
    }
  }, [initialConversationId, token]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversationHistory = async (convId: number) => {
    setIsLoadingHistory(true);
    setError(null);

    try {
      const historyMessages = await getConversationMessages(convId, token);

      // Convert to Message format
      const loadedMessages: Message[] = historyMessages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(loadedMessages);
      setConversationId(convId);
    } catch (err) {
      console.error('Failed to load conversation history:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation history';

      // Handle authentication errors (401)
      if (errorMessage.includes('Not authenticated') || errorMessage.includes('401')) {
        router.push('/login');
        return;
      }

      // Handle authorization errors (403)
      if (errorMessage.includes('Not authorized') || errorMessage.includes('403')) {
        setError('You do not have permission to access this conversation.');
        return;
      }

      // Handle other errors
      setError(errorMessage);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    // Add user message to UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setProcessingAction('Processing your request...');

    try {
      // Send to backend
      const response: ChatResponse = await sendChatMessage({
        conversation_id: conversationId || undefined,
        message: userMessage.content,
      }, token);

      // Store conversation ID for future messages
      if (!conversationId) {
        setConversationId(response.conversation_id);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        tool_calls: response.tool_calls || undefined,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show toast notifications for successful tool operations
      if (response.tool_calls && response.tool_calls.length > 0) {
        response.tool_calls.forEach((toolCall: ToolCall) => {
          switch (toolCall.tool) {
            case 'add_task':
              if (toolCall.result && toolCall.result.title) {
                showToast({
                  type: 'success',
                  title: 'Task Created',
                  message: `"${toolCall.result.title}" has been added to your tasks`,
                  duration: 4000,
                });
                // Notify task list to refresh
                notifyTaskCreated(toolCall.result.task_id || toolCall.result.id, toolCall.result.title);
              }
              break;
            case 'update_task':
              if (toolCall.result && toolCall.result.title) {
                showToast({
                  type: 'success',
                  title: 'Task Updated',
                  message: `"${toolCall.result.title}" has been updated`,
                  duration: 4000,
                });
                // Notify task list to refresh
                notifyTaskUpdated(toolCall.result.task_id || toolCall.result.id, toolCall.result.title);
              }
              break;
            case 'complete_task':
              if (toolCall.result && toolCall.result.title) {
                showToast({
                  type: 'success',
                  title: 'Task Completed',
                  message: `"${toolCall.result.title}" marked as complete`,
                  duration: 4000,
                });
                // Notify task list to refresh
                notifyTaskCompleted(toolCall.result.task_id || toolCall.result.id, toolCall.result.title);
              }
              break;
            case 'delete_task':
              if (toolCall.result && toolCall.result.title) {
                showToast({
                  type: 'success',
                  title: 'Task Deleted',
                  message: `"${toolCall.result.title}" has been deleted`,
                  duration: 4000,
                });
                // Notify task list to refresh
                notifyTaskDeleted(toolCall.result.task_id || toolCall.result.id, toolCall.result.title);
              }
              break;
          }
        });
      }

      setProcessingAction(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      console.error('Failed to send message:', err);

      // Handle authentication errors (401) - redirect to login
      if (errorMessage.includes('Not authenticated') || errorMessage.includes('401')) {
        setError('Your session has expired. Redirecting to login...');
        setTimeout(() => router.push('/login'), 2000);
        return;
      }

      // Handle authorization errors (403)
      if (errorMessage.includes('Not authorized') || errorMessage.includes('403')) {
        setError('You do not have permission to send messages in this conversation.');

        // Show error as system message
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Error: You do not have permission to send messages in this conversation.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMsg]);
        return;
      }

      // Handle other errors
      setError(errorMessage);

      // Show error as system message
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setProcessingAction(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-gray-800",
      !embedded && "rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
    )}>
      {/* Messages container */}
      <div className={cn(
        "flex-1 overflow-y-auto space-y-4",
        embedded ? "p-4" : "p-6"
      )}>
        {isLoadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full p-4 mb-4">
              <Send className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Try asking me to add a task, view your todo list, or manage existing tasks.
            </p>
            <div className="mt-6 space-y-2 text-sm text-gray-500 dark:text-gray-500">
              <p>"Add a task to buy groceries"</p>
              <p>"What's on my todo list?"</p>
              <p>"Mark task 3 as complete"</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-3',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Tool calls indicator */}
                  {message.tool_calls && message.tool_calls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                      {message.tool_calls.map((tc, idx) => {
                        // Special formatting for list_tasks tool
                        if (tc.tool === 'list_tasks' && tc.result && tc.result.tasks) {
                          return (
                            <div key={idx} className="space-y-2">
                              <p className="text-xs opacity-75 mb-2">
                                {tc.result.count} task(s) found:
                              </p>
                              <div className="space-y-2">
                                {tc.result.tasks.map((task: any, taskIdx: number) => (
                                  <div
                                    key={task.id}
                                    className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                                  >
                                    {/* Checkbox icon */}
                                    <div className="mt-0.5">
                                      {task.completed ? (
                                        <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                                          <span className="text-white text-xs">✓</span>
                                        </div>
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-gray-400 dark:border-gray-500 rounded" />
                                      )}
                                    </div>

                                    {/* Task content */}
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "font-medium",
                                        task.completed && "line-through opacity-60"
                                      )}>
                                        #{task.id}: {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="text-xs opacity-75 mt-1">
                                          {task.description}
                                        </p>
                                      )}
                                      <div className="flex gap-2 mt-1 text-xs opacity-60">
                                        {/* Priority badge */}
                                        {task.priority && (
                                          <span className={cn(
                                            "px-1.5 py-0.5 rounded",
                                            task.priority === "high" && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                                            task.priority === "medium" && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
                                            task.priority === "low" && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                          )}>
                                            {task.priority}
                                          </span>
                                        )}
                                        {/* Due date */}
                                        {task.due_date && (
                                          <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        // Special formatting for complete_task
                        if (tc.tool === 'complete_task' && tc.result) {
                          return (
                            <div key={idx} className="space-y-1">
                              <p className="text-xs opacity-75">Action taken:</p>
                              <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                                <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                                <span className="text-green-800 dark:text-green-200">
                                  Marked task #{tc.result.task_id} as {tc.result.status}: <strong>{tc.result.title}</strong>
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Special formatting for delete_task
                        if (tc.tool === 'delete_task' && tc.result) {
                          return (
                            <div key={idx} className="space-y-1">
                              <p className="text-xs opacity-75">Action taken:</p>
                              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                                <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs">×</span>
                                </div>
                                <span className="text-red-800 dark:text-red-200">
                                  Deleted task #{tc.result.task_id}: <strong>{tc.result.title}</strong>
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Special formatting for update_task
                        if (tc.tool === 'update_task' && tc.result) {
                          return (
                            <div key={idx} className="space-y-1">
                              <p className="text-xs opacity-75">Action taken:</p>
                              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                                <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs">✎</span>
                                </div>
                                <div className="flex-1">
                                  <span className="text-blue-800 dark:text-blue-200">
                                    Updated task #{tc.result.task_id}: <strong>{tc.result.title}</strong>
                                  </span>
                                  {tc.result.updated_fields && tc.result.updated_fields.length > 0 && (
                                    <div className="text-xs opacity-75 mt-1">
                                      Changed: {tc.result.updated_fields.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // Default tool call display for add_task and unknown tools
                        return (
                          <div key={idx}>
                            <p className="text-xs opacity-75 mb-2">Actions taken:</p>
                            <div className="text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 opacity-90">
                              <span className="font-mono">{tc.tool}</span>
                              {tc.result && tc.result.task_id && (
                                <span className="ml-2">
                                  → Task #{tc.result.task_id}
                                  {tc.result.title && `: ${tc.result.title}`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading indicator with action text */}
            {isLoading && processingAction && (
              <div className="flex justify-start">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-4 py-3 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin flex-shrink-0" />
                  <p className="text-sm text-blue-900 dark:text-blue-100 italic">
                    {processingAction}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (e.g., 'Add a task to buy milk')"
            disabled={isLoading}
            className={cn(
              'flex-1 px-4 py-3 rounded-lg',
              'bg-gray-50 dark:bg-gray-900',
              'border border-gray-300 dark:border-gray-600',
              'text-gray-900 dark:text-white',
              'placeholder-gray-500 dark:placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={cn(
              'px-6 py-3 rounded-lg font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              'flex items-center gap-2'
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
