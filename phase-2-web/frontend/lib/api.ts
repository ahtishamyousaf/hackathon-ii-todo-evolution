/**
 * API client for communication with FastAPI backend.
 *
 * Handles:
 * - HTTP requests to backend API
 * - JWT token management
 * - Error handling
 * - Type-safe request/response
 */

import type { Task, TaskCreate, TaskUpdate } from "@/types/task";
import type { Category, CategoryCreate, CategoryUpdate } from "@/types/category";
import type { Subtask, SubtaskCreate, SubtaskUpdate } from "@/types/subtask";
import type { Comment, CommentCreate, CommentUpdate } from "@/types/comment";
import type { Attachment } from "@/types/attachment";
import type { TaskDependency, TaskDependencyCreate } from "@/types/dependency";
import type { DashboardStats } from "@/types/dashboard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * API client class for backend communication.
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Set the authentication token for API requests.
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * Get the current authentication token.
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Make an authenticated API request.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const url = `${this.baseURL}${endpoint}`;

    // Add authorization header if token is available
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Include cookies for Better Auth session
      });

      // Handle non-OK responses
      if (!response.ok) {
        // Handle authentication errors (401 Unauthorized)
        if (response.status === 401) {
          // Clear token and redirect to login
          this.token = null;
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error('Session expired. Please log in again.');
        }

        let error: any;
        try {
          error = await response.json();
        } catch {
          error = { detail: `HTTP error ${response.status}` };
        }

        // Handle different error formats
        let errorMessage = `Request failed: ${response.status}`;
        if (error && typeof error.detail === 'string') {
          errorMessage = error.detail;
        } else if (error && Array.isArray(error.detail)) {
          // FastAPI validation errors
          errorMessage = error.detail.map((e: any) => e.msg).join(', ');
        } else if (error && error.detail && typeof error.detail === 'object') {
          errorMessage = JSON.stringify(error.detail);
        }

        // Only log non-validation errors to console
        if (response.status !== 400) {
          console.error('API Error:', { status: response.status, url, error });
        }
        throw new Error(errorMessage);
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // ============================================
  // Task API Methods (Phase II MVP)
  // Feature: 003-task-crud
  // ============================================

  /**
   * Get all tasks for the authenticated user, optionally filtered by category.
   *
   * User Story: US-002 (View All Tasks), US3 (Filter by Category)
   * Returns tasks ordered by created_at DESC (newest first)
   *
   * @param categoryId - Optional category ID to filter tasks (undefined = show all)
   */
  async getTasks(categoryId?: number | null): Promise<Task[]> {
    const params = new URLSearchParams();
    if (categoryId !== undefined && categoryId !== null) {
      params.append("category_id", categoryId.toString());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/api/tasks?${queryString}` : "/api/tasks";
    return this.get<Task[]>(endpoint);
  }

  /**
   * Get a specific task by ID.
   *
   * User Story: US-002 (View All Tasks)
   * Returns 404 if task not found or belongs to different user
   */
  async getTask(taskId: number): Promise<Task> {
    return this.get<Task>(`/api/tasks/${taskId}`);
  }

  /**
   * Create a new task.
   *
   * User Story: US-001 (Create New Task)
   * User ID automatically extracted from JWT token
   */
  async createTask(task: TaskCreate): Promise<Task> {
    return this.post<Task>("/api/tasks", task);
  }

  /**
   * Update an existing task.
   *
   * User Story: US-003 (Update Existing Task)
   * All fields in task parameter are optional (partial update)
   */
  async updateTask(taskId: number, task: TaskUpdate): Promise<Task> {
    return this.put<Task>(`/api/tasks/${taskId}`, task);
  }

  /**
   * Delete a task permanently.
   *
   * User Story: US-005 (Delete Task)
   * Frontend should show confirmation dialog before calling this
   */
  async deleteTask(taskId: number): Promise<void> {
    return this.delete<void>(`/api/tasks/${taskId}`);
  }

  /**
   * Toggle task completion status (complete ↔ incomplete).
   *
   * User Story: US-004 (Mark Task Complete)
   * Flips boolean value via PATCH /api/tasks/{id}/complete
   */
  async toggleTaskComplete(taskId: number): Promise<Task> {
    return this.patch<Task>(`/api/tasks/${taskId}/complete`);
  }

  // ============================================
  // Category API Methods (Phase II Enhancement)
  // Feature: 004-task-categories
  // ============================================

  /**
   * Get all categories for the authenticated user.
   *
   * User Story: US1 (Create Custom Category)
   * Returns categories ordered by name ASC (alphabetically)
   */
  async getCategories(): Promise<Category[]> {
    return this.get<Category[]>("/api/categories");
  }

  /**
   * Get a specific category by ID.
   *
   * User Story: US1 (Create Custom Category)
   * Returns 404 if category not found or belongs to different user
   */
  async getCategory(categoryId: number): Promise<Category> {
    return this.get<Category>(`/api/categories/${categoryId}`);
  }

  /**
   * Create a new category.
   *
   * User Story: US1 (Create Custom Category)
   * User ID automatically extracted from JWT token
   *
   * @throws Error if category name already exists (409 Conflict)
   * @throws Error if color format is invalid (400 Bad Request)
   */
  async createCategory(category: CategoryCreate): Promise<Category> {
    return this.post<Category>("/api/categories", category);
  }

  /**
   * Update an existing category.
   *
   * User Story: US4 (Update Category Details)
   * All fields in category parameter are optional (partial update)
   *
   * @throws Error if new name already exists (409 Conflict)
   * @throws Error if color format is invalid (400 Bad Request)
   */
  async updateCategory(categoryId: number, category: CategoryUpdate): Promise<Category> {
    return this.put<Category>(`/api/categories/${categoryId}`, category);
  }

  /**
   * Delete a category permanently.
   *
   * User Story: US5 (Delete Unused Categories)
   * Tasks in this category become uncategorized (category_id set to null)
   * Frontend should show confirmation dialog before calling this
   */
  async deleteCategory(categoryId: number): Promise<void> {
    return this.delete<void>(`/api/categories/${categoryId}`);
  }

  // ============================================
  // Subtask API Methods
  // ============================================

  /**
   * Get all subtasks for a task.
   */
  async getSubtasks(taskId: number): Promise<Subtask[]> {
    return this.get<Subtask[]>(`/api/tasks/${taskId}/subtasks/`);
  }

  /**
   * Create a new subtask for a task.
   */
  async createSubtask(taskId: number, subtask: SubtaskCreate): Promise<Subtask> {
    return this.post<Subtask>(`/api/tasks/${taskId}/subtasks/`, subtask);
  }

  /**
   * Update a subtask.
   */
  async updateSubtask(taskId: number, subtaskId: number, subtask: SubtaskUpdate): Promise<Subtask> {
    return this.put<Subtask>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, subtask);
  }

  /**
   * Delete a subtask.
   */
  async deleteSubtask(taskId: number, subtaskId: number): Promise<void> {
    return this.delete<void>(`/api/tasks/${taskId}/subtasks/${subtaskId}`);
  }

  // ============================================
  // Comment API Methods
  // ============================================

  /**
   * Get all comments for a task.
   */
  async getComments(taskId: number): Promise<Comment[]> {
    return this.get<Comment[]>(`/api/tasks/${taskId}/comments`);
  }

  /**
   * Create a new comment for a task.
   */
  async createComment(taskId: number, comment: CommentCreate): Promise<Comment> {
    return this.post<Comment>(`/api/tasks/${taskId}/comments`, comment);
  }

  /**
   * Update a comment.
   */
  async updateComment(taskId: number, commentId: number, comment: CommentUpdate): Promise<Comment> {
    return this.put<Comment>(`/api/tasks/${taskId}/comments/${commentId}`, comment);
  }

  /**
   * Delete a comment.
   */
  async deleteComment(taskId: number, commentId: number): Promise<void> {
    return this.delete<void>(`/api/tasks/${taskId}/comments/${commentId}`);
  }

  // ============================================
  // Attachment API Methods
  // ============================================

  /**
   * Get all attachments for a task.
   */
  async getAttachments(taskId: number): Promise<Attachment[]> {
    return this.get<Attachment[]>(`/api/tasks/${taskId}/attachments`);
  }

  /**
   * Upload a file attachment to a task.
   */
  async uploadAttachment(taskId: number, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append("file", file);

    const url = `${this.baseURL}/api/tasks/${taskId}/attachments`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(error.detail || "Upload failed");
    }

    return response.json();
  }

  /**
   * Download an attachment.
   */
  async downloadAttachment(taskId: number, attachmentId: number): Promise<Blob> {
    const url = `${this.baseURL}/api/tasks/${taskId}/attachments/${attachmentId}/download`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("Download failed");
    }

    return response.blob();
  }

  /**
   * Delete an attachment.
   */
  async deleteAttachment(taskId: number, attachmentId: number): Promise<void> {
    return this.delete<void>(`/api/tasks/${taskId}/attachments/${attachmentId}`);
  }

  // ============================================
  // Task Dependency API Methods
  // ============================================

  /**
   * Create a task dependency.
   */
  async createTaskDependency(dependency: TaskDependencyCreate): Promise<TaskDependency> {
    return this.post<TaskDependency>("/api/task-dependencies", dependency);
  }

  /**
   * Get dependencies for a specific task.
   */
  async getTaskDependencies(taskId: number): Promise<TaskDependency[]> {
    return this.get<TaskDependency[]>(`/api/task-dependencies/task/${taskId}`);
  }

  /**
   * Get all dependencies for the current user.
   */
  async getAllUserDependencies(): Promise<TaskDependency[]> {
    return this.get<TaskDependency[]>("/api/task-dependencies/user/all");
  }

  /**
   * Delete a task dependency.
   */
  async deleteTaskDependency(dependencyId: number): Promise<void> {
    return this.delete<void>(`/api/task-dependencies/${dependencyId}`);
  }

  // ============================================
  // Dashboard API Methods
  // ============================================

  /**
   * Get dashboard statistics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.get<DashboardStats>("/api/dashboard/stats");
  }

  // ============================================
  // Time Tracking API Methods
  // ============================================

  /**
   * Start a timer for a task.
   */
  async startTimer(taskId: number, description?: string): Promise<any> {
    return this.post("/api/time-entries/start", { task_id: taskId, description });
  }

  /**
   * Stop a running timer.
   */
  async stopTimer(entryId: number): Promise<any> {
    return this.post(`/api/time-entries/stop/${entryId}`, {});
  }

  /**
   * Add a manual time entry.
   */
  async addManualTimeEntry(data: any): Promise<any> {
    return this.post("/api/time-entries/manual", data);
  }

  /**
   * Get all time entries for a task.
   */
  async getTaskTimeEntries(taskId: number): Promise<any[]> {
    return this.get(`/api/time-entries/task/${taskId}`);
  }

  /**
   * Get the currently running timer.
   */
  async getRunningTimer(): Promise<any | null> {
    return this.get("/api/time-entries/running");
  }

  /**
   * Get all time entries for the current user.
   */
  async getAllTimeEntries(): Promise<any[]> {
    return this.get("/api/time-entries/");
  }

  /**
   * Update a time entry's description.
   */
  async updateTimeEntry(entryId: number, description: string): Promise<any> {
    return this.put(`/api/time-entries/${entryId}`, { description });
  }

  /**
   * Delete a time entry.
   */
  async deleteTimeEntry(entryId: number): Promise<void> {
    return this.delete(`/api/time-entries/${entryId}`);
  }

  // ============================================
  // Task Template API Methods
  // ============================================

  /**
   * Create a new task template.
   */
  async createTemplate(data: any): Promise<any> {
    return this.post("/api/templates/", data);
  }

  /**
   * Get all templates for the current user.
   */
  async listTemplates(): Promise<any[]> {
    return this.get("/api/templates/");
  }

  /**
   * Get a specific template.
   */
  async getTemplate(templateId: number): Promise<any> {
    return this.get(`/api/templates/${templateId}`);
  }

  /**
   * Update a template.
   */
  async updateTemplate(templateId: number, data: any): Promise<any> {
    return this.put(`/api/templates/${templateId}`, data);
  }

  /**
   * Delete a template.
   */
  async deleteTemplate(templateId: number): Promise<void> {
    return this.delete(`/api/templates/${templateId}`);
  }

  /**
   * Create a task from a template.
   */
  async createTaskFromTemplate(templateId: number): Promise<any> {
    return this.post(`/api/templates/${templateId}/create-task`, {});
  }

  // ============================================
  // Notification API Methods
  // ============================================

  /**
   * Get all notifications for the current user.
   */
  async getNotifications(unreadOnly: boolean = false): Promise<any[]> {
    const params = unreadOnly ? "?unread_only=true" : "";
    return this.get(`/api/notifications/${params}`);
  }

  /**
   * Mark a notification as read.
   */
  async markNotificationAsRead(notificationId: number): Promise<any> {
    return this.post(`/api/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read.
   */
  async markAllNotificationsAsRead(): Promise<void> {
    return this.post("/api/notifications/mark-all-read", {});
  }

  /**
   * Delete a notification.
   */
  async deleteNotification(notificationId: number): Promise<void> {
    return this.delete(`/api/notifications/${notificationId}`);
  }

  // ============================================
  // Phase 1 Quick Wins: Enhanced Search & Bulk Operations
  // Feature: 005-quick-wins-ux
  // ============================================

  /**
   * Search tasks with advanced filters.
   *
   * User Story: US6 (Enhanced Search & Filters)
   * Supports filter syntax: is:completed, priority:high, due:today, etc.
   */
  async searchTasks(request: {
    query?: string;
    filters?: any;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return this.post("/api/tasks/search", request);
  }

  /**
   * Bulk update multiple tasks.
   *
   * User Story: US4 (Bulk Task Operations)
   * Can update any task fields for multiple tasks at once
   */
  async bulkUpdateTasks(request: { task_ids: number[]; updates: any }): Promise<any> {
    return this.post("/api/tasks/bulk-update", request);
  }

  /**
   * Bulk delete multiple tasks.
   *
   * User Story: US4 (Bulk Task Operations)
   * Frontend should show confirmation dialog before calling this
   */
  async bulkDeleteTasks(request: { task_ids: number[] }): Promise<any> {
    return this.post("/api/tasks/bulk-delete", request);
  }

  /**
   * Reorder tasks by providing new sort order.
   *
   * User Story: US3 (Drag & Drop Task Reordering)
   * Array position determines sort_order (index 0 = sort_order 0, etc.)
   */
  async reorderTasks(taskIds: number[]): Promise<any> {
    return this.put("/api/tasks/reorder", taskIds);
  }

}

/**
 * Singleton API client instance.
 * Use this throughout the application.
 */
export const api = new ApiClient();
