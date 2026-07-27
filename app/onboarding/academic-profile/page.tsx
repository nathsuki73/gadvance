"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Lock } from "lucide-react";

interface AcademicProfileData {
  college?: string;
  program?: string;
  yearLevel?: string;
}

const COLLEGES_WITH_PROGRAMS: Record<
  string,
  { code: string; programs: string[] }
> = {
  "College of Computer Studies (CCS)": {
    code: "CCS",
    programs: ["BS Information Technology", "BS Computer Science"],
  },
  "College of Teacher Education (CTE)": {
    code: "CTE",
    programs: [
      "Bachelor of Elementary Education",
      "BS Secondary Education major in English",
      "BS Secondary Education major in Mathematics",
      "BS Secondary Education major in Science",
      "BS Secondary Education major in Social Studies",
      "BS Secondary Education major in Filipino",
    ],
  },
  "College of Business Admin. & Accountancy (CBAA)": {
    code: "CBAA",
    programs: [
      "BS Business Administration major in Marketing Management",
      "BS Business Administration major in Human Resource Management",
      "BS Business Administration major in Financial Management",
      "BS Accountancy",
    ],
  },
  "College of Industrial Technology (CIT)": {
    code: "CIT",
    programs: [
      "BS Industrial Technology major in Automotive Technology",
      "BS Industrial Technology major in Electrical Technology",
      "BS Industrial Technology major in Electronics Technology",
      "BS Industrial Technology major in Mechanical Technology",
      "BS Industrial Technology major in Computer Technology",
    ],
  },
  "College of Arts and Sciences (CAS)": {
    code: "CAS",
    programs: ["BS Psychology", "BS Biology", "BA Communication"],
  },
  "College of Int'l Hospitality Management (CIHMT)": {
    code: "CIHMT",
    programs: ["BS Hospitality Management", "BS Tourism Management"],
  },
  "College of Engineering (COE)": {
    code: "COE",
    programs: [
      "BS Computer Engineering",
      "BS Civil Engineering",
      "BS Electrical Engineering",
    ],
  },
  "College of Criminal Justice Education (CCJE)": {
    code: "CCJE",
    programs: ["BS Criminology"],
  },
};

const YEAR_LEVELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function AcademicProfile() {
  const router = useRouter();

  // Lazy state initialization from local storage
  const [persistedData] = useState<AcademicProfileData | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("onboarding_p2");
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AcademicProfileData;
    } catch (e) {
      console.error("Failed to parse onboarding_p2 cache:", e);
      return null;
    }
  });

  const [selectedCollege, setSelectedCollege] = useState<string>(
    () => persistedData?.college || "",
  );
  const [selectedProgram, setSelectedProgram] = useState<string>(
    () => persistedData?.program || "",
  );
  const [selectedYearLevel, setSelectedYearLevel] = useState<string>(
    () => persistedData?.yearLevel || "",
  );

  // Dropdown visibility states
  const [isCollegeOpen, setIsCollegeOpen] = useState(false);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  // Dropdown element refs for outside click detection
  const collegeRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        collegeRef.current &&
        !collegeRef.current.contains(event.target as Node)
      ) {
        setIsCollegeOpen(false);
      }
      if (
        programRef.current &&
        !programRef.current.contains(event.target as Node)
      ) {
        setIsProgramOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCollegeSelect = (collegeName: string) => {
    setSelectedCollege(collegeName);
    setSelectedProgram(""); // Reset program when college changes
    setIsCollegeOpen(false);
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCollege) {
      alert("Please select your College / Department.");
      return;
    }
    if (!selectedProgram) {
      alert("Please select your Degree Program / Course.");
      return;
    }
    if (!selectedYearLevel) {
      alert("Please select your Year Level.");
      return;
    }

    const pageTwoData: AcademicProfileData = {
      college: selectedCollege,
      program: selectedProgram,
      yearLevel: selectedYearLevel,
    };

    localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    router.push("/onboarding/summary");
  };

  const handleBack = () => {
    const pageTwoData: AcademicProfileData = {
      college: selectedCollege,
      program: selectedProgram,
      yearLevel: selectedYearLevel,
    };
    localStorage.setItem("onboarding_p2", JSON.stringify(pageTwoData));
    router.back();
  };

  const availablePrograms = selectedCollege
    ? COLLEGES_WITH_PROGRAMS[selectedCollege]?.programs || []
    : [];

  return (
    <>
      <div className="mb-10">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 02 / 03
        </span>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
          Academic Profile
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-2">
          Please confirm your institutional details at LSPU-SPCC.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleNext}>
        {/* Campus (Locked Field) */}
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Campus
          </label>
          <div className="flex w-full items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-100/70 p-4 text-sm text-zinc-500 cursor-not-allowed select-none">
            <span>Laguna State Polytechnic University - SPCC</span>
            <Lock className="h-4 w-4 text-zinc-400 shrink-0" />
          </div>
        </div>

        {/* College / Department Dropdown */}
        <div className="relative text-left" ref={collegeRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            College / Department <span className="text-red-500 ml-1">*</span>
          </label>

          <button
            type="button"
            onClick={() => setIsCollegeOpen(!isCollegeOpen)}
            className={`flex w-full items-center justify-between rounded-xl border p-4 text-sm transition-all text-left ${
              isCollegeOpen
                ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
            }`}
          >
            <span
              className={
                selectedCollege ? "text-zinc-800 font-medium" : "text-zinc-400"
              }
            >
              {selectedCollege || "Select College / Department"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                isCollegeOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isCollegeOpen && (
            <div className="absolute z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
              {Object.keys(COLLEGES_WITH_PROGRAMS).map((collegeKey) => (
                <button
                  key={collegeKey}
                  type="button"
                  onClick={() => handleCollegeSelect(collegeKey)}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                    selectedCollege === collegeKey
                      ? "bg-violet-50/70 text-[#8b5cf6]"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {collegeKey}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Degree Program / Course Dropdown */}
        <div className="relative text-left" ref={programRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Degree Program / Course <span className="text-red-500 ml-1">*</span>
          </label>

          <button
            type="button"
            disabled={!selectedCollege}
            onClick={() => setIsProgramOpen(!isProgramOpen)}
            className={`flex w-full items-center justify-between rounded-xl border p-4 text-sm transition-all text-left ${
              !selectedCollege
                ? "border-zinc-100 bg-zinc-100/50 text-zinc-300 cursor-not-allowed"
                : isProgramOpen
                  ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                  : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
            }`}
          >
            <span
              className={
                selectedProgram ? "text-zinc-800 font-medium" : "text-zinc-400"
              }
            >
              {!selectedCollege
                ? "Select a College first"
                : selectedProgram || "Select Degree Program"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                isProgramOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isProgramOpen && selectedCollege && (
            <div className="absolute z-50 mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
              {availablePrograms.map((program) => (
                <button
                  key={program}
                  type="button"
                  onClick={() => {
                    setSelectedProgram(program);
                    setIsProgramOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                    selectedProgram === program
                      ? "bg-violet-50/70 text-[#8b5cf6]"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {program}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Year Level Dropdown */}
        <div className="relative text-left" ref={yearRef}>
          <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
            Year Level <span className="text-red-500 ml-1">*</span>
          </label>

          <button
            type="button"
            onClick={() => setIsYearOpen(!isYearOpen)}
            className={`flex w-full items-center justify-between rounded-xl border p-4 text-sm transition-all text-left ${
              isYearOpen
                ? "border-[#8b5cf6] bg-white ring-4 ring-violet-50/50 text-zinc-800"
                : "border-zinc-100 bg-zinc-50/50 text-zinc-600"
            }`}
          >
            <span
              className={
                selectedYearLevel
                  ? "text-zinc-800 font-medium"
                  : "text-zinc-400"
              }
            >
              {selectedYearLevel || "Select Year Level"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                isYearOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isYearOpen && (
            <div className="absolute z-50 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border border-zinc-100 bg-white p-1.5 shadow-2xl shadow-zinc-200/40 animate-in fade-in slide-in-from-top-1 duration-150">
              {YEAR_LEVELS.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setSelectedYearLevel(year);
                    setIsYearOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg px-3 py-2.5 text-xs font-medium text-left transition-colors ${
                    selectedYearLevel === year
                      ? "bg-violet-50/70 text-[#8b5cf6]"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            className="w-1/3 border border-zinc-100 text-zinc-400 px-6 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            className="w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98]"
          >
            Continue
          </button>
        </div>
      </form>
    </>
  );
}
