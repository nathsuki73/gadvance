"use client";

import React, { useEffect } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void; // Optional now since filtering is instant
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
}: SearchBarProps) => {

  // Auto-focus shortcut listener (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("global-spotlight-input")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative group w-full max-w-[400px]">
      {/* Left Icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-primary" />
      </div>

      {/* Input */}
      <input
        id="global-spotlight-input"
        type="text"
        value={value}
        placeholder="Search for courses, settings, profiles..."
        onChange={(e) => onChange(e.target.value)} // 🎯 Trigger state update instantly on keystroke
        className="w-full rounded-full border border-transparent bg-zinc-100/50 py-2 pl-10 pr-16 text-sm outline-none transition-all placeholder:text-zinc-500 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-zinc-800"
        autoComplete="off"
      />

      {/* Right Shortcut Badge
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <kbd className="hidden rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 sm:inline-block">
          ⌘K
        </kbd>
      </div> */}
    </div>
  );
};

export default SearchBar;