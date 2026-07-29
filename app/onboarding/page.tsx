"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InputField } from "./_components/InputField";
import { useToast } from "@/app/components/context/ToastContext";

interface OnboardingPageOneData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

const PREDEFINED_GENDERS = ["Male", "Female", "Prefer not to specify"];
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

export default function OnboardingPageOne() {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  // Lazy state initialization from localStorage
  const [persistedData] = useState<OnboardingPageOneData | null>(() => {
    if (typeof window === "undefined") return null;
    const savedData = localStorage.getItem("onboarding_p1");
    if (!savedData) return null;
    try {
      return JSON.parse(savedData) as OnboardingPageOneData;
    } catch (error) {
      console.error("Failed to parse onboarding_p1 cache:", error);
      return null;
    }
  });

  // Main Form States
  const [birthday, setBirthday] = useState<string>(
    persistedData?.birthday || "",
  );
  const [calculatedAge, setCalculatedAge] = useState<string>(
    persistedData?.age || "",
  );

  const [selectedGender, setSelectedGender] = useState<string>(() => {
    const gender = persistedData?.gender;
    if (!gender) return "";
    return PREDEFINED_GENDERS.includes(gender) ? gender : "Other";
  });

  const [customGender, setCustomGender] = useState<string>(() => {
    const gender = persistedData?.gender;
    if (!gender) return "";
    return PREDEFINED_GENDERS.includes(gender) ? "" : gender;
  });

  // Modal / Dropdown states
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Temporary calendar selection state inside modal
  const [tempDay, setTempDay] = useState<number | null>(null);
  const [calendarYear, setCalendarYear] = useState<number>(2005);
  const [calendarMonth, setCalendarMonth] = useState<number>(0);

  const genderRef = useRef<HTMLDivElement>(null);

  // Compute exact age in years
  const computeAge = (birthDateString: string): number => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Lock background scrolling when calendar modal is open
  useEffect(() => {
    if (isCalendarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCalendarOpen]);

  // Click outside handler for gender dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (genderRef.current && !genderRef.current.contains(target)) {
        setIsGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When calendar modal opens, initialize temporary picker states
  const handleOpenCalendar = () => {
    if (birthday) {
      const d = new Date(birthday);
      if (!isNaN(d.getTime())) {
        setCalendarYear(d.getFullYear());
        setCalendarMonth(d.getMonth());
        setTempDay(d.getDate());
      } else {
        setCalendarYear(2005);
        setCalendarMonth(0);
        setTempDay(null);
      }
    } else {
      setCalendarYear(2005);
      setCalendarMonth(0);
      setTempDay(null);
    }
    setIsCalendarOpen(true);
  };

  const rawNameParts = (session?.user?.name || "").trim().split(/\s+/);
  const fallbackFirst = rawNameParts[0] || "";
  const fallbackLast =
    rawNameParts.length > 1 ? rawNameParts.slice(1).join(" ") : "";

  const googleFirst = persistedData?.firstName || fallbackFirst;
  const googleLast = persistedData?.lastName || fallbackLast;

  // Calendar Helper Functions
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Select day temporary handler inside modal
  const handleDayClick = (day: number) => {
    setTempDay(day);
  };

  // Save selected date handler (triggered by Save button or clicking backdrop outside)
  const handleSaveCalendar = () => {
    if (!tempDay) {
      showToast("Please select a day for your birthdate.", "warning");
      return;
    }

    const maxDays = getDaysInMonth(calendarYear, calendarMonth);
    const validDay = Math.min(tempDay, maxDays);

    const monthStr = String(calendarMonth + 1).padStart(2, "0");
    const dayStr = String(validDay).padStart(2, "0");
    const dateStr = `${calendarYear}-${monthStr}-${dayStr}`;

    setBirthday(dateStr);
    const computed = computeAge(dateStr);
    if (computed >= 0) {
      setCalculatedAge(computed.toString());
    }
    setIsCalendarOpen(false);
  };

  // Cancel calendar selection
  const handleCancelCalendar = () => {
    setIsCalendarOpen(false);
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const firstName = (formData.get("firstName") as string)?.trim();
    const lastName = (formData.get("lastName") as string)?.trim();
    const enteredAgeStr = (formData.get("age") as string)?.trim();

    if (!firstName || !lastName) {
      showToast("Please enter your first and last name.", "warning");
      return;
    }

    if (!birthday) {
      showToast("Please select your date of birth.", "warning");
      return;
    }

    const birthDateObj = new Date(birthday);
    const today = new Date();

    if (birthDateObj > today) {
      showToast("Date of birth cannot be in the future.", "warning");
      return;
    }

    const ageNumber = computeAge(birthday);

    if (ageNumber < 13) {
      showToast("You must be at least 13 years old to register.", "warning");
      return;
    }

    if (enteredAgeStr && parseInt(enteredAgeStr, 10) !== ageNumber) {
      showToast(
        `Your entered age (${enteredAgeStr}) does not match your calculated birthdate age (${ageNumber}).`,
        "warning",
      );
      return;
    }

    if (!selectedGender) {
      showToast("Please select your gender.", "warning");
      return;
    }

    if (selectedGender === "Other" && !customGender.trim()) {
      showToast("Please specify your custom gender.", "warning");
      return;
    }

    const pageOneData: OnboardingPageOneData = {
      firstName,
      middleName: (formData.get("middleName") as string)?.trim(),
      lastName,
      age: ageNumber.toString(),
      gender: selectedGender === "Other" ? customGender.trim() : selectedGender,
      birthday,
    };

    localStorage.setItem("onboarding_p1", JSON.stringify(pageOneData));
    router.push("/onboarding/contact-location");
  };

  const currentYear = new Date().getFullYear();
  const yearsList = Array.from(
    { length: currentYear - 1920 + 1 },
    (_, i) => currentYear - i,
  );

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <div className="mb-10">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 01 / 03
        </span>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
          Personal Identity
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-2">
          Let&apos;s start with your basic information.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleNext}>
        <div className="grid grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            defaultValue={googleFirst}
            required
          />
          <InputField
            label="Last Name"
            name="lastName"
            defaultValue={googleLast}
            required
          />
        </div>

        <InputField
          label="Middle Name"
          name="middleName"
          defaultValue={persistedData?.middleName || ""}
          placeholder="Optional"
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Calendar Trigger */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Date of Birth
              <span className="text-red-500 ml-1">*</span>
            </label>

            <button
              type="button"
              onClick={handleOpenCalendar}
              className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm flex items-center justify-between text-left select-none ${
                isCalendarOpen
                  ? "border-[#8b5cf6] ring-4 ring-violet-50/50 bg-white text-zinc-800"
                  : "border-zinc-100 bg-zinc-50/50 text-zinc-600 hover:border-zinc-200"
              }`}
            >
              <span
                className={
                  birthday ? "text-zinc-800 font-medium" : "text-zinc-400"
                }
              >
                {birthday ? formatDisplayDate(birthday) : "Select date"}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-colors ${
                  isCalendarOpen ? "text-[#8b5cf6]" : "text-zinc-400"
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
          </div>

          {/* Age Field */}
          <InputField
            label="Age"
            name="age"
            type="number"
            value={calculatedAge}
            readOnly
            placeholder="Auto-calculated"
            required
          />
        </div>

        {/* Gender Dropdown */}
        <div className="relative" ref={genderRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Gender
            <span className="text-red-500 ml-1">*</span>
          </label>

          <div
            onClick={() => setIsGenderOpen(!isGenderOpen)}
            className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm cursor-pointer flex items-center justify-between select-none ${
              isGenderOpen
                ? "border-[#8b5cf6] ring-4 ring-violet-50/50 bg-white text-zinc-800"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
            }`}
          >
            <span>
              {selectedGender === "Other"
                ? customGender || "Other (please specify)"
                : selectedGender || "Select Gender"}
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
                isGenderOpen ? "rotate-180" : ""
              }`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {isGenderOpen && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div
                onClick={() => {
                  setSelectedGender("Male");
                  setCustomGender("");
                  setIsGenderOpen(false);
                }}
                className="px-4 py-3 text-sm text-zinc-600 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
              >
                Male
              </div>
              <div
                onClick={() => {
                  setSelectedGender("Female");
                  setCustomGender("");
                  setIsGenderOpen(false);
                }}
                className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
              >
                Female
              </div>
              <div
                onClick={() => {
                  setSelectedGender("Other");
                  setIsGenderOpen(false);
                }}
                className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
              >
                Other (please specify)
              </div>
              <div
                onClick={() => {
                  setSelectedGender("Prefer not to specify");
                  setCustomGender("");
                  setIsGenderOpen(false);
                }}
                className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
              >
                Prefer not to specify
              </div>
            </div>
          )}

          {selectedGender === "Other" && (
            <div className="mt-3">
              <input
                type="text"
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value)}
                placeholder="Please specify"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50 text-sm"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] mt-4"
        >
          Continue to Location
        </button>
      </form>

      {/* Centered Modal Backdrop for Calendar */}
      {isCalendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Backdrop Click Target (Saves selection, triggers toast if no day picked) */}
          <div className="absolute inset-0" onClick={handleSaveCalendar} />

          {/* Modal Container */}
          <div className="relative w-full max-w-xs bg-white border border-zinc-100 rounded-3xl shadow-2xl z-10 p-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Select Date of Birth
              </span>
              <button
                type="button"
                onClick={handleCancelCalendar}
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

            {/* Header Month & Year Selectors */}
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

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[11px] font-bold text-zinc-400">
                  {day}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-4">
              {/* Empty Spacer slots for month offset */}
              {Array.from({
                length: getFirstDayOfMonth(calendarYear, calendarMonth),
              }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days Buttons */}
              {Array.from({
                length: getDaysInMonth(calendarYear, calendarMonth),
              }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = tempDay === dayNum;

                return (
                  <button
                    key={dayNum}
                    type="button"
                    onClick={() => handleDayClick(dayNum)}
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

            {/* Action Buttons: Cancel and Save */}
            <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={handleCancelCalendar}
                className="w-1/2 py-2.5 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCalendar}
                className="w-1/2 py-2.5 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-xs font-bold shadow-md shadow-violet-100 transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
