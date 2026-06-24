

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Award,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  BookOpen,
  User,
  Cpu,
  AwardIcon,
} from "lucide-react";
import { Profiler } from "react";

/* ======================================================
   TYPES
====================================================== */

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

/* ======================================================
   NAVIGATION
====================================================== */

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/student", icon: <LayoutDashboard size={18} /> },
  { label: "My Courses", href: "/student/courses/", icon: <BookOpen size={18} /> },
  { label: "Assignments", href: "/student/", icon: <FileText size={18} /> },
  { label: "Exams & Tests", href: "/student/exams", icon: <Award size={18} /> },
  { label: "My Grades", href: "/student/", icon: <BarChart3 size={18} /> },
  { label: "Certificate", href: "/student/", icon: <Award size={18} /> },
  { label: "Leaderboard", href: "/student/", icon: <AwardIcon  size={18} /> },
  { label: " Profile", href: "/student/", icon: <User  size={18} /> },
];

const SETTINGS_NAV: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: <Settings size={18} /> },
];

/* ======================================================
   COMPONENT
====================================================== */

type SidebarProps = {
  collapsed: boolean;
};

export default function StudentSidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  /* ---------- Logout ---------- */
  const handleLogout = () => {
    router.push("/login");
  };

  /* ---------- Nav Link ---------- */
  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.href;

    return (
      <Link
        key={item.label}
        href={item.href}
        title={collapsed ? item.label : ""}
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg
          transition-all duration-200
          ${collapsed ? "justify-center" : ""}
          ${
            active
              ? "bg-indigo-600 text-white"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          }
        `}
      >
        {item.icon}

        {!collapsed && (
          <span className="text-sm font-medium truncate">
            {item.label}
          </span>
        )}
      </Link>
    );
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <aside
      className={`
        h-screen flex flex-col bg-slate-900 text-white
        border-r border-slate-800
        transition-all duration-300
        ${collapsed ? "w-[70px]" : "w-[230px]"}
      `}
    >
      {/* ======================================================
          LOGO
      ====================================================== */}
      <div className="h-[64px] flex items-center border-b border-slate-800 px-4 flex-shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <GraduationCap size={16} />
        </div>

        {!collapsed && (
          <span className="ml-3 font-bold whitespace-nowrap">
            Code Excellence
          </span>
        )}
      </div>

      {/* ======================================================
          SCROLLABLE MENU
      ====================================================== */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-700">
        <nav className="p-2.5 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">
              Main
            </p>
          )}

          {MAIN_NAV.map(renderNavItem)}

          <div className="mt-4 border-t border-slate-800" />

          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-slate-500 px-3 pt-2 pb-1">
              Settings
            </p>
          )}

          {SETTINGS_NAV.map(renderNavItem)}
        </nav>
      </div>

      {/* ======================================================
          PROFILE + LOGOUT (FIXED)
      ====================================================== */}
      <div className="border-t border-slate-800 flex-shrink-0 p-2.5">
        {/* Profile */}
        <div
          className={`
            flex items-center gap-3 px-3 py-3 mb-2 rounded-lg
            bg-slate-800/60 border border-slate-700/50
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[11px] font-bold">
            AD
          </div>

          {!collapsed && (
            <>
              <div className="flex-1">
                <p className="text-sm font-semibold">Admin User</p>
                <p className="text-xs text-slate-400">Super Admin</p>
              </div>

              <ChevronRight size={14} className="text-slate-500" />
            </>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
            bg-slate-800/60 border border-slate-700/50
            text-red-400 hover:bg-red-600/20
            transition-all duration-200
            ${collapsed ? "justify-center" : ""}
          `}
        >
          <LogOut size={18} />

          {!collapsed && (
            <>
              <span className="flex-1 text-left text-sm font-medium">
                Logout
              </span>
              <ChevronRight size={14} className="text-slate-500" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}