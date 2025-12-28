"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  CheckSquare,
  Moon,
  Sun,
  Plus,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  ListTodo,
  MessageSquare
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onNewTask?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const STORAGE_KEY = "sidebar-collapsed";

export default function Sidebar({ isOpen = true, onClose, onNewTask, onCollapsedChange }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialState = stored === "true";
    setIsCollapsed(initialState);
    onCollapsedChange?.(initialState);
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(STORAGE_KEY, String(newState));
    onCollapsedChange?.(newState);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      section: "main",
    },
    {
      label: "Tasks",
      icon: ListTodo,
      path: "/tasks",
      section: "main",
    },
    {
      label: "AI Chat",
      icon: MessageSquare,
      path: "/chat",
      section: "main",
    },
    {
      label: "Kanban Board",
      icon: LayoutGrid,
      path: "/kanban",
      section: "main",
    },
    {
      label: "Calendar",
      icon: Calendar,
      path: "/calendar",
      section: "main",
    },
  ];

  const supportItems = [
    {
      label: "Settings",
      icon: Settings,
      path: "/settings",
      section: "support",
    },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-30 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "w-20" : "w-64"} flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? "px-4" : ""}`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Todo Manager</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapsed}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm z-40"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Navigation */}
        <nav className={`flex-1 py-6 overflow-y-auto ${isCollapsed ? "px-2" : "px-4"}`}>
          {/* New Task Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                onNewTask?.();
                onClose?.();
              }}
              className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "justify-center gap-2 px-4"} py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md`}
              title={isCollapsed ? "New Task" : undefined}
            >
              <Plus className="w-5 h-5" />
              {!isCollapsed && <span>New Task</span>}
            </button>
          </div>

          {/* Main Menu */}
          <div className="mb-6">
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
                Menu
              </div>
            )}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      onClose?.();
                    }}
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-all ${
                      active
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Support Menu */}
          <div>
            {!isCollapsed && (
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-3">
                Support
              </div>
            )}
            <div className="space-y-1">
              {supportItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      onClose?.();
                    }}
                    className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-all ${
                      active
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Dark Mode Toggle */}
        <div className={`pb-4 ${isCollapsed ? "px-2" : "px-4"}`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-3"} py-2.5 rounded-lg transition-all text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800`}
            title={isCollapsed ? (theme === "dark" ? "Light Mode" : "Dark Mode") : undefined}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!isCollapsed && (
              <span className="font-medium">
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Section */}
        <div className={`border-t border-gray-200 dark:border-gray-700 ${isCollapsed ? "p-2" : "p-4"}`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-2 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
