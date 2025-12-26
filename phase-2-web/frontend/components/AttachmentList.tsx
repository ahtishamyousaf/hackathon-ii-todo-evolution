"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import type { Attachment } from "@/types/attachment";
import Button from "@/components/ui/Button";

interface AttachmentListProps {
  taskId: number;
}

export default function AttachmentList({ taskId }: AttachmentListProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAttachments();
  }, [taskId]);

  const fetchAttachments = async () => {
    setIsLoading(true);
    try {
      const fetchedAttachments = await api.getAttachments(taskId);
      setAttachments(fetchedAttachments);
    } catch (err) {
      console.error("Failed to fetch attachments:", err);
      setError(err instanceof Error ? err.message : "Failed to load attachments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 10MB");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const newAttachment = await api.uploadAttachment(taskId, file);
      setAttachments([newAttachment, ...attachments]);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await api.downloadAttachment(taskId, attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to download file");
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      await api.deleteAttachment(taskId, attachmentId);
      setAttachments(attachments.filter((a) => a.id !== attachmentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete attachment");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
      case "csv":
        return "📊";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "zip":
        return "🗜️";
      case "txt":
      case "md":
        return "📃";
      default:
        return "📎";
    }
  };

  if (isLoading) {
    return (
      <div className="mt-3 text-sm text-gray-500">Loading attachments...</div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Attachments {attachments.length > 0 && `(${attachments.length})`}
        </h4>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv,.zip,.md"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400"
          >
            {isUploading ? "Uploading..." : "+ Add File"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl">{getFileIcon(attachment.filename)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.file_size)} •{" "}
                  {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-2">
              <button
                onClick={() => handleDownload(attachment)}
                className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1"
                title="Download"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleDelete(attachment.id)}
                className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No attachments yet. Upload files to keep them with this task!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-3">
        Supported: PDF, Word, Excel, Images, ZIP, Text (Max 10MB)
      </p>
    </div>
  );
}
