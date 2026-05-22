"use client";

import React from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void | Promise<void>;
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
}: SearchBarProps) => {
  return (
    <div className="relative group w-full max-w-[400px]">
      {/* Left Icon */}
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-zinc-400 transition-colors group-focus-within:text-primary" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        placeholder="Search for courses..."
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSearch();
          }
        }}
        className="w-full rounded-full border border-transparent bg-zinc-100/50 py-2 pl-10 pr-16 text-sm outline-none transition-all placeholder:text-zinc-500 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
      />

      {/* Right Shortcut / Action */}
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button
          type="button"
          onClick={onSearch}
          className="hidden rounded-md border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 transition-colors hover:text-[#00aeef] sm:inline-block"
        >
          ⌘K
        </button>
      </div>
    </div>
  );
};

export default SearchBar;