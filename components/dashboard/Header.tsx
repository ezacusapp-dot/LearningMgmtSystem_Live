"use client";

import { useState } from "react";
import { Menu, Search, Bell, ChevronRight, X } from "lucide-react";

type HeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
  pageTitle: string;
};

export default function Header({ onToggle, pageTitle }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header
      className="
        h-[60px] min-h-[60px]
        flex-shrink-0          /* never shrink — always 60px */
        sticky top-0 z-20
        flex items-center gap-3 px-5
        border-b border-indigo-100/80
        bg-white/90 backdrop-blur-xl
        shadow-sm shadow-indigo-50
      "
    >
      {/* Sidebar Toggle */}
      <button
        onClick={onToggle}
        className="w-[34px] h-[34px] rounded-lg bg-white border border-black/[0.08]
          flex items-center justify-center text-gray-500 shadow-sm
          hover:bg-gray-50 hover:text-gray-800 transition-all flex-shrink-0"
      >
        <Menu size={15} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="text-[13px] text-gray-400 font-medium">LMS</span>
        <ChevronRight size={13} className="text-gray-300" />
        <span className="text-[14px] font-bold text-gray-800">{pageTitle}</span>
      </div>

      <div className="flex-1" />

      {/* Search pill */}
      <div
        className={`flex items-center gap-2 bg-black/[0.04] border border-black/[0.07]
          rounded-full px-3.5 py-0 h-[34px] transition-all duration-300
          ${searchOpen ? "w-52 ring-2 ring-indigo-200 bg-white border-indigo-200" : "w-36"}`}
      >
        <Search size={13} className="text-gray-400 min-w-[13px]" />
        <input
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setSearchOpen(false)}
          placeholder="Search..."
          className="bg-transparent border-none outline-none text-[13px]
            text-gray-700 placeholder:text-gray-400 w-full"
        />
        {searchOpen && (
          <button
            onMouseDown={() => setSearchOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Bell */}
      <button
        className="w-[34px] h-[34px] relative rounded-lg bg-white border border-black/[0.08]
          flex items-center justify-center text-gray-500 shadow-sm
          hover:bg-gray-50 hover:text-gray-800 transition-all flex-shrink-0"
      >
        <Bell size={15} />
        <span
          className="absolute top-[7px] right-[7px] w-[7px] h-[7px]
            rounded-full bg-pink-500 border-[1.5px] border-white"
        />
      </button>

      {/* User chip */}
      <button
        className="flex items-center gap-2 h-[34px] pl-1 pr-3
          bg-white border border-black/[0.08] rounded-full shadow-sm
          hover:bg-gray-50 transition-all flex-shrink-0"
      >
        <div
          className="w-[26px] h-[26px] rounded-full
            bg-gradient-to-br from-indigo-500 to-pink-500
            flex items-center justify-center text-white text-[9.5px] font-bold"
        >
          AD
        </div>
        <span className="text-[12.5px] font-semibold text-gray-700 hidden sm:block">Admin</span>
      </button>
    </header>
  );
}
