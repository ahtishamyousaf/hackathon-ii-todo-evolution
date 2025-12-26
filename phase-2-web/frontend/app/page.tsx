"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
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

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">T</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            ✨ Modern Task Management
          </div>
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Organize Your Life,<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              One Task at a Time
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            A beautiful, modern todo application with calendar views, categories,
            recurring tasks, and powerful organization features.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-4 text-lg shadow-lg hover:shadow-xl">
                Create Free Account
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <Card>
            <CardContent className="p-6">
              <div className="text-blue-600 text-4xl mb-4">✓</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Task Management
              </h3>
              <p className="text-gray-600">
                Create, organize, and track your tasks with ease. Stay on top
                of your priorities.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-blue-600 text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Secure & Private
              </h3>
              <p className="text-gray-600">
                Your data is encrypted and secure. Only you have access to your
                tasks and information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-blue-600 text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast & Reliable
              </h3>
              <p className="text-gray-600">
                Built with modern technology for a smooth, responsive
                experience across all devices.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-16 text-white">
          <h3 className="text-4xl font-bold mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who are already managing their tasks more
            effectively with TaskFlow.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg shadow-lg">
              Create Your Free Account →
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <p>© 2025 TaskFlow. Built with Next.js and FastAPI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
