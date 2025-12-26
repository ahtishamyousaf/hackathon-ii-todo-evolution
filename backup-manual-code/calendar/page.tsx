"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import CalendarView from "@/components/CalendarView";
import Button from "@/components/ui/Button";
import { Filter } from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppLayout
      title="My Calendar"
      subtitle="View and manage your tasks by date"
      actions={
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      }
    >
      <CalendarView />
    </AppLayout>
  );
}
