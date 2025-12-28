/**
 * Chat types for Phase III: AI-Powered Todo Chatbot
 *
 * These types define the structure of chat conversations and messages
 * for natural language task management.
 */

export interface Conversation {
  id: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  user_id: string;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatRequest {
  conversation_id?: number;
  message: string;
}

export interface ToolCall {
  tool: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls?: ToolCall[];
}

export interface ConversationListItem {
  id: number;
  last_message?: string;
  last_updated: string;
  message_count: number;
}
