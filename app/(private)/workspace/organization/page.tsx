"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  ArrowRight,
  Copy,
  Check,
  Users,
  BookOpen,
  ShieldCheck,
  Loader2,
  ArrowLeft,
} from "lucide-react";

// Service fetch function for user's organization status
async function getUserOrganization() {
  // Replace with your actual API endpoint
  return null;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  // Query user's current organization state
  const { data: orgData, isLoading } = useQuery({
    queryKey: ["userOrganization", session?.user?.email],
    queryFn: getUserOrganization,
    enabled: status === "authenticated",
  });

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      // Redirect straight to the join preview page with code in URL
      router.push(`/workspace/organization/join?code=${code}`);
    }
  };

  const handleCopyCode = (inviteCode: string) => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary/30" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans relative">
      {/* Sticky Top Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={() => router.push("/workspace")}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary-hover"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="lowercase font-medium">back to workspace</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-16 md:py-24">
        {/* ========================================================= */}
        {/* STATE A: User ALREADY Belongs to an Organization          */}
        {/* ========================================================= */}
        {orgData ? (
          <div className="space-y-10 text-center sm:text-left">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-3">
                <ShieldCheck size={14} /> Active Organization
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {orgData.name || "GADvance Academy"}
              </h1>
              <p className="text-xs text-zinc-400 font-light mt-2 leading-relaxed">
                {orgData.description ||
                  "Official institution workspace for gender and development advancement training."}
              </p>
            </div>

            <div className="border-t border-b border-zinc-100 py-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">
                  Invitation Code
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-mono font-bold text-primary tracking-widest">
                    {orgData.code || "123456"}
                  </span>
                  <button
                    onClick={() => handleCopyCode(orgData.code || "123456")}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-primary" />
                  <div>
                    <span className="text-lg font-light block text-zinc-900">
                      {orgData.memberCount || 24}
                    </span>
                    <span className="text-[10px] uppercase font-medium text-zinc-400">
                      Members
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen size={18} className="text-primary" />
                  <div>
                    <span className="text-lg font-light block text-zinc-900">
                      {orgData.moduleCount || 8}
                    </span>
                    <span className="text-[10px] uppercase font-medium text-zinc-400">
                      Modules
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* STATE B: Onboarding Flow - Type Code Page                  */
          /* ========================================================= */
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary">
              <Building2 size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                Join an Organization
              </h1>
              <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                Enter your 6-digit invitation code below to find and connect
                with your institution.
              </p>
            </div>

            <form onSubmit={handleSubmitCode} className="w-full space-y-6 pt-2">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  className="w-full text-center text-3xl font-mono tracking-[0.3em] uppercase py-4 border-b-2 border-zinc-200 bg-transparent focus:outline-none focus:border-primary transition-colors placeholder:text-zinc-200 placeholder:tracking-[0.3em]"
                />
              </div>

              <button
                type="submit"
                disabled={code.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-30 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-sm shadow-violet-100"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
