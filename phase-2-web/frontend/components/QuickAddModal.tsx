"use client";

import { useState, useEffect, FormEvent } from "react";
import { X, Flag, FolderKanban, Paperclip } from "lucide-react";
import Button from "./ui/Button";
import SmartDatePicker from "./SmartDatePicker";
import FileUploadArea from "./FileUploadArea";
import { api } from "@/lib/api";
import type { TaskCreate, Task } from "@/types/task";
import type { Category } from "@/types/category";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  initialDueDate?: Date;
  editTask?: Task; // Task to edit (if in edit mode)
}

export default function QuickAddModal({
  isOpen,
  onClose,
  onTaskCreated,
  initialDueDate,
  editTask,
}: QuickAddModalProps) {
  const isEditMode = !!editTask;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();

      // If editing, populate form with existing task data
      if (editTask) {
        setTitle(editTask.title);
        setDescription(editTask.description || "");
        setPriority(editTask.priority as "low" | "medium" | "high");
        setDueDate(editTask.due_date ? editTask.due_date.split('T')[0] : "");
        setCategoryId(editTask.category_id || undefined);

        // Load existing attachments
        loadAttachments(editTask.id);
      } else {
        // Set initial due date if provided (create mode)
        if (initialDueDate) {
          // Format date as YYYY-MM-DD in local timezone to avoid timezone shifts
          const year = initialDueDate.getFullYear();
          const month = String(initialDueDate.getMonth() + 1).padStart(2, '0');
          const day = String(initialDueDate.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          setDueDate(dateStr);
        }
      }

      // Focus title input when modal opens
      setTimeout(() => {
        document.getElementById("quick-add-title")?.focus();
      }, 100);
    } else {
      // Reset form when modal closes
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setCategoryId(undefined);
    }
  }, [isOpen, initialDueDate, editTask]);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await api.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const loadAttachments = async (taskId: number) => {
    try {
      const fetchedAttachments = await api.getAttachments(taskId);
      setAttachments(fetchedAttachments);
    } catch (err) {
      console.error("Failed to load attachments:", err);
    }
  };

  const handleFilesUpload = async (files: File[]) => {
    if (!editTask) {
      // Can't upload files for new tasks - need task ID first
      alert("Please save the task first before adding attachments.");
      return;
    }

    try {
      // Upload each file
      const uploadPromises = files.map((file) => api.uploadAttachment(editTask.id, file));
      await Promise.all(uploadPromises);

      // Reload attachments
      await loadAttachments(editTask.id);
      alert(`${files.length} file(s) uploaded successfully!`);
    } catch (err) {
      console.error("Failed to upload files:", err);
      alert("Failed to upload files. Please try again.");
    }
  };

  const handleFileRemove = async (fileId: string | number) => {
    if (!editTask) return;

    try {
      await api.deleteAttachment(editTask.id, Number(fileId));
      // Reload attachments
      await loadAttachments(editTask.id);
    } catch (err) {
      console.error("Failed to delete attachment:", err);
      alert("Failed to delete attachment. Please try again.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const taskData: any = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || undefined,
        category_id: categoryId,
      };

      if (isEditMode && editTask) {
        // Update existing task
        await api.updateTask(editTask.id, taskData);
      } else {
        // Create new task
        await api.createTask(taskData);
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setCategoryId(undefined);

      // Notify parent and close
      onTaskCreated?.();
      onClose();
    } catch (err) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} task:`, err);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} task. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Close on Escape
    if (e.key === "Escape") {
      onClose();
    }
    // Submit on Cmd/Ctrl + Enter
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in zoom-in duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? 'Edit Task' : 'Quick Add Task'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Press <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> to close, <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">⌘/Ctrl</kbd> + <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd> to save
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <input
              id="quick-add-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-lg px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <SmartDatePicker
                value={dueDate}
                onChange={(date) => setDueDate(date || "")}
                label="Due Date"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FolderKanban className="w-4 h-4" />
                Category
              </label>
              <select
                value={categoryId || ""}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* File Attachments Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Paperclip className="w-4 h-4" />
              {showFileUpload ? 'Hide' : 'Add'} Attachments
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                (Images, PDFs, Documents)
              </span>
            </button>

            {showFileUpload && (
              <div className="mt-4">
                {!editTask && (
                  <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Note: Attachments can only be added after the task is created. Save the task first, then edit it to add files.
                    </p>
                  </div>
                )}
                <FileUploadArea
                  onFilesUpload={handleFilesUpload}
                  onFileRemove={handleFileRemove}
                  maxFileSize={10 * 1024 * 1024}
                  maxFiles={5}
                  existingFiles={attachments}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : (isEditMode ? "Update Task" : "Create Task")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
