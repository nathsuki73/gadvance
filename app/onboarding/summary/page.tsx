"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiFetch, forceSignOut } from "@/app/lib/api-client";

interface OnboardingP1 {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  age?: string;
  gender?: string;
  birthday?: string;
}

interface OnboardingP2 {
  college?: string;
  program?: string;
  yearLevel?: string;
}

interface ProfileSummaryData {
  fullName: string;
  age: string;
  gender: string;
  birthday: string;
  college: string;
  program: string;
  yearLevel: string;
}

export default function StudentSummary() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [summary, setSummary] = useState<ProfileSummaryData>({
    fullName: "—",
    age: "—",
    gender: "—",
    birthday: "—",
    college: "—",
    program: "—",
    yearLevel: "—",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedP1 = localStorage.getItem("onboarding_p1");
    const savedP2 = localStorage.getItem("onboarding_p2");
    const savedP3 = localStorage.getItem("onboarding_p3");

    const p1: OnboardingP1 = savedP1 ? JSON.parse(savedP1) : {};
    const p2: OnboardingP2 = savedP2 ? JSON.parse(savedP2) : {};

    if (savedP3) {
      try {
        const p3 = JSON.parse(savedP3);
        setAgreed(Boolean(p3.agreed));
      } catch (e) {
        console.error("Failed to parse onboarding_p3 cache:", e);
      }
    }

    const fullName = [p1.firstName, p1.middleName, p1.lastName]
      .filter(Boolean)
      .join(" ");

    setSummary({
      fullName: fullName || session?.user?.name || "—",
      age: p1.age || "—",
      gender: p1.gender || "—",
      birthday: p1.birthday || "—",
      college: p2.college || "—",
      program: p2.program || "—",
      yearLevel: p2.yearLevel || "—",
    });
  }, [session]);

  const handleBack = () => {
    localStorage.setItem("onboarding_p3", JSON.stringify({ agreed }));
    router.back();
  };

  const handleFinalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!agreed) {
      alert("Please check the consent checkbox to participate in research.");
      return;
    }

    setLoading(true);

    try {
      const p1 = JSON.parse(localStorage.getItem("onboarding_p1") || "{}");
      const p2 = JSON.parse(localStorage.getItem("onboarding_p2") || "{}");

      const payload = {
        firstName: p1.firstName,
        middleName: p1.middleName,
        lastName: p1.lastName,
        age: p1.age,
        gender: p1.gender,
        birthday: p1.birthday,
        college: p2.college,
        program: p2.program,
        yearLevel: p2.yearLevel,
        researchConsent: agreed,
      };

      // Directly hit Laravel API endpoint via apiFetch!
      const res = await apiFetch("/api/onboarding", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res) return; // apiFetch handles 401 & forceSignOut automatically

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to finalize profile.");
        setLoading(false);
        return;
      }

      // Cleanup LocalStorage
      localStorage.removeItem("onboarding_p1");
      localStorage.removeItem("onboarding_p2");
      localStorage.removeItem("onboarding_p3");

      // Update NextAuth session status to active
      await update({
        user: {
          ...session?.user,
          status: "active",
        },
      });

      window.location.href = "/workspace";
    } catch (error) {
      console.error("Onboarding Submit Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-[0.4em]">
          step 03 / 03
        </span>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2 tracking-tight">
          Profile Summary
        </h1>
        <p className="text-zinc-400 text-sm font-light mt-2">
          Review your details to initialize your GAD learning pathway.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleFinalSubmit}>
        {/* Profile Summary Container */}
        <div className="rounded-2xl border border-zinc-100 bg-zinc-50/60 p-5 space-y-4">
          <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
            Personal Information
          </span>

          <div className="grid grid-cols-2 gap-3 text-xs text-zinc-600">
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                Full Name
              </span>
              <span className="font-medium text-zinc-800">
                {summary.fullName}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                Gender
              </span>
              <span className="font-medium text-zinc-800">
                {summary.gender}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                Age
              </span>
              <span className="font-medium text-zinc-800">{summary.age}</span>
            </div>
            <div>
              <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                Date of Birth
              </span>
              <span className="font-medium text-zinc-800">
                {summary.birthday}
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-200/60 pt-3">
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              Academic Details
            </span>
            <div className="space-y-2 text-xs text-zinc-600">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                  College
                </span>
                <span className="font-medium text-zinc-800">
                  {summary.college}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Program
                  </span>
                  <span className="font-medium text-zinc-800">
                    {summary.program}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-semibold">
                    Year Level
                  </span>
                  <span className="font-medium text-zinc-800">
                    {summary.yearLevel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Research Consent Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group select-none pt-1">
          <div className="relative flex items-center mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="peer h-4 w-4 shrink-0 rounded border-zinc-300 text-[#8b5cf6] focus:ring-[#8b5cf6] cursor-pointer"
            />
          </div>
          <span className="text-xs text-zinc-500 leading-relaxed group-hover:text-zinc-700 transition-colors">
            I agree to participate in the GADvance learning evaluation and allow
            my anonymized interaction logs to be processed for research
            purposes.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={loading}
            className="w-1/3 border border-zinc-100 text-zinc-400 px-6 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all disabled:opacity-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-2/3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Saving..." : "Finish & Start"}
          </button>
        </div>
      </form>
    </>
  );
}
