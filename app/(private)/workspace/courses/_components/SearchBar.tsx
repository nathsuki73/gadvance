"use client";

import React from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

const SearchBar = ({
  value,
  onChange,
  onSearch,
}: SearchBarProps) => {
  return (
    <div className="mb-14 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
      <Search size={18} className="text-zinc-400" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search courses"
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
      />

      <button
        onClick={onSearch}
        className="rounded-xl bg-[#00aeef] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;