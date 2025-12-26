"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import CategoryManager from "@/components/CategoryManager";
import DashboardCharts from "@/components/DashboardCharts";
import { Card, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Plus, CheckCircle, Calendar, List, LayoutGrid } from "lucide-react";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && api.getToken()) {
      fetchRecentTasks();
    }
  }, [isAuthenticated]);

  const fetchRecentTasks = async () => {
    try {
      const tasks = await api.getTasks();
      // Get 5 most recent incomplete tasks
      const incompleteTasks = tasks
        .filter(t => !t.completed)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentTasks(incompleteTasks);
    } catch (err) {
      console.error("Failed to fetch recent tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppLayout
      title="Dashboard"
      subtitle={`Welcome back, ${user.email?.split("@")[0] || "User"}`}
    >
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/tasks">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-blue-500">
              <CardContent className="p-4 text-center">
                <List className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">All Tasks</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/calendar">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-purple-500">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Calendar</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/kanban">
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-green-500">
              <CardContent className="p-4 text-center">
                <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Kanban</p>
              </CardContent>
            </Card>
          </Link>
          <button
            onClick={() => router.push("/tasks")}
            className="w-full"
          >
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-orange-500">
              <CardContent className="p-4 text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Task</p>
              </CardContent>
            </Card>
          </button>
        </div>
      </div>

      {/* Dashboard Analytics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analytics & Insights
        </h2>
        <DashboardCharts />
      </div>

      {/* Recent Tasks */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Tasks
          </h2>
          <Link href="/tasks">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-4">
            {loadingTasks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading tasks...</span>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.priority === "high"
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : task.priority === "medium"
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-600 dark:text-gray-400">No active tasks</p>
                <Link href="/tasks">
                  <Button size="sm" className="mt-3">
                    Create Your First Task
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Management Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Categories
        </h2>
        <CategoryManager />
      </div>
    </AppLayout>
  );
}
