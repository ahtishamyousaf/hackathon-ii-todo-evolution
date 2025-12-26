"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { Task } from "@/types/task";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import QuickAddModal from "@/components/QuickAddModal";
import { Plus } from "lucide-react";

type CalendarView = "day" | "week" | "month";

export default function CalendarView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<CalendarView>("week");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Only fetch if we have a token
    if (api.getToken()) {
      fetchTasks();
    } else {
      setIsLoading(false);
    }
  }, [currentDate]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch all tasks (we'll filter by month client-side)
      const fetchedTasks = await api.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getTasksForDate = (day: number) => {
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );

    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === targetDate.getDate() &&
        taskDate.getMonth() === targetDate.getMonth() &&
        taskDate.getFullYear() === targetDate.getFullYear()
      );
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Week view helpers
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Day view helpers
  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getOverdueTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tasks.filter((task) => {
      if (!task.due_date || task.completed) return false;
      const taskDate = new Date(task.due_date);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today;
    });
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const toggleTaskComplete = async (taskId: number, completed: boolean) => {
    try {
      await api.updateTask(taskId, { completed: !completed });
      await fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setQuickAddOpen(true);
  };

  const handleTaskCreated = () => {
    setQuickAddOpen(false);
    fetchTasks(); // Refresh tasks after creation
  };

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  // Render Day View
  const renderDayView = () => {
    const dayTasks = getTasksForDay(currentDate);
    const overdueTasks = getOverdueTasks();
    const highPriorityTasks = dayTasks.filter(
      (t) => t.priority === "high" && !t.completed
    );
    const otherTasks = dayTasks.filter(
      (t) => t.priority !== "high" && !t.completed
    );
    const completedTasks = dayTasks.filter((t) => t.completed);

    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
        </div>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <div className="p-4">
              <h4 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <span>🔴</span> Overdue ({overdueTasks.length})
              </h4>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskComplete} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* High Priority Tasks */}
        {highPriorityTasks.length > 0 && (
          <Card>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>⏰</span> Priority Tasks ({highPriorityTasks.length})
              </h4>
              <div className="space-y-2">
                {highPriorityTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskComplete} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Other Tasks */}
        {otherTasks.length > 0 && (
          <Card>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📋</span> Other Tasks ({otherTasks.length})
              </h4>
              <div className="space-y-2">
                {otherTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskComplete} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <Card>
            <div className="p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>✅</span> Completed Today ({completedTasks.length})
              </h4>
              <div className="space-y-2">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={toggleTaskComplete} />
                ))}
              </div>
            </div>
          </Card>
        )}

        {dayTasks.length === 0 && overdueTasks.length === 0 && (
          <Card>
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg">No tasks for this day</p>
              <p className="text-sm mt-2">Enjoy your free time!</p>
            </div>
          </Card>
        )}
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <Card>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-3">
            {weekDays.map((day, index) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentDay =
                day.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-[300px] border rounded-lg p-3 ${
                    isCurrentDay
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 border-2"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {/* Day header */}
                  <div className="text-center mb-3 pb-2 border-b dark:border-gray-700">
                    <div
                      className={`text-xs font-semibold uppercase ${
                        isCurrentDay ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        isCurrentDay ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {dayTasks.filter((t) => !t.completed).length} tasks
                      </div>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-2">
                    {dayTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${
                          task.completed
                            ? "bg-green-50 border-green-200 line-through text-green-700"
                            : task.priority === "high"
                            ? "bg-red-50 border-red-200 text-red-700"
                            : task.priority === "medium"
                            ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                        onClick={() => toggleTaskComplete(task.id, task.completed)}
                        title={task.title}
                      >
                        <div className="font-medium truncate">{task.title}</div>
                        {task.description && (
                          <div className="truncate text-xs opacity-75 mt-1">
                            {task.description}
                          </div>
                        )}
                      </div>
                    ))}
                    {dayTasks.length > 5 && (
                      <div className="text-xs text-center text-gray-500 py-1">
                        +{dayTasks.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  // Render Month View
  const renderMonthView = () => {
    return (
      <Card>
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="h-24 bg-gray-50 rounded" />
            ))}

            {/* Actual days */}
            {days.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isCurrentDay = isToday(day);
              const isPast = isPastDate(day);

              // Create date at noon to avoid timezone shifting to previous day
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
              return (
                <div
                  key={day}
                  onClick={() => handleDateClick(dateObj)}
                  className={`h-24 border rounded-lg p-2 overflow-hidden transition-all hover:shadow-md cursor-pointer ${
                    isCurrentDay
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 border-2"
                      : isPast
                      ? "bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        isCurrentDay
                          ? "text-blue-600"
                          : isPast
                          ? "text-gray-400"
                          : "text-gray-700"
                      }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Tasks for this day */}
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.completed
                            ? "bg-green-100 text-green-700 line-through"
                            : task.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        title={task.title}
                      >
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with View Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {view === "day"
              ? currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : view === "week"
              ? `Week of ${getWeekDays()[0].toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`
              : getMonthName(currentDate)}
          </h2>

          {/* View Switcher */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView("day")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "day"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                view === "month"
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === "day") previousDay();
              else if (view === "week") previousWeek();
              else previousMonth();
            }}
          >
            ← Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (view === "day") nextDay();
              else if (view === "week") nextWeek();
              else nextMonth();
            }}
          >
            Next →
          </Button>
        </div>
      </div>

      {/* Render appropriate view */}
      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}

      {/* Legend */}
      {view === "month" && (
        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-50 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-400 rounded"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 rounded"></div>
            <span>Completed</span>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onTaskCreated={handleTaskCreated}
        initialDueDate={selectedDate || undefined}
      />
    </div>
  );
}

// Task Item Component for Day View
function TaskItem({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: number, completed: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
        task.completed
          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          : task.priority === "high"
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
          : task.priority === "medium"
          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
      onClick={() => onToggle(task.id, task.completed)}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => {}}
        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
      />
      <div className="flex-1 min-w-0">
        <h5
          className={`font-medium ${
            task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"
          }`}
        >
          {task.title}
        </h5>
        {task.description && (
          <p
            className={`text-sm mt-1 ${
              task.completed ? "text-gray-400 dark:text-gray-500" : "text-gray-600 dark:text-gray-300"
            }`}
          >
            {task.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span
            className={`px-2 py-0.5 rounded-full ${
              task.priority === "high"
                ? "bg-red-100 text-red-700"
                : task.priority === "medium"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {task.priority}
          </span>
          {task.category_id && <span>Category: {task.category_id}</span>}
        </div>
      </div>
    </div>
  );
}
