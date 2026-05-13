// components/explore/CourseSearchBar.tsx

"use client";

import React from "react";
import { Search } from "lucide-react";

type CourseSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

const CourseSearchBar = ({
  value,
  onChange,
}: CourseSearchBarProps) => {
  return (
    <div className="group relative max-w-2xl mx-auto"> {/* Reduced max-width for a tighter look */}
      {/* Search Icon: Transition to brand blue on focus */}
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-[#00aeef]"
        size={18} // Slightly smaller icon
        strokeWidth={2}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search modules or skills..."
        className="w-full rounded-full border border-zinc-100 bg-white py-3 pl-11 pr-20
        text-sm text-zinc-900 shadow-sm transition-all duration-300 lowercase
        placeholder:text-zinc-300 placeholder:font-light
        hover:border-zinc-200 hover:shadow-lg hover:shadow-sky-100/20
        focus:border-[#00aeef] focus:outline-none focus:ring-4 focus:ring-sky-50/50
        md:py-3.5 md:text-base" // Reduced padding and font size
      />

      {/* Keyboard shortcut: Styled to be ultra-minimal */}
      <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 sm:block">
        <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-md border border-zinc-100 bg-zinc-50/50 px-2 font-sans text-[9px] font-bold tracking-widest text-zinc-400 uppercase">
          <span className="text-[10px]">⌘</span>k
        </kbd>
      </div>

      {/* Mobile Find button: Styled as a brand-blue pill */}
      <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#00aeef] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white transition-all active:scale-95 sm:hidden">
        find
      </button>
    </div>
  );
};

export default CourseSearchBar;