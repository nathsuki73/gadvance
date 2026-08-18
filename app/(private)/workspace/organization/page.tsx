"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Building2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/app/lib/api-client";

// Service fetch function using apiFetch
async function getUserOrganization() {
  const res = await apiFetch("/api/organizations");
  if (!res || !res.ok) return null;

  const data = await res.json();

  // 🎯 Explicitly verify that data exists AND has an id
  if (!data || !data.id) {
    return null;
  }

  return data;
}

export default function OrganizationPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [code, setCode] = useState("");

  // Query user's current organization state
  const { data: orgData, isLoading } = useQuery({
    queryKey: ["userOrganization", session?.user?.email],
    queryFn: getUserOrganization,
    enabled: status === "authenticated",
  });

  // 🛡️ Redirect to workspace if the user is ALREADY in an organization
  useEffect(() => {
    if (orgData) {
      router.replace("/workspace");
    }
  }, [orgData, router]);

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      router.push(`/workspace/organization/join?code=${code}`);
    }
  };

  if (status === "loading" || isLoading || orgData) {
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
            onClick={() => router.back()}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary-hover"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="lowercase font-medium">back</span>
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-16 md:py-24">
        {/* Onboarding Flow - Type Code Page */}
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="p-4 rounded-2xl bg-primary/10 text-primary">
            <Building2 size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
              Join an Organization
            </h1>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
              Enter your 6-digit invitation code below to find and connect with
              your institution.
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
      </div>
    </main>
  );
}
