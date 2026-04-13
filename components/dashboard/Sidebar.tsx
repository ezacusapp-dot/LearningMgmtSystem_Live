"use client";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart2,
  FileText,
  Calendar,
  Settings,
  Gamepad2,
  ChevronRight,
  Database,
  Layers,
  Tag,
  Clock,
  Globe,
  Award,
  Zap,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

// ─── Types ───────────────────────────────────────────────
type SubItem = { label: string; href: string };

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: SubItem[];
  action?: () => void;
};

// ─── Nav Config ──────────────────────────────────────────
const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={15} strokeWidth={1.8} />,
    href: "/admin/dashboard",
  },
  {
    label: "School",
    icon: <Globe size={15} strokeWidth={1.8} />,
    href: "/dashboard/school",
    badge: 24,
  },
  {
    label: "Students",
    icon: <Users size={15} strokeWidth={1.8} />,
    href: "/dashboard/students",
  },
  {
    label: "Course Builder",
    icon: <Layers size={15} strokeWidth={1.8} />,
    href: "/admin/dashboard/master/courses",
    badge: 24,
  },
  {
    label: "Exam Builder",
    icon: <FileText size={15} strokeWidth={1.8} />,
    href: "/dashboard/exam_builder",
  },
  {
    label: "Exam Management",
    icon: <ClipboardList size={15} strokeWidth={1.8} />,
    href: "/dashboard/exam_management",
  },
  {
    label: "Master Data",
    icon: <Database size={15} strokeWidth={1.8} />,
    children: [
      { label: "Award Category",  href: "/admin/dashboard/master/award-category" },

  // { label: "Category",        href: "/admin/dashboard/master/category" },
  // { label: "Course Category", href: "/admin/dashboard/master/course-categories" },
  // { label: "Courses",         href: "/admin/dashboard/master/courses" },
  // { label: "Duration Type",   href: "/admin/dashboard/master/duration" },
  // { label: "Lesson",          href: "/admin/dashboard/master/lesson" },
  //  { label: "Modules",          href: "/admin/dashboard/master/module" },
  // { label: "Levels",           href: "/admin/dashboard/master/levels" },
  // { label: "Validity Period", href: "/admin/dashboard/master/validity-periods" },

        { label: "Validity Period", href: "/admin/dashboard/master/validity-periods" },
         { label: "Duration Type",   href: "/admin/dashboard/master/duration" },
           { label: "Levels",           href: "/admin/dashboard/master/levels" },
  { label: "Course Category", href: "/admin/dashboard/master/course-categories" },
     { label: "Modules",          href: "/admin/dashboard/master/module" },  
  { label: "Lesson",          href: "/admin/dashboard/master/lesson" },


    ],
  },
  {
    label: "Learning Paths",
    icon: <BarChart2 size={15} strokeWidth={1.8} />,
    href: "/dashboard/learning_paths",
  },
  {
    label: "Certification",
    icon: <Award size={15} strokeWidth={1.8} />,
    href: "/dashboard/certification",
    badge: 7,
  },
  {
    label: "Timeline Scheduler",
    icon: <Calendar size={15} strokeWidth={1.8} />,
    href: "/dashboard/timeline_Schedular",
    badge: 7,
  },
  {
    label: "Documentation",
    icon: <FileText size={15} strokeWidth={1.8} />,
    href: "/dashboard/documentation",
    badge: 7,
  },
  {
    label: "Analytics",
    icon: <Zap size={15} strokeWidth={1.8} />,
    href: "/dashboard/analytics",
    badge: 7,
  },
];

// ─── Props ───────────────────────────────────────────────
type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  activeLabel: string;
  onNavChange: (label: string) => void;
};

// ─── Sidebar ─────────────────────────────────────────────
export default function Sidebar({ collapsed, activeLabel, onNavChange }: SidebarProps) {
  const router  = useRouter();
  const logout  = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleOpen = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const settingsNav: NavItem[] = [
    {
      label: "Settings",
      icon: <Settings size={15} strokeWidth={1.8} />,
      href: "/dashboard/settings",
    },
  ];

  const handleNav = (item: NavItem) => {
    if (item.action) {
      item.action();
      return;
    }
    if (item.children) {
      toggleOpen(item.label);
      onNavChange(item.label);
      return;
    }
    onNavChange(item.label);
    router.push(item.href!);
  };

  const handleSubNav = (sub: SubItem, parentLabel: string) => {
    onNavChange(parentLabel);
    router.push(sub.href);
  };

  const isActive    = (item: NavItem) => activeLabel === item.label || pathname === item.href;
  const isSubActive = (sub: SubItem)  => pathname === sub.href;
  const isOpen      = (label: string) => openMenus.includes(label);

  return (
    <aside
      className={`
        relative z-20 flex flex-col
        h-screen               /* full viewport height */
        border-r border-white/[0.06]
        bg-[#0d0d1a]
        transition-all duration-300 ease-in-out
        flex-shrink-0          /* never shrink */
        ${collapsed ? "w-16 min-w-[64px]" : "w-[232px] min-w-[232px]"}
      `}
    >
      {/* ── Logo ── */}
      <div className="h-[60px] flex items-center gap-2.5 px-4 border-b border-white/[0.06] overflow-hidden flex-shrink-0">
        <div className="w-[34px] h-[34px] min-w-[34px] rounded-[10px]
          bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
          flex items-center justify-center shadow-lg shadow-indigo-900/40">
          <Gamepad2 size={17} className="text-white" />
        </div>
        <span
          className={`font-bold text-[15px] bg-gradient-to-r from-indigo-400 to-purple-400
            bg-clip-text text-transparent whitespace-nowrap transition-all duration-300
            ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
        >
          EduLMS
        </span>
      </div>

      {/* ── Scrollable Nav ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide min-h-0">
        <SectionLabel collapsed={collapsed} label="Main Menu" />
        <nav className="flex flex-col gap-0.5">
          {mainNav.map((item) =>
            item.children ? (
              <DropdownNavLink
                key={item.label}
                item={item}
                collapsed={collapsed}
                active={isActive(item)}
                open={isOpen(item.label)}
                onToggle={() => handleNav(item)}
                onSubClick={(sub) => handleSubNav(sub, item.label)}
                isSubActive={isSubActive}
              />
            ) : (
              <NavLink
                key={item.label}
                item={item}
                collapsed={collapsed}
                active={isActive(item)}
                onClick={() => handleNav(item)}
              />
            )
          )}
        </nav>

        <SectionLabel collapsed={collapsed} label="Settings" />
        <nav className="flex flex-col gap-0.5">
          {settingsNav.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              collapsed={collapsed}
              active={isActive(item)}
              onClick={() => handleNav(item)}
            />
          ))}
        </nav>
      </div>

      {/* ── User Footer ── */}
      <div className="border-t border-white/[0.06] p-2.5 flex-shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-[10px]
          bg-white/[0.08] hover:bg-white/[0.12] cursor-pointer transition-colors overflow-hidden">
          <div className="w-8 h-8 min-w-[32px] rounded-lg
            bg-gradient-to-br from-indigo-500 to-pink-500
            flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            AD
          </div>
          <div
            className={`overflow-hidden transition-all duration-300
              ${collapsed ? "opacity-0 w-0" : "opacity-100 flex-1"}`}
          >
            <div className="text-[12.5px] font-semibold text-white/90 whitespace-nowrap">Admin User</div>
            <div className="text-[11px] text-white/45 whitespace-nowrap">Super Admin</div>
          </div>
          {!collapsed && <ChevronRight size={13} className="text-white/30 ml-auto flex-shrink-0" />}
        </div>
      </div>

      {/* ── Logout ── */}
      <div className="border-t border-white/[0.06] p-2.5 flex-shrink-0">
        <div
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="flex items-center gap-2.5 p-2 rounded-[10px]
            bg-white/[0.08] hover:bg-red-500/10 cursor-pointer transition-colors overflow-hidden group"
        >
          <div className="w-8 h-8 min-w-[32px] rounded-lg
            bg-gradient-to-br from-indigo-500 to-pink-500
            flex items-center justify-center text-white flex-shrink-0">
            <LogOut size={14} strokeWidth={1.8} />
          </div>
          <div
            className={`overflow-hidden transition-all duration-300
              ${collapsed ? "opacity-0 w-0" : "opacity-100 flex-1"}`}
          >
            <div className="text-[12.5px] font-semibold text-red-400 whitespace-nowrap">Logout</div>
          </div>
          {!collapsed && (
            <ChevronRight size={13} className="text-white/30 ml-auto group-hover:text-red-400 flex-shrink-0" />
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Section Label ────────────────────────────────────────
function SectionLabel({ collapsed, label }: { collapsed: boolean; label: string }) {
  return (
    <div
      className={`px-[18px] pt-3 pb-1.5 text-[10px] tracking-[0.1em] uppercase
        font-semibold text-white/40 transition-all duration-300
        ${collapsed ? "opacity-0" : "opacity-100"}`}
    >
      {label}
    </div>
  );
}

// ─── Plain Nav Link ───────────────────────────────────────
function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={`relative flex items-center mx-2 rounded-[10px] cursor-pointer
        transition-all duration-200 overflow-hidden group
        ${active
          ? "bg-gradient-to-r from-indigo-500/[0.20] to-purple-500/[0.12]"
          : "hover:bg-white/[0.05]"}`}
    >
      {active && (
        <span className="absolute left-0 top-[22%] h-[56%] w-[3px] rounded-r-full
          bg-gradient-to-b from-indigo-400 via-purple-500 to-pink-500" />
      )}
      <div
        className={`w-[30px] h-[30px] min-w-[30px] rounded-[8px] flex items-center justify-center
          m-[7px] transition-all duration-200
          ${active
            ? "bg-indigo-500/20 text-indigo-300"
            : "bg-white/[0.07] text-white/65 group-hover:bg-white/[0.11] group-hover:text-white/90"}`}
      >
        {item.icon}
      </div>
      <span
        className={`text-[13px] font-medium whitespace-nowrap flex-1 transition-all duration-300
          ${active ? "text-violet-300 font-semibold" : "text-white/72 group-hover:text-white/95"}
          ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
      >
        {item.label}
      </span>
      {item.badge && !collapsed && (
        <span
          className={`mr-3 px-1.5 py-0.5 rounded-full text-[10px] font-semibold
            ${active ? "bg-indigo-500/25 text-indigo-300" : "bg-white/[0.10] text-white/60"}`}
        >
          {item.badge}
        </span>
      )}
    </div>
  );
}

// ─── Dropdown Nav Link ────────────────────────────────────
function DropdownNavLink({
  item,
  collapsed,
  active,
  open,
  onToggle,
  onSubClick,
  isSubActive,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  open: boolean;
  onToggle: () => void;
  onSubClick: (sub: SubItem) => void;
  isSubActive: (sub: SubItem) => boolean;
}) {
  return (
    <div className="mx-2">
      {/* Parent row */}
      <div
        onClick={onToggle}
        title={collapsed ? item.label : undefined}
        className={`relative flex items-center rounded-[10px] cursor-pointer
          transition-all duration-200 overflow-hidden group
          ${active
            ? "bg-gradient-to-r from-indigo-500/[0.20] to-purple-500/[0.12]"
            : "hover:bg-white/[0.05]"}`}
      >
        {active && (
          <span className="absolute left-0 top-[22%] h-[56%] w-[3px] rounded-r-full
            bg-gradient-to-b from-indigo-400 via-purple-500 to-pink-500" />
        )}
        <div
          className={`w-[30px] h-[30px] min-w-[30px] rounded-[8px] flex items-center justify-center
            m-[7px] transition-all duration-200
            ${active
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-white/[0.07] text-white/65 group-hover:bg-white/[0.11] group-hover:text-white/90"}`}
        >
          {item.icon}
        </div>
        <span
          className={`text-[13px] font-medium whitespace-nowrap flex-1 transition-all duration-300
            ${active ? "text-violet-300 font-semibold" : "text-white/72 group-hover:text-white/95"}
            ${collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}`}
        >
          {item.label}
        </span>
        {!collapsed && (
          <ChevronRight
            size={13}
            className={`mr-3 transition-transform duration-300 flex-shrink-0
              ${active ? "text-violet-400" : "text-white/35"}
              ${open ? "rotate-90" : "rotate-0"}`}
          />
        )}
      </div>

      {/* Sub-items */}
      {!collapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out
            ${open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"}`}
        >
          <div className="mt-0.5 mb-1 flex flex-col gap-0.5">
            {item.children!.map((sub) => (
              <div
                key={sub.label}
                onClick={() => onSubClick(sub)}
                className={`flex items-center gap-2.5 pl-[46px] pr-3 py-[7px]
                  rounded-[8px] cursor-pointer transition-all duration-150 group/sub
                  ${isSubActive(sub) ? "bg-indigo-500/10" : "hover:bg-white/[0.04]"}`}
              >
                <span
                  className={`w-[6px] h-[6px] rounded-full flex-shrink-0 transition-all duration-150
                    ${isSubActive(sub)
                      ? "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.7)]"
                      : "bg-white/25 group-hover/sub:bg-white/60"}`}
                />
                <span
                  className={`text-[12.5px] font-medium transition-all duration-150
                    ${isSubActive(sub)
                      ? "text-violet-300 font-semibold"
                      : "text-white/55 group-hover/sub:text-white/90"}`}
                >
                  {sub.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
