"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative group w-full max-w-[400px] ">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-[#00aeef] transition-colors" />
      </div>
      <input
        type="text"
        placeholder="Search for courses..."
        className="w-full bg-zinc-100/50 border border-transparent rounded-full py-2 pl-10 pr-4 text-sm outline-none transition-all focus:bg-white focus:border-[#00aeef]/30 focus:ring-4 focus:ring-[#00aeef]/10 placeholder:text-zinc-500"
      />
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 bg-white border border-zinc-200 rounded-md">
          ⌘K
        </kbd>
      </div>
    </div>
  );
}