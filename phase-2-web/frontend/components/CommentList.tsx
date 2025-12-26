"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Comment, CommentCreate } from "@/types/comment";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface CommentListProps {
  taskId: number;
}

export default function CommentList({ taskId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await api.getComments(taskId);
      setComments(fetchedComments);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCommentContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const commentData: CommentCreate = {
        content: newCommentContent.trim(),
      };

      const newComment = await api.createComment(taskId, commentData);
      setComments([newComment, ...comments]); // Add to top (newest first)
      setNewCommentContent("");
      setIsAdding(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create comment");
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      const updated = await api.updateComment(taskId, commentId, {
        content: editContent.trim(),
      });
      setComments(comments.map((c) => (c.id === commentId ? updated : c)));
      setEditingId(null);
      setEditContent("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update comment");
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await api.deleteComment(taskId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setError(null);
  };

  const cancelAdd = () => {
    setIsAdding(false);
    setNewCommentContent("");
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="mt-3 text-sm text-gray-500">Loading comments...</div>
    );
  }

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">
          Comments {comments.length > 0 && `(${comments.length})`}
        </h4>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            + Add Comment
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">
          {error}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
          <textarea
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleAdd}>
              Add Comment
            </Button>
            <Button size="sm" variant="outline" onClick={cancelAdd}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-3 bg-gray-50 rounded border border-gray-200"
          >
            {editingId === comment.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {comment.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                    {comment.updated_at !== comment.created_at && " (edited)"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && !isAdding && (
        <p className="text-sm text-gray-500 text-center py-4">
          No comments yet. Add context or updates to this task!
        </p>
      )}
    </div>
  );
}
