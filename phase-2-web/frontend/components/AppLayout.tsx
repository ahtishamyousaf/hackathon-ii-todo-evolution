"use client";

import { useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import FloatingChatWidget from "./FloatingChatWidget";
import { Menu, Bell, Share2, Search, Keyboard, MessageSquare, X } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onNewTask?: () => void;
}

export default function AppLayout({
  children,
  title,
  subtitle,
  actions,
}: AppLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [keyboardShortcutsOpen, setKeyboardShortcutsOpen] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const handleTaskCreated = () => {
    // Refresh the page to show new task
    window.location.reload();
  };

  const handleSearch = () => {
    // Focus on search bar if it exists on the page
    const searchInput = document.querySelector('input[type="text"][placeholder*="Search"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `Check out my ${title} on Todo App`,
          url: window.location.href,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleProfileClick = () => {
    window.location.href = '/settings';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      {keyboardShortcutsOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setKeyboardShortcutsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setKeyboardShortcutsOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              <KeyboardShortcutsHelp embedded={true} />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        {/* Enhanced Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Mobile menu + Title */}
              <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Page Title */}
                <div className="flex-1">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions + Icons */}
              <div className="flex items-center gap-3">
                {/* Custom Actions */}
                {actions}

                {/* Keyboard Shortcuts Button */}
                <button
                  onClick={() => setKeyboardShortcutsOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Keyboard Shortcuts"
                >
                  <Keyboard className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* AI Chat Button */}
                <button
                  onClick={() => router.push('/chat')}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="AI Chat"
                >
                  <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Search Button (Mobile Hidden) */}
                <button
                  onClick={handleSearch}
                  className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Search Tasks"
                >
                  <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setNotificationPanelOpen(true)}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Share Button (Desktop Only) */}
                <button
                  onClick={handleShare}
                  className="hidden sm:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>

                {/* User Avatar */}
                <div
                  onClick={handleProfileClick}
                  className="hidden sm:block w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-shadow"
                  title="Profile & Settings"
                >
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget />
    </div>
  );
}
