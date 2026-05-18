"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import StudentSidebar from "@/components/dashboard/studentSidebar";
import StudentHeader from "@/components/dashboard/studentHeder";

/* ======================================================
   Page title map
====================================================== */
const PAGE_TITLES: Record<string, string> = {
  "/student":              "Dashboard",
  "/student/courses":      "My Courses",
  "/student/assignments":  "Assignments",
  "/student/exams":        "Exams & Tests",
  "/student/grades":       "My Grades",
  "/student/certificates": "Certificates",
  "/student/leaderboard":  "Leaderboard",
  "/student/profile":      "Profile",
  "/student/settings":     "Settings",
};

/* ======================================================
   LAYOUT
====================================================== */
export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeLabel = PAGE_TITLES[pathname] ?? "";

  return (
    /*
     * ROOT: h-screen + overflow-hidden
     * Locks the entire layout to the viewport.
     * Nothing here can scroll — only <main> inside scrolls.
     */
    <div className="h-screen overflow-hidden flex bg-[#080812] text-white relative">

      {/* ── Decorative background blobs (fixed, pointer-events-none) ── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-[260px] w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      {/* ── Sidebar ── */}
      <StudentSidebar collapsed={collapsed} />

      {/* ── Main column ── */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

        {/* Header */}
        <StudentHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          pageTitle={activeLabel}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </main>

      </div>
    </div>
  );
}