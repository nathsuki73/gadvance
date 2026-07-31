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
  onQueryChange?: (query: string) => void;
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
  /** When true, formats the label and input styling to match profile settings (no red asterisk, standard text) */
  isProfileUpdate?: boolean;
}

/**
 * Read-only selection dropdown that shows all available options on click.
 */
export function SearchableDropdown<T>({
  label,
  required,
  disabled,
  placeholder,
  disabledPlaceholder,
  query,
  items,
  getKey,
  getLabel,
  onSelect,
  displayOverride,
  isProfileUpdate = false,
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

  const toggleDropdown = () => {
    if (!disabled && !isLocked) {
      setIsOpen((prev) => !prev);
    }
  };

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
      
      {/* Clickable trigger container */}
      <div 
        onClick={toggleDropdown}
        className="relative flex items-center cursor-pointer"
      >
        <input
          type="text"
          readOnly
          tabIndex={disabled || isLocked ? -1 : 0}
          disabled={disabled || isLocked}
          value={isLocked ? displayOverride : query}
          placeholder={disabled ? disabledPlaceholder : placeholder}
          className={
            isProfileUpdate
              ? "w-full rounded-xl border border-zinc-200 bg-white p-3.5 pr-10 text-sm text-zinc-800 placeholder-zinc-400 cursor-pointer select-none disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-violet-50 transition-all"
              : "w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3.5 sm:p-4 pr-10 text-sm text-zinc-800 placeholder-zinc-300 cursor-pointer select-none disabled:bg-zinc-100/50 disabled:cursor-not-allowed focus:border-[#8b5cf6] focus:bg-white focus:outline-none transition-colors"
          }
        />
        <ChevronDown 
          className={`absolute right-3.5 h-4 w-4 text-zinc-400 pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#8b5cf6]" : ""
          }`} 
        />
      </div>

      {/* Full Options List */}
      {isOpen && !disabled && !isLocked && (
        <div className="absolute z-50 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl">
          {items.length > 0 ? (
            items.map((item) => {
              const itemLabel = getLabel(item);
              const isSelected = itemLabel === query;

              return (
                <button
                  key={getKey(item)}
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left rounded-lg px-3 py-2.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-violet-50 text-[#8b5cf6] font-semibold"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {itemLabel}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2.5 text-xs text-zinc-400 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}