"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface SearchableDropdownProps<T> {
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder: string;
  disabledPlaceholder?: string;
  query: string;
  onQueryChange: (query: string) => void;
  items: T[];
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onSelect: (item: T) => void;
  /**
   * When set, the field renders as a locked, read-only display showing this
   * text instead of the search input/results list (used for the
   * Municipality/City field when the province is a Highly Urbanized City).
   */
  displayOverride?: string;
}

/**
 * Generic type-to-filter dropdown. Region, Province, Municipality/City, and
 * Barangay in contact-location previously duplicated this ~50-line pattern
 * four times with only field names/data changing.
 */
export function SearchableDropdown<T>({
  label,
  required,
  disabled,
  placeholder,
  disabledPlaceholder,
  query,
  onQueryChange,
  items,
  getKey,
  getLabel,
  onSelect,
  displayOverride,
}: SearchableDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isLocked = displayOverride !== undefined;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter((item) =>
    getLabel(item).toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <div className="relative text-left" ref={ref}>
      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled || isLocked}
          value={isLocked ? displayOverride : query}
          onFocus={() => !disabled && !isLocked && setIsOpen(true)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
          }}
          placeholder={disabled ? disabledPlaceholder : placeholder}
          className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 placeholder-zinc-300 disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:bg-white focus:outline-none"
        />
        <ChevronDown className="absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none" />
      </div>

      {isOpen && !disabled && !isLocked && (
        <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
          {filtered.map((item) => (
            <button
              key={getKey(item)}
              type="button"
              onClick={() => {
                onSelect(item);
                setIsOpen(false);
              }}
              className="w-full text-left rounded-lg px-3 py-2.5 text-xs text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
            >
              {getLabel(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
