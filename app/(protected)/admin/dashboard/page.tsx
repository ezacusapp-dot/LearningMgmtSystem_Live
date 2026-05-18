"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
          <span className="text-2xl">👋</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {user?.name || "Admin"}
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Your dashboard is ready. Start managing your LMS.
        </p>
        
        {/* Optional: Display user info for debugging */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Email:</strong> {user?.email}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Role:</strong> {user?.role}
          </p>
        </div>
      </div>
    </div>
  );
}