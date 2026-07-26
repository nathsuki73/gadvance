"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { InputField } from "./_components/InputField";

interface OnboardingPageOneData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

export default function OnboardingPageOne() {
  const { data: session } = useSession();
  const router = useRouter();

  // 1. Lazy state initialization: reads localStorage once synchronously before initial render
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

  // Initialize gender state directly from persistedData
  const [selectedGender, setSelectedGender] = useState<string>(() => {
    const gender = persistedData?.gender;
    if (!gender) return "";
    return gender === "Male" || gender === "Female" ? gender : "Other";
  });

  const [customGender, setCustomGender] = useState<string>(() => {
    const gender = persistedData?.gender;
    if (!gender) return "";
    return gender === "Male" || gender === "Female" ? "" : gender;
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 2. Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Split Google full name properly into First and Last names
  const rawNameParts = (session?.user?.name || "").trim().split(/\s+/);
  const fallbackFirst = rawNameParts[0] || "";
  const fallbackLast =
    rawNameParts.length > 1 ? rawNameParts.slice(1).join(" ") : "";

  const googleFirst = persistedData?.firstName || fallbackFirst;
  const googleLast = persistedData?.lastName || fallbackLast;

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedGender) {
      alert("Please select your gender.");
      return;
    }

    if (selectedGender === "Other" && !customGender.trim()) {
      alert("Please specify your gender.");
      return;
    }

    const pageOneData: OnboardingPageOneData = {
      firstName: formData.get("firstName") as string,
      middleName: formData.get("middleName") as string,
      lastName: formData.get("lastName") as string,
      age: formData.get("age") as string,
      gender: selectedGender === "Other" ? customGender.trim() : selectedGender,
      birthday: formData.get("birthday") as string,
    };

    localStorage.setItem("onboarding_p1", JSON.stringify(pageOneData));
    router.push("/onboarding/contact-location");
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
          <InputField
            label="Age"
            name="age"
            type="number"
            defaultValue={persistedData?.age || ""}
            required
          />

          <div className="relative" ref={dropdownRef}>
            <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
              Gender
              <span className="text-red-500 ml-1">*</span>
            </label>

            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-4 py-3.5 rounded-xl border transition-all text-sm cursor-pointer flex items-center justify-between select-none ${
                isDropdownOpen
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
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div
                  onClick={() => {
                    setSelectedGender("Male");
                    setCustomGender("");
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-zinc-600 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
                >
                  Male
                </div>
                <div
                  onClick={() => {
                    setSelectedGender("Female");
                    setCustomGender("");
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
                >
                  Female
                </div>
                <div
                  onClick={() => {
                    setSelectedGender("Other");
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-3 text-sm text-zinc-600 border-t border-zinc-50 hover:bg-violet-50/60 hover:text-[#8b5cf6] cursor-pointer transition-colors"
                >
                  Other (please specify)
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
        </div>

        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Date of Birth
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            name="birthday"
            type="date"
            required
            defaultValue={persistedData?.birthday || ""}
            className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 bg-zinc-50/50 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] mt-4"
        >
          Continue to Address
        </button>
      </form>
    </>
  );
}
