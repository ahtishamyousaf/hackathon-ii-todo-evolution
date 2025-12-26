"use client";

/**
 * FileUploadArea component for drag-and-drop file uploads.
 *
 * Features:
 * - Drag-and-drop file upload using react-dropzone
 * - File size validation (max 10MB)
 * - Upload progress tracking
 * - List of uploaded files with delete buttons
 * - Error handling and display
 * - Dark mode support
 *
 * Usage:
 * <FileUploadArea
 *   onFilesUpload={handleUpload}
 *   onFileRemove={handleRemove}
 *   uploadedFiles={files}
 *   maxFileSize={10 * 1024 * 1024}
 * />
 */

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface FileUploadAreaProps {
  /** Callback when files are uploaded */
  onFilesUpload?: (files: File[]) => Promise<void>;
  /** Callback when a file is removed */
  onFileRemove?: (fileId: string) => Promise<void>;
  /** List of already uploaded files */
  uploadedFiles?: UploadedFile[];
  /** Maximum file size in bytes (default: 10MB) */
  maxFileSize?: number;
  /** Allowed file types (default: all) */
  acceptedFileTypes?: Record<string, string[]>;
  /** Maximum number of files (default: unlimited) */
  maxFiles?: number;
}

interface FileWithProgress {
  file: File;
  progress: number;
  error?: string;
}

export default function FileUploadArea({
  onFilesUpload,
  onFileRemove,
  uploadedFiles = [],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes,
  maxFiles,
}: FileUploadAreaProps) {
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setGlobalError(null);

      // Validate files
      const validationErrors: Record<string, string> = {};
      const filesToUpload: File[] = [];

      for (const file of acceptedFiles) {
        // Check file size
        if (file.size > maxFileSize) {
          validationErrors[file.name] = `File exceeds ${formatBytes(maxFileSize)} limit`;
          continue;
        }

        // Check max files
        if (maxFiles && uploadedFiles.length + filesToUpload.length >= maxFiles) {
          validationErrors[file.name] = `Maximum ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed`;
          continue;
        }

        filesToUpload.push(file);
      }

      // Show validation errors if any
      if (Object.keys(validationErrors).length > 0) {
        const errorMessages = Object.entries(validationErrors)
          .map(([name, err]) => `${name}: ${err}`)
          .join("\n");
        setGlobalError(`Validation failed:\n${errorMessages}`);
      }

      if (filesToUpload.length === 0) {
        return;
      }

      // Set up files with progress
      const newFiles = filesToUpload.map((file) => ({
        file,
        progress: 0,
        error: undefined,
      }));
      setFilesWithProgress((prev) => [...prev, ...newFiles]);

      // Upload files
      setIsUploading(true);
      try {
        if (onFilesUpload) {
          // Simulate progress updates
          const uploadPromises = filesToUpload.map((file, index) => {
            return new Promise<void>((resolve) => {
              // Simulate upload with progress updates
              let progress = 0;
              const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress > 100) progress = 100;

                setFilesWithProgress((prev) =>
                  prev.map((f, i) =>
                    i === newFiles.length - filesToUpload.length + index
                      ? { ...f, progress }
                      : f
                  )
                );

                if (progress >= 100) {
                  clearInterval(interval);
                  resolve();
                }
              }, 100);
            });
          });

          await Promise.all(uploadPromises);
          await onFilesUpload(filesToUpload);
        }

        // Clear uploaded files
        setFilesWithProgress([]);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        setGlobalError(errorMessage);

        // Mark files with error
        setFilesWithProgress((prev) =>
          prev.map((f) => ({
            ...f,
            error: errorMessage,
            progress: 0,
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [maxFileSize, maxFiles, uploadedFiles.length, onFilesUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    disabled: isUploading || isRemoving !== null,
  });

  const handleRemoveFile = async (fileId: string) => {
    if (!onFileRemove) return;

    setIsRemoving(fileId);
    try {
      await onFileRemove(fileId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove file";
      setGlobalError(errorMessage);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleRemoveUploadingFile = (index: number) => {
    setFilesWithProgress((prev) => prev.filter((_, i) => i !== index));
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.startsWith("video/")) return "🎥";
    if (type.startsWith("audio/")) return "🎵";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    return "📎";
  };

  return (
    <div className="space-y-4">
      {/* Error message */}
      {globalError && (
        <div
          className={cn(
            "p-4 rounded-lg border flex items-start gap-3",
            "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700"
          )}
        >
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap flex-1">
            {globalError}
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer",
          "transition-colors duration-200",
          isDragActive
            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50",
          isUploading && "opacity-60 cursor-not-allowed",
          (isUploading || isRemoving) && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-2">
          <Upload
            className={cn(
              "w-8 h-8",
              isDragActive
                ? "text-blue-500 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            )}
          />
          <div>
            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {isDragActive ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            Maximum file size: {formatBytes(maxFileSize)}
            {maxFiles && ` • Maximum ${maxFiles} file${maxFiles === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>

      {/* Uploading files with progress */}
      {filesWithProgress.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Uploading ({filesWithProgress.filter((f) => !f.error).length})
          </h3>
          {filesWithProgress.map((item, index) => (
            <div
              key={`${item.file.name}-${index}`}
              className={cn(
                "p-4 rounded-lg border",
                item.error
                  ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{getFileIcon(item.file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatBytes(item.file.size)}
                  </p>

                  {item.error ? (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      Error: {item.error}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
                        {Math.round(item.progress)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveUploadingFile(index)}
                  disabled={isUploading}
                  className={cn(
                    "flex-shrink-0 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700",
                    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  )}
                  title="Remove this file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Uploaded Files ({uploadedFiles.length})
          </h3>
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                "p-4 rounded-lg border",
                "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800",
                "hover:shadow-sm transition-shadow"
              )}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(file.size)} • Uploaded{" "}
                      {file.uploadedAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={isRemoving === file.id}
                  className={cn(
                    "flex-shrink-0 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
                    "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400",
                    "disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  )}
                  title="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filesWithProgress.length === 0 && uploadedFiles.length === 0 && !globalError && (
        <div className="text-center py-8">
          <FileIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No files uploaded yet
          </p>
        </div>
      )}
    </div>
  );
}
