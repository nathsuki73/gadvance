"use client";

import React, { useRef, useState, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

const PREDEFINED_GENDERS = ["Male", "Female", "Prefer not to specify"];
const OPTIONS: { display: string; value: string }[] = [
  { display: "Male", value: "Male" },
  { display: "Female", value: "Female" },
  { display: "Other (please specify)", value: "Other" },
  { display: "Prefer not to specify", value: "Prefer not to specify" },
];

interface GenderSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function GenderSelect({ value, onChange }: GenderSelectProps) {
  const isPredefined = PREDEFINED_GENDERS.includes(value);
  const isCustom = Boolean(value && !isPredefined);

  const [prevValue, setPrevValue] = useState(value);
  const [isEditingCustom, setIsEditingCustom] = useState(isCustom);
  const [customText, setCustomText] = useState(isCustom ? value : "");
  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Use refs to prevent stale closures inside the click-outside event listener
  const customTextRef = useRef(customText);
  useEffect(() => {
    customTextRef.current = customText;
  }, [customText]);

  const isEditingRef = useRef(isEditingCustom);
  useEffect(() => {
    isEditingRef.current = isEditingCustom;
  }, [isEditingCustom]);

  if (value !== prevValue) {
    setPrevValue(value);
    const predefined = PREDEFINED_GENDERS.includes(value);
    if (!predefined && value) {
      setIsEditingCustom(false);
      setCustomText(value);
    } else {
      setIsEditingCustom(false);
      setCustomText("");
    }
  }

  const handleConfirmCustom = () => {
    if (customTextRef.current.trim()) {
      setIsEditingCustom(false);
      onChange(customTextRef.current.trim());
    }
  };

  // Click outside closes dropdown AND acts as a check/save when editing custom text
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isEditingRef.current) {
          handleConfirmCustom();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isEditingCustom && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditingCustom]);

  const handleSelectOption = (optionValue: string) => {
    setIsOpen(false);
    if (optionValue === "Other") {
      setIsEditingCustom(true);
      setCustomText(isCustom ? value : "");
    } else {
      setIsEditingCustom(false);
      setCustomText("");
      onChange(optionValue);
    }
  };

  const getDisplayText = () => {
    if (isCustom || (value && !PREDEFINED_GENDERS.includes(value))) {
      return value;
    }
    return value || "Select Gender";
  };

  return (
    <div className="relative" ref={ref}>
      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        Gender
        <span className="text-red-500 ml-1">*</span>
      </label>

      {/* Main Container: Removed heavy purple ring/box when editing custom text */}
      <div
        onClick={() => {
          if (!isEditingCustom) {
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm flex items-center justify-between select-none ${
          isEditingCustom
            ? "border-zinc-200 bg-white text-zinc-800 cursor-default"
            : isOpen
              ? "border-[#8b5cf6] ring-4 ring-violet-50/50 bg-white text-zinc-800 cursor-pointer"
              : "border-zinc-100 bg-zinc-50/50 text-zinc-600 cursor-pointer"
        }`}
      >
        {isEditingCustom ? (
          <div
            className="flex items-center w-full gap-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCustom();
              }}
              placeholder="Please specify gender..."
              className="w-full bg-transparent focus:outline-none text-zinc-800 text-sm"
            />
            {/* Slick, modern check button with purple accent */}
            <button
              type="button"
              onClick={handleConfirmCustom}
              className="h-7 w-7 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center hover:bg-[#7c3aed] transition-all shadow-xs cursor-pointer shrink-0"
              title="Confirm Custom Gender"
            >
              <Check size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <>
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown
              size={16}
              className={`text-zinc-400 transition-transform duration-200 shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </div>

      {/* Dropdown Menu List */}
      {isOpen && !isEditingCustom && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {OPTIONS.map((opt, idx) => {
            const isSelected =
              value === opt.value || (opt.value === "Other" && isCustom);
            return (
              <div
                key={opt.display}
                onClick={() => handleSelectOption(opt.value)}
                className={`px-4 py-3 text-sm flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-violet-50/60 font-semibold text-[#8b5cf6]"
                    : "text-zinc-600 hover:bg-violet-50/60 hover:text-[#8b5cf6]"
                } ${idx > 0 ? "border-t border-zinc-50" : ""}`}
              >
                <span>{opt.display}</span>
                {isSelected && <Check size={14} className="text-[#8b5cf6]" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
