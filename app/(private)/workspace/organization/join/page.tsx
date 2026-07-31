"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Building2, ArrowLeft, Loader2, SearchX } from "lucide-react";
import { apiFetch } from "@/app/lib/api-client";

interface Organization {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
}

export default function JoinOrganizationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession({ required: true });

  const urlCode = searchParams.get("code") || "";
  const [isSearching, setIsSearching] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [orgData, setOrgData] = useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      if (urlCode && urlCode.trim().length === 6) {
        handleFetchOrgByCode(urlCode.trim());
      } else {
        setIsSearching(false);
        setError("Invalid or missing invitation code.");
      }
    }
  }, [urlCode, status]);

  const handleFetchOrgByCode = async (targetCode: string) => {
    setIsSearching(true);
    setError(null);
    try {
      // Lookup endpoint via apiFetch
      const res = await apiFetch(
        `/api/organizations/lookup?code=${encodeURIComponent(targetCode)}`,
      );

      if (!res) return; // Unauthenticated - forceSignOut handles redirect

      if (res.ok) {
        const data = await res.json();
        setOrgData(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Invalid or expired invitation code.");
        setOrgData(null);
      }
    } catch (err: any) {
      setError("Failed to find organization.");
      setOrgData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmJoin = async () => {
    if (!urlCode) return;
    setIsJoining(true);
    setError(null);
    try {
      // Execute join: POST /api/organizations/join
      const res = await apiFetch("/api/organizations/join", {
        method: "POST",
        body: JSON.stringify({ code: urlCode }),
      });

      if (!res) return; // Unauthenticated - forceSignOut handles redirect

      if (res.ok) {
        router.push("/workspace");
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(
          errData.message || "Failed to join organization. Please try again.",
        );
      }
    } catch (err: any) {
      setError("Failed to join organization. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (status === "loading" || isSearching) {
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
            onClick={() => router.push("/workspace/organization")}
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
        <div className="flex flex-col items-center text-center space-y-8">
          {orgData ? (
            /* Confirm Found Organization UI */
            <>
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <Building2 size={32} />
              </div>

              <div className="w-full space-y-8">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-3 py-1 rounded-full inline-block">
                    Organization Found
                  </span>

                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                    {orgData.name}
                  </h1>

                  <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
                    {orgData.description ||
                      "Official institution workspace for gender and development advancement training."}
                  </p>
                </div>

                {error && (
                  <p className="text-xs text-red-500 font-medium">{error}</p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                  <button
                    onClick={() => router.push("/workspace/organization")}
                    className="w-full sm:w-1/2 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 py-3.5 rounded-xl text-xs font-semibold transition-all"
                  >
                    Use Different Code
                  </button>
                  <button
                    onClick={handleConfirmJoin}
                    disabled={isJoining}
                    className="w-full sm:w-1/2 bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm shadow-violet-100"
                  >
                    {isJoining ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      "Confirm & Join"
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Friendly Organization Not Found UI */
            <>
              <div className="p-4 rounded-2xl bg-zinc-100/80 text-zinc-400">
                <SearchX size={32} />
              </div>

              <div className="w-full space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 bg-zinc-100 px-3 py-1 rounded-full inline-block">
                    Notice
                  </span>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                    Organization Not Found
                  </h1>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm mx-auto">
                    We couldn&apos;t locate an active workspace for that code.
                    Please verify your 6-digit code or ask your team lead for a
                    new invite.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => router.push("/workspace/organization")}
                    className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm shadow-violet-100 active:scale-[0.98] inline-flex items-center justify-center gap-2"
                  >
                    <span>Enter Code Manually</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
