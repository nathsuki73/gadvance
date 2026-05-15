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
  // Handle form submission to trigger onSearch if Enter is pressed
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="group relative w-full">
      {/* Thinner icon matching our minimalist typography aesthetic */}
      <Search
        className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-[#00aeef]"
        size={16}
        strokeWidth={1.3}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="search platform..."
        className="w-full bg-transparent border-b border-zinc-100 py-2 pl-7 pr-4
        text-sm text-zinc-900 transition-all duration-300 lowercase
        placeholder:text-zinc-300 placeholder:font-light
        hover:border-zinc-200
        focus:border-[#00aeef] focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;