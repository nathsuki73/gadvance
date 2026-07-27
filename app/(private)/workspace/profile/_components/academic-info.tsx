"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, Lock } from "lucide-react";
import { ProfileData } from "../types";
import { apiFetch } from "@/app/lib/api-client";
import { useToast } from "@/app/components/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

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

interface AcademicInfoProps {
  initialData?: ProfileData;
  onSuccess?: () => void;
}

export default function AcademicInfo({
  initialData,
  onSuccess,
}: AcademicInfoProps) {
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const [college, setCollege] = useState("");
  const [program, setProgram] = useState("");
  const [yearLevel, setYearLevel] = useState("");

  useEffect(() => {
    if (initialData) {
      setCollege(initialData.college || "");
      setProgram(initialData.program || "");
      setYearLevel(initialData.yearLevel || initialData.year_level || "");
    }
  }, [initialData]);

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCollege(e.target.value);
    setProgram("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await apiFetch("/api/user/profile/update", {
        method: "PUT",
        body: JSON.stringify({ college, program, yearLevel }),
      });

      if (!response) return;

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Failed to update academic profile.");
      }

      showToast("Academic profile updated successfully!", "success");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.email],
      });

      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      showToast(errorMessage, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const availablePrograms = college
    ? COLLEGES_WITH_PROGRAMS[college]?.programs || []
    : [];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-4 sm:space-y-5">
        {/* Campus (Read Only) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-700">Campus</label>
          <div className="flex w-full min-w-0 items-center justify-between rounded-xl border border-zinc-200/80 bg-zinc-100/70 px-3.5 py-2.5 text-xs text-zinc-500 cursor-not-allowed">
            <span className="truncate pr-2">
              Laguna State Polytechnic University - SPCC
            </span>
            <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </div>
        </div>

        {/* College Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="college"
            className="text-xs font-semibold text-zinc-700"
          >
            College / Department <span className="text-red-500">*</span>
          </label>
          <select
            id="college"
            value={college}
            onChange={handleCollegeChange}
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          >
            <option value="">Select College / Department</option>
            {Object.keys(COLLEGES_WITH_PROGRAMS).map((cKey) => (
              <option key={cKey} value={cKey}>
                {cKey}
              </option>
            ))}
          </select>
        </div>

        {/* Degree Program Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="program"
            className="text-xs font-semibold text-zinc-700"
          >
            Degree Program / Course <span className="text-red-500">*</span>
          </label>
          <select
            id="program"
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            disabled={!college}
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50 disabled:bg-zinc-100/50 disabled:text-zinc-400"
          >
            <option value="">
              {!college ? "Select a College first" : "Select Degree Program"}
            </option>
            {availablePrograms.map((prog) => (
              <option key={prog} value={prog}>
                {prog}
              </option>
            ))}
          </select>
        </div>

        {/* Year Level Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="yearLevel"
            className="text-xs font-semibold text-zinc-700"
          >
            Year Level <span className="text-red-500">*</span>
          </label>
          <select
            id="yearLevel"
            value={yearLevel}
            onChange={(e) => setYearLevel(e.target.value)}
            required
            className="w-full min-w-0 rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-50"
          >
            <option value="">Select Year Level</option>
            {YEAR_LEVELS.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-zinc-100 pt-5 sm:mt-8">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] hover:bg-[#7c3aed] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all disabled:opacity-70"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Academic Profile
            </>
          )}
        </button>
      </div>
    </form>
  );
}
