"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface PhoneInputProps {
  dialCode: string;
  dialCodes: string[];
  onDialCodeChange: (code: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
}

export function PhoneInput({
  dialCode,
  dialCodes,
  onDialCodeChange,
  phoneNumber,
  onPhoneNumberChange,
}: PhoneInputProps) {
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
    <div>
      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase tracking-widest">
        Mobile Number <span className="text-red-500">*</span>
      </label>
      <div className="flex w-full items-center rounded-xl border border-zinc-100 bg-zinc-50/50 focus-within:border-[#8b5cf6] focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-50/50 overflow-hidden transition-all">
        <div className="relative shrink-0" ref={ref}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 border-r border-zinc-200/80 px-2.5 sm:px-3 py-3.5 sm:py-4 text-sm font-medium text-zinc-700 hover:bg-zinc-100/60 transition-all"
          >
            <span>{dialCode}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-zinc-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-20 rounded-xl border border-zinc-100 bg-white p-1 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
              {dialCodes.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    onDialCodeChange(code);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center rounded-lg py-2 text-xs font-semibold bg-violet-50/70 text-[#8b5cf6] hover:bg-violet-100 hover:text-[#8b5cf6] transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) =>
            onPhoneNumberChange(e.target.value.replace(/\D/g, ""))
          }
          placeholder="917 123 4567"
          maxLength={10}
          className="w-full bg-transparent px-3.5 py-3.5 sm:py-4 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none"
        />
      </div>
    </div>
  );
}
