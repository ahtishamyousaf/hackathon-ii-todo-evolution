"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Button from "./ui/Button";
import { Play, Square, Clock } from "lucide-react";

interface TimeTrackerProps {
  taskId: number;
  taskTitle: string;
}

export default function TimeTracker({ taskId, taskTitle }: TimeTrackerProps) {
  const [runningTimer, setRunningTimer] = useState<any | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkRunningTimer();
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (runningTimer && runningTimer.task_id === taskId) {
      interval = setInterval(() => {
        const start = new Date(runningTimer.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [runningTimer, taskId]);

  const checkRunningTimer = async () => {
    try {
      const timer = await api.getRunningTimer();
      setRunningTimer(timer);
    } catch (error) {
      console.error("Failed to check running timer:", error);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const timer = await api.startTimer(taskId);
      setRunningTimer(timer);
    } catch (error: any) {
      alert(error.message || "Failed to start timer");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!runningTimer) return;

    setLoading(true);
    try {
      await api.stopTimer(runningTimer.id);
      setRunningTimer(null);
      setElapsedTime(0);
    } catch (error: any) {
      alert(error.message || "Failed to stop timer");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isRunningForThisTask = runningTimer && runningTimer.task_id === taskId;
  const isRunningForOtherTask = runningTimer && runningTimer.task_id !== taskId;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <Clock className="w-5 h-5 text-gray-500" />

      {isRunningForThisTask ? (
        <>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-gray-500">Timer running</div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStop}
            disabled={loading}
            className="gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isRunningForOtherTask
                ? "Timer running on another task"
                : "Start tracking time"}
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            disabled={loading || isRunningForOtherTask}
            className="gap-2"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
        </>
      )}
    </div>
  );
}
