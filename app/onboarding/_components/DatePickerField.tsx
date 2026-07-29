"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/app/components/context/ToastContext";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DEFAULT_YEAR = 2005;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function formatDisplayDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface DatePickerFieldProps {
  label?: string;
  required?: boolean;
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
}

/**
 * Trigger button + centered calendar modal for picking a date of birth.
 * Bundles what used to be ~150 lines of page-one-only JSX + state into a
 * single controlled component: <DatePickerField value={birthday} onChange={setBirthday} />
 */
export function DatePickerField({
  label = "Date of Birth",
  required = true,
  value,
  onChange,
}: DatePickerFieldProps) {
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [tempDay, setTempDay] = useState<number | null>(null);
  const [calendarYear, setCalendarYear] = useState<number>(DEFAULT_YEAR);
  const [calendarMonth, setCalendarMonth] = useState<number>(0);

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from(
    { length: currentYear - 1920 + 1 },
    (_, i) => currentYear - i,
  );

  // Lock background scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOpen = () => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCalendarYear(d.getFullYear());
        setCalendarMonth(d.getMonth());
        setTempDay(d.getDate());
        setIsOpen(true);
        return;
      }
    }
    setCalendarYear(DEFAULT_YEAR);
    setCalendarMonth(0);
    setTempDay(null);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!tempDay) {
      showToast("Please select a day for your birthdate.", "warning");
      return;
    }

    const maxDays = getDaysInMonth(calendarYear, calendarMonth);
    const validDay = Math.min(tempDay, maxDays);
    const monthStr = String(calendarMonth + 1).padStart(2, "0");
    const dayStr = String(validDay).padStart(2, "0");

    onChange(`${calendarYear}-${monthStr}-${dayStr}`);
    setIsOpen(false);
  };

  return (
    <div>
      <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <button
        type="button"
        onClick={handleOpen}
        className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm flex items-center justify-between text-left select-none ${
          isOpen
            ? "border-[#8b5cf6] ring-4 ring-violet-50/50 bg-white text-zinc-800"
            : "border-zinc-100 bg-zinc-50/50 text-zinc-600 hover:border-zinc-200"
        }`}
      >
        <span className={value ? "text-zinc-800 font-medium" : "text-zinc-400"}>
          {value ? formatDisplayDate(value) : "Select date"}
        </span>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 transition-colors ${
            isOpen ? "text-[#8b5cf6]" : "text-zinc-400"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop click saves the current selection, same as before */}
          <div className="absolute inset-0" onClick={handleSave} />

          <div className="relative w-full max-w-xs bg-white border border-zinc-100 rounded-3xl shadow-2xl z-10 p-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Select Date of Birth
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 mb-4">
              <select
                value={calendarMonth}
                onChange={(e) => setCalendarMonth(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50 cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={calendarYear}
                onChange={(e) => setCalendarYear(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50 cursor-pointer"
              >
                {yearsList.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-7 text-center mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[11px] font-bold text-zinc-400">
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {Array.from({
                length: getFirstDayOfMonth(calendarYear, calendarMonth),
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({
                length: getDaysInMonth(calendarYear, calendarMonth),
              }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = tempDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => setTempDay(dayNum)}
                    className={`h-9 w-9 mx-auto rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#8b5cf6] text-white font-bold shadow-md shadow-violet-200 scale-105"
                        : "text-zinc-600 hover:bg-violet-50 hover:text-[#8b5cf6]"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-1/2 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="w-1/2 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold shadow-md shadow-violet-100 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
