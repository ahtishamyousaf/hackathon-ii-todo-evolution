"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useKeyboardShortcuts } from "@/contexts/KeyboardShortcutsContext";
import AppLayout from "@/components/AppLayout";
import TasksList from "@/components/TasksList";
import QuickAddModal from "@/components/QuickAddModal";
import KeyboardShortcutButton from "@/components/KeyboardShortcutButton";
import Button from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { registerHandler, unregisterHandler } = useKeyboardShortcuts();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Register keyboard shortcuts
  useEffect(() => {
    // 'N' key - Open new task modal
    registerHandler('newTask', () => {
      setQuickAddOpen(true);
    });

    // '/' key - Focus search (handled in TasksList component)
    registerHandler('focusSearch', () => {
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    });

    // 'Escape' key - Close modal
    registerHandler('closeModal', () => {
      setQuickAddOpen(false);
    });

    return () => {
      unregisterHandler('newTask');
      unregisterHandler('focusSearch');
      unregisterHandler('closeModal');
    };
  }, [registerHandler, unregisterHandler]);

  const handleTaskCreated = () => {
    setQuickAddOpen(false);
    // Force TasksList to refresh by changing the key
    setRefreshKey(prev => prev + 1);
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
    <>
      <AppLayout
        title="All Tasks"
        subtitle="Manage and organize your tasks"
        actions={
          <Button onClick={() => setQuickAddOpen(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        }
      >
        <TasksList key={refreshKey} />
      </AppLayout>

      <QuickAddModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onTaskCreated={handleTaskCreated}
      />

      {/* Floating keyboard shortcuts button */}
      <KeyboardShortcutButton />
    </>
  );
}
