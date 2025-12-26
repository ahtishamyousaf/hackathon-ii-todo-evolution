"use client";

import { useState, ReactNode, cloneElement, isValidElement } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import Sidebar from "./Sidebar";
// import QuickAddModal from "./QuickAddModal"; // TODO: Restore when implementing Phase III features
import NotificationPanel from "./NotificationPanel";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { Menu, Bell, Share2, Search, Plus } from "lucide-react";
import Button from "./ui/Button";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  // Keyboard shortcut: Cmd/Ctrl + K (disabled - QuickAddModal not available in MVP)
  // useKeyboardShortcut(() => setQuickAddOpen(true), {
  //   key: "k",
  //   ctrlKey: true,
  //   metaKey: true,
  // });

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

  // Clone actions and inject onClick handler if it's a button-like element
  const enhancedActions = isValidElement(actions)
    ? cloneElement(actions as React.ReactElement<any>, {
        onClick: () => setQuickAddOpen(true),
      })
    : actions;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewTask={() => setQuickAddOpen(true)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Quick Add Modal - Disabled in MVP */}
      {/* <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onTaskCreated={handleTaskCreated}
      /> */}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Floating Quick Add Button - Disabled in MVP */}
      {/* <button
        onClick={() => setQuickAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 group"
        title="Quick Add Task (Ctrl+K)"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Quick Add (⌘K)
        </span>
      </button> */}

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
                {enhancedActions}

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
    </div>
  );
}
