"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface SimpleDropdownProps {
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
  /** When true, formats the label and input styling to match profile settings (no red asterisk, standard text) */
  isProfileUpdate?: boolean;
}

/** Small fixed-list dropdown (e.g. Country). Not searchable. */
export function SimpleDropdown({
  label,
  required,
  value,
  options,
  onChange,
  icon: Icon,
  isProfileUpdate = false,
}: SimpleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative text-left" ref={ref}>
      {/* Dynamic Label Styling */}
      <label
        className={
          isProfileUpdate
            ? "block text-xs font-semibold text-zinc-700 mb-1.5"
            : "block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest"
        }
      >
        {label} {!isProfileUpdate && required && <span className="text-red-500">*</span>}
      </label>

      {/* Dynamic Button Styling */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={
          isProfileUpdate
            ? "flex w-full items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 text-sm text-zinc-800 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
            : "flex w-full items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 text-sm text-zinc-700"
        }
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-zinc-400 shrink-0" />}
          <span className="font-medium">{value}</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#8b5cf6]" : ""
          }`}
        />
      </button>

      {/* Options Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
              className={`w-full text-left rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                opt === value
                  ? "text-[#8b5cf6] bg-violet-50/70"
                  : "text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}