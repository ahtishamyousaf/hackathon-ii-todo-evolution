/**
 * Task event system for real-time updates across components.
 *
 * Allows chat widget to notify task lists when tasks are modified.
 */

type TaskEventType = 'task-created' | 'task-updated' | 'task-completed' | 'task-deleted';

interface TaskEventDetail {
  taskId?: number;
  taskTitle?: string;
  action: TaskEventType;
}

class TaskEventEmitter {
  private listeners: Map<TaskEventType, Set<(detail: TaskEventDetail) => void>> = new Map();

  /**
   * Emit a task event to all listeners.
   */
  emit(type: TaskEventType, detail: TaskEventDetail) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => listener(detail));
    }

    // Also emit to 'any' listeners
    const anyListeners = this.listeners.get('task-updated' as TaskEventType);
    if (anyListeners && type !== 'task-updated') {
      anyListeners.forEach(listener => listener(detail));
    }
  }

  /**
   * Subscribe to task events.
   */
  on(type: TaskEventType | 'any', callback: (detail: TaskEventDetail) => void) {
    const eventType = type === 'any' ? 'task-updated' : type;

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Remove all listeners.
   */
  clear() {
    this.listeners.clear();
  }
}

// Global singleton instance
export const taskEvents = new TaskEventEmitter();

// Convenience functions
export function notifyTaskCreated(taskId: number, taskTitle: string) {
  taskEvents.emit('task-created', { taskId, taskTitle, action: 'task-created' });
}

export function notifyTaskUpdated(taskId: number, taskTitle: string) {
  taskEvents.emit('task-updated', { taskId, taskTitle, action: 'task-updated' });
}

export function notifyTaskCompleted(taskId: number, taskTitle: string) {
  taskEvents.emit('task-completed', { taskId, taskTitle, action: 'task-completed' });
}

export function notifyTaskDeleted(taskId: number, taskTitle: string) {
  taskEvents.emit('task-deleted', { taskId, taskTitle, action: 'task-deleted' });
}
