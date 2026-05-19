"use client";

import React from "react";
import { Search } from "lucide-react";

type CourseSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

const CourseSearchBar = ({ value, onChange, onSearch }: CourseSearchBarProps) => {
  
  // This handles the form submission (Enter key or Button click)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // CRITICAL: Stops the page from refreshing
    onSearch();
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="group relative max-w-2xl mx-auto"
    >
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 transition-colors group-focus-within:text-[#8b5cf6]"
        size={18}
        strokeWidth={2}
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="search modules or skills..."
        className="w-full rounded-full border border-zinc-100 bg-white py-3 pl-11 pr-24
        text-sm text-zinc-900 shadow-sm transition-all duration-300 lowercase
        placeholder:text-zinc-300 placeholder:font-light
        hover:border-zinc-200 hover:shadow-lg hover:shadow-violet-100/20
        focus:border-[#8b5cf6] focus:outline-none focus:ring-4 focus:ring-violet-50/50
        md:py-3.5 md:text-base"
      />

      {/* Button is now type="submit" and visible on all screens */}
      <button 
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#8b5cf6] px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#7c3aed] active:scale-95"
      >
        find
      </button>
    </form>
  );
};

export default CourseSearchBar;