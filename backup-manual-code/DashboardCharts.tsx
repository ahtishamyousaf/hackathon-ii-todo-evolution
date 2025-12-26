"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { DashboardStats } from "@/types/dashboard";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export default function DashboardCharts() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if token is available before fetching
  const hasToken = api.getToken() !== null;

  useEffect(() => {
    if (hasToken) {
      fetchStats();
    } else {
      setIsLoading(false);
    }
  }, [hasToken]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const fetchedStats = await api.getDashboardStats();
      setStats(fetchedStats);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err instanceof Error ? err.message : "Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || "Failed to load statistics"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max value for scaling charts
  const maxCategoryCount = Math.max(...stats.tasks_by_category.map(c => c.count), 1);
  const maxPriorityCount = Math.max(stats.tasks_by_priority.high, stats.tasks_by_priority.medium, stats.tasks_by_priority.low, 1);
  const maxTrendValue = Math.max(...stats.completion_trends.map(t => Math.max(t.completed, t.created)), 1);

  return (
    <div className="space-y-8">
      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-4 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 dark:from-blue-900/20 dark:via-blue-800/20 dark:to-blue-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 dark:bg-blue-700/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 animate-pulse-subtle">
                  {stats.completion_rate}%
                </div>
              </div>
              <div className="text-4xl animate-bounce-subtle">📊</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 relative z-10">
              {stats.completed_tasks} of {stats.total_tasks} tasks
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-4 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 dark:from-orange-900/20 dark:via-orange-800/20 dark:to-orange-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 dark:bg-orange-700/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</div>
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 animate-pulse-subtle">
                  {stats.pending_tasks}
                </div>
              </div>
              <div className="text-4xl animate-bounce-subtle">⏳</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 relative z-10">
              Active tasks in progress
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-4 bg-gradient-to-br from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/20 dark:to-red-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 dark:bg-red-700/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Overdue Tasks</div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 animate-pulse-subtle">
                  {stats.overdue_tasks}
                </div>
              </div>
              <div className="text-4xl animate-bounce-subtle">⚠️</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 relative z-10">
              Tasks past due date
            </div>
          </CardContent>
        </Card>

        <Card className="transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
          <CardContent className="p-4 bg-gradient-to-br from-green-50 via-green-100 to-green-50 dark:from-green-900/20 dark:via-green-800/20 dark:to-green-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 dark:bg-green-700/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Subtasks</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 animate-pulse-subtle">
                  {stats.completed_subtasks}/{stats.total_subtasks}
                </div>
              </div>
              <div className="text-4xl animate-bounce-subtle">✅</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 relative z-10">
              Checklist items completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks by Priority */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Priority</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">High</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.tasks_by_priority.high}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-red-500 dark:bg-red-600 h-3 rounded-full transition-all duration-500 ease-out hover:bg-red-600 dark:hover:bg-red-500 cursor-pointer shadow-lg hover:shadow-xl"
                    style={{ width: `${(stats.tasks_by_priority.high / maxPriorityCount) * 100}%` }}
                    title={`${stats.tasks_by_priority.high} high priority tasks`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Medium</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.tasks_by_priority.medium}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-yellow-500 dark:bg-yellow-600 h-3 rounded-full transition-all duration-500 ease-out hover:bg-yellow-600 dark:hover:bg-yellow-500 cursor-pointer shadow-lg hover:shadow-xl"
                    style={{ width: `${(stats.tasks_by_priority.medium / maxPriorityCount) * 100}%` }}
                    title={`${stats.tasks_by_priority.medium} medium priority tasks`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Low</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.tasks_by_priority.low}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-green-500 dark:bg-green-600 h-3 rounded-full transition-all duration-500 ease-out hover:bg-green-600 dark:hover:bg-green-500 cursor-pointer shadow-lg hover:shadow-xl"
                    style={{ width: `${(stats.tasks_by_priority.low / maxPriorityCount) * 100}%` }}
                    title={`${stats.tasks_by_priority.low} low priority tasks`}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Category */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks by Category</h3>
          </CardHeader>
          <CardContent>
            {stats.tasks_by_category.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Donut Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {(() => {
                        const total = stats.tasks_by_category.reduce((sum, cat) => sum + cat.count, 0);
                        let currentAngle = 0;
                        const colors = [
                          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
                          '#ec4899', '#06b6d4', '#84cc16'
                        ];

                        return stats.tasks_by_category.map((category, index) => {
                          const percentage = (category.count / total) * 100;
                          const angle = (percentage / 100) * 360;
                          const radius = 40;
                          const circumference = 2 * Math.PI * radius;
                          const strokeDasharray = `${(angle / 360) * circumference} ${circumference}`;
                          const rotation = currentAngle;
                          currentAngle += angle;

                          return (
                            <circle
                              key={category.category_id || index}
                              cx="50"
                              cy="50"
                              r={radius}
                              fill="none"
                              stroke={colors[index % colors.length]}
                              strokeWidth="20"
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset="0"
                              style={{
                                transformOrigin: '50% 50%',
                                transform: `rotate(${rotation}deg)`,
                              }}
                              className="transition-all hover:opacity-80"
                            >
                              <title>{`${category.category_name}: ${category.count} tasks (${percentage.toFixed(1)}%)`}</title>
                            </circle>
                          );
                        });
                      })()}
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {stats.tasks_by_category.reduce((sum, cat) => sum + cat.count, 0)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Total Tasks</div>
                    </div>
                  </div>
                </div>

                {/* Category List */}
                <div className="space-y-3 flex flex-col justify-center">
                  {stats.tasks_by_category.map((category, index) => {
                    const colors = [
                      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
                      '#ec4899', '#06b6d4', '#84cc16'
                    ];
                    const total = stats.tasks_by_category.reduce((sum, cat) => sum + cat.count, 0);
                    const percentage = ((category.count / total) * 100).toFixed(1);

                    return (
                      <div key={category.category_id || 0} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors[index % colors.length] }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {category.category_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{percentage}%</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{category.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No categories yet. Create categories to organize your tasks!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Overview */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Weekly Activity</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Task completion over the last 7 days</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {stats.completion_trends.map((trend) => {
              const date = new Date(trend.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();

              // Calculate intensity based on completed tasks (0-4+ scale)
              const intensity = trend.completed === 0 ? 0 :
                               trend.completed === 1 ? 1 :
                               trend.completed === 2 ? 2 :
                               trend.completed === 3 ? 3 : 4;

              const intensityColors = [
                'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800',
                'bg-green-300 dark:bg-green-700/50 border border-green-400 dark:border-green-600',
                'bg-green-500 dark:bg-green-600/70 border border-green-600 dark:border-green-500',
                'bg-green-700 dark:bg-green-500 border border-green-800 dark:border-green-400',
              ];

              return (
                <div key={trend.date} className="flex flex-col items-center">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">{dayName}</div>
                  <div
                    className={`w-full aspect-square rounded-lg transition-all hover:scale-110 cursor-pointer ${intensityColors[intensity]}`}
                    title={`${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\n${trend.completed} completed, ${trend.created} created`}
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-300">{dayNum}</div>
                      {trend.completed > 0 && (
                        <div className="text-[10px] font-bold text-green-700 dark:text-green-300">{trend.completed}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
              <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"></div>
              <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-700/50 border border-green-400 dark:border-green-600"></div>
              <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600/70 border border-green-600 dark:border-green-500"></div>
              <div className="w-4 h-4 rounded bg-green-700 dark:bg-green-500 border border-green-800 dark:border-green-400"></div>
            </div>
            <span>More</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
