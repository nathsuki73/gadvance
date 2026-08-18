"use client";

import React, { useEffect, useRef } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  id?: string; // 🔑 Add optional id prop
};

const SearchBar = ({
  value,
  onChange,
  id = "global-search-input",
}: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus shortcut listener (⌘K or Ctrl+K) using local ref
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
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
        ref={inputRef}
        id={id}
        name="search"
        type="text"
        value={value}
        placeholder="Search for courses, settings, profiles..."
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-transparent bg-zinc-100/50 py-2 pl-10 pr-16 text-sm outline-none transition-all placeholder:text-zinc-500 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 text-zinc-800"
        autoComplete="off"
      />
    </div>
  );
};

export default SearchBar;
