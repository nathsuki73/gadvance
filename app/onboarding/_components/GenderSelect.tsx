"use client";

import React, { useEffect, useRef, useState } from "react";

const PREDEFINED_GENDERS = ["Male", "Female", "Prefer not to specify"];
const OPTIONS: { display: string; value: string }[] = [
  { display: "Male", value: "Male" },
  { display: "Female", value: "Female" },
  { display: "Other (please specify)", value: "Other" },
  { display: "Prefer not to specify", value: "Prefer not to specify" },
];

interface GenderSelectProps {
  /** Either a predefined gender, custom free text, or "" if unset. */
  value: string;
  onChange: (value: string) => void;
}

export function GenderSelect({ value, onChange }: GenderSelectProps) {
  const isPredefined = PREDEFINED_GENDERS.includes(value);

  const [selected, setSelected] = useState<string>(
    value ? (isPredefined ? value : "Other") : "",
  );
  const [customGender, setCustomGender] = useState<string>(
    isPredefined ? "" : value,
  );
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const choose = (optionValue: string) => {
    setSelected(optionValue);
    setIsOpen(false);
    if (optionValue === "Other") {
      onChange(customGender);
    } else {
      setCustomGender("");
      onChange(optionValue);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        Gender
        <span className="text-red-500 ml-1">*</span>
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm cursor-pointer flex items-center justify-between select-none ${
          isOpen
            ? "border-[#8b5cf6] ring-4 ring-violet-50/50 bg-white text-zinc-800"
            : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
        }`}
      >
        <span>
          {selected === "Other"
            ? customGender || "Other (please specify)"
            : selected || "Select Gender"}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a1a1aa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {OPTIONS.map((opt, idx) => (
            <div
              key={opt.display}
              onClick={() => choose(opt.value)}
              className={`px-4 py-3 text-sm text-zinc-600 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors ${
                idx > 0 ? "border-t border-zinc-50" : ""
              }`}
            >
              {opt.display}
            </div>
          ))}
        </div>
      )}

      {selected === "Other" && (
        <div className="mt-3">
          <input
            type="text"
            value={customGender}
            onChange={(e) => {
              setCustomGender(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="Please specify"
            required
            className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
          />
        </div>
      )}
    </div>
  );
}
