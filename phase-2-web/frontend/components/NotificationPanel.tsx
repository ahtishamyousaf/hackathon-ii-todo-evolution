"use client";

import { X, CheckCheck, Trash2, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { useNotifications, type Notification } from "@/contexts/NotificationContext";
import Button from "./ui/Button";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getNotificationBg = (type: Notification["type"], read: boolean) => {
    const opacity = read ? "bg-opacity-50 dark:bg-opacity-30" : "";
    switch (type) {
      case "success":
        return `bg-green-50 dark:bg-green-900/20 ${opacity}`;
      case "warning":
        return `bg-yellow-50 dark:bg-yellow-900/20 ${opacity}`;
      case "error":
        return `bg-red-50 dark:bg-red-900/20 ${opacity}`;
      default:
        return `bg-blue-50 dark:bg-blue-900/20 ${opacity}`;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.onAction) {
      notification.onAction();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-16">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-800 h-full w-full max-w-md shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="gap-1.5 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 text-5xl mb-4">🔔</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-all cursor-pointer hover:shadow-md ${getNotificationBg(
                  notification.type,
                  notification.read
                )} ${
                  !notification.read
                    ? "ring-2 ring-blue-500/50 dark:ring-blue-400/50"
                    : ""
                }`}
              >
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute top-4 right-4 w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(notification.timestamp)}
                      </span>
                      {notification.actionLabel && (
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {notification.actionLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notification.id);
                  }}
                  className="absolute bottom-3 right-3 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove notification"
                >
                  <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
