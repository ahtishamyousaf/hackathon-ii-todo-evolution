"use client";

/**
 * DraggableTaskItem component - A wrapper around TaskItem that adds drag functionality.
 *
 * Uses @dnd-kit/sortable for drag-and-drop reordering.
 *
 * Features:
 * - Draggable task items with visual feedback
 * - Drag handle icon indicator
 * - Smooth animations during drag
 * - Accessibility support
 * - Dark mode support
 *
 * Usage:
 * <DraggableTaskItem
 *   task={task}
 *   onUpdate={handleUpdate}
 *   onDelete={handleDelete}
 *   onEdit={handleEdit}
 * />
 *
 * Note: Must be used within a DndContext and SortableContext:
 * <DndContext>
 *   <SortableContext items={taskIds}>
 *     <DraggableTaskItem task={task} />
 *   </SortableContext>
 * </DndContext>
 */

import { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskItem from "./TaskItem";
import type { Task } from "@/types/task";

interface DraggableTaskItemProps {
  /** Task to display */
  task: Task;
  /** Callback when task is updated */
  onUpdate?: (task: Task) => void;
  /** Callback when task is deleted */
  onDelete?: (taskId: number) => void;
  /** Callback when edit is requested */
  onEdit?: (task: Task) => void;
  /** Whether this task is selected (for bulk operations) */
  isSelected?: boolean;
  /** Callback when selection is toggled */
  onToggleSelection?: (shiftKey: boolean) => void;
  /** Whether this task is currently focused (for keyboard navigation) */
  isFocused?: boolean;
  /** Callback when task is focused */
  onFocus?: () => void;
  /** Custom class name for the wrapper */
  className?: string;
  /** Show drag handle (default: true) */
  showDragHandle?: boolean;
}

export default function DraggableTaskItem({
  task,
  onUpdate,
  onDelete,
  onEdit,
  isSelected,
  onToggleSelection,
  isFocused,
  onFocus,
  className,
  showDragHandle = true,
}: DraggableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-200",
        isDragging && "z-50 shadow-2xl",
        isOver && "scale-105",
        className
      )}
    >
      {/* Drag handle */}
      {showDragHandle && (
        <div
          className={cn(
            "absolute -left-2 top-1/2 -translate-y-1/2 z-10",
            "opacity-0 group-hover:opacity-100 transition-opacity",
            isDragging && "opacity-100",
            "cursor-grab active:cursor-grabbing",
            "select-none"
          )}
          {...attributes}
          {...listeners}
          aria-label={`Drag handle for "${task.title}"`}
        >
          <div
            className={cn(
              "p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600",
              "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300",
              "transition-colors bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
            )}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* Task item - no extra padding needed */}
      <div onClick={onFocus}>
        <TaskItem
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelected={isSelected}
          onToggleSelection={onToggleSelection}
          isFocused={isFocused}
        />
      </div>

      {/* Visual feedback during drag over */}
      {isOver && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none",
            "border-2 border-blue-400 dark:border-blue-500",
            "bg-blue-50 dark:bg-blue-900/20",
            "opacity-50"
          )}
        />
      )}
    </div>
  );
}
