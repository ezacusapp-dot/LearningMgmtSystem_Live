"use client";

import { Menu, Bell } from "lucide-react";

type HeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
  pageTitle: string;
};

export default function StudentHeader({ onToggle, pageTitle }: HeaderProps) {
  return (
    <header className="
      h-[64px] min-h-[64px] flex-shrink-0
      sticky top-0 z-20
      flex items-center justify-between gap-3 px-5
      bg-white/90 backdrop-blur-xl
      shadow-sm
    ">

      {/* ── LEFT: Toggle + Branding ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="w-[34px] h-[34px] rounded-lg bg-gray-100 border border-gray-200
            flex items-center justify-center text-gray-500
            hover:bg-gray-200 hover:text-gray-800 transition-all flex-shrink-0"
        >
          <Menu size={16} />
        </button>

        <div className="hidden sm:block">
          <p className="text-[14px] font-bold text-gray-800 leading-tight">
            Lincoln High Student
          </p>
          <p className="text-[10.5px] text-gray-400 leading-tight">
            Student Admin Dashboard
          </p>
        </div>
      </div>

      {/* ── RIGHT: Title pill + Bell + User ── */}
      <div className="flex items-center gap-3">

        {/* Page Title pill */}
        <div className="hidden md:flex items-center bg-purple-50 border border-purple-100
          rounded-lg px-3 h-[32px]">
          <span className="text-[12px] font-medium text-purple-600">
            {pageTitle || "Dashboard"}
          </span>
        </div>

        {/* Bell */}
        <button className="w-[34px] h-[34px] relative rounded-lg bg-gray-100 border border-gray-200
          flex items-center justify-center text-gray-500
          hover:bg-gray-200 hover:text-gray-800 transition-all flex-shrink-0">
          <Bell size={15} />
          <span className="absolute top-[7px] right-[7px] w-[7px] h-[7px]
            rounded-full bg-pink-500 border-[1.5px] border-white" />
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 h-[38px] pl-2 pr-3
          bg-gray-50 border border-gray-200 rounded-xl
          hover:bg-gray-100 transition-all flex-shrink-0 cursor-pointer">
          <div className="w-[28px] h-[28px] rounded-full
            bg-gradient-to-br from-purple-500 to-pink-500
            flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            PM
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-[12.5px] font-semibold text-gray-700 leading-tight">Priya Mehta</p>
            <p className="text-[10px] text-gray-400 leading-tight">Student Admin</p>
          </div>
        </div>

      </div>
    </header>
  );
}