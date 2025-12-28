"use client";

import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { User, Bell, Palette, Globe, Lock, Mail, Sun, Moon, Clock, FileText, Shield, Keyboard, Tag } from "lucide-react";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import CategoryManager from "@/components/CategoryManager";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotifications();

  // Profile settings
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState({
    taskDue: true,
    taskAssigned: true,
    dailyDigest: false,
    weeklyReport: false
  });

  // App preferences
  const [preferences, setPreferences] = useState({
    defaultPriority: "medium",
    defaultView: "list",
    dateFormat: "MM/DD/YYYY",
    startOfWeek: "monday"
  });

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setDisplayName(user.email?.split("@")[0] || "");
    }
  }, [user]);

  const handleSaveProfile = () => {
    addNotification({
      type: "success",
      title: "Profile Updated",
      message: "Your profile has been updated successfully"
    });
  };

  const handleSaveNotifications = () => {
    addNotification({
      type: "success",
      title: "Preferences Saved",
      message: "Notification preferences updated"
    });
  };

  const handleSavePreferences = () => {
    addNotification({
      type: "success",
      title: "Settings Saved",
      message: "Your preferences have been updated"
    });
  };

  return (
    <AppLayout title="Settings" subtitle="Manage your account and preferences">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Settings */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="your@email.com"
                />
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveProfile}>
                  Save Profile Changes
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-600" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Theme</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {theme === "dark" ? "Dark mode" : "Light mode"}
                    </div>
                  </div>
                </div>
                <Button onClick={toggleTheme} variant="outline">
                  Toggle Theme
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">Task Due Reminders</span>
                <input
                  type="checkbox"
                  checked={emailNotifs.taskDue}
                  onChange={(e) => setEmailNotifs({...emailNotifs, taskDue: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">Task Assignments</span>
                <input
                  type="checkbox"
                  checked={emailNotifs.taskAssigned}
                  onChange={(e) => setEmailNotifs({...emailNotifs, taskAssigned: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">Daily Digest</span>
                <input
                  type="checkbox"
                  checked={emailNotifs.dailyDigest}
                  onChange={(e) => setEmailNotifs({...emailNotifs, dailyDigest: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <span className="font-medium text-gray-900 dark:text-white">Weekly Report</span>
                <input
                  type="checkbox"
                  checked={emailNotifs.weeklyReport}
                  onChange={(e) => setEmailNotifs({...emailNotifs, weeklyReport: e.target.checked})}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <div className="pt-4">
                <Button onClick={handleSaveNotifications}>
                  Save Notification Settings
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* App Preferences */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">App Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Priority
                </label>
                <select
                  value={preferences.defaultPriority}
                  onChange={(e) => setPreferences({...preferences, defaultPriority: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default View
                </label>
                <select
                  value={preferences.defaultView}
                  onChange={(e) => setPreferences({...preferences, defaultView: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="list">List View</option>
                  <option value="kanban">Kanban Board</option>
                  <option value="calendar">Calendar View</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Format
                </label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start of Week
                </label>
                <select
                  value={preferences.startOfWeek}
                  onChange={(e) => setPreferences({...preferences, startOfWeek: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="sunday">Sunday</option>
                  <option value="monday">Monday</option>
                  <option value="saturday">Saturday</option>
                </select>
              </div>
              <div className="pt-4">
                <Button onClick={handleSavePreferences}>
                  Save App Preferences
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Category Management */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Categories</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create and manage custom categories to organize your tasks
            </p>
            <CategoryManager />
          </div>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Keyboard className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            </div>
            <KeyboardShortcutsHelp embedded={true} />
          </div>
        </Card>

        {/* Available Features */}
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Features</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Time Tracking</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Track time spent on tasks</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <FileText className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Task Templates</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Save and reuse task templates</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
                <Bell className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Notifications</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Real-time task updates</div>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <Mail className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Email Reminders</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Get email notifications</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </AppLayout>
  );
}
