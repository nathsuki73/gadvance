// app/(workspace)/organization/join/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  ArrowLeft,
  Loader2,
  SearchX,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
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
  const { status, update: updateSession } = useSession({ required: true });
  const queryClient = useQueryClient();

  const urlCode = searchParams.get("code") || "";
  const [isJoining, setIsJoining] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const isValidCode = urlCode.trim().length === 6;

  // 🎯 Use TanStack Query for lookup. It automatically deduplicates requests and caches results.
  const {
    data: orgData,
    isLoading: isSearching,
    error: lookupError,
  } = useQuery<Organization, Error>({
    queryKey: ["orgLookup", urlCode],
    queryFn: async () => {
      const res = await apiFetch(
        `/api/organizations/lookup?code=${encodeURIComponent(urlCode.trim())}`,
      );
      if (!res) throw new Error("Unauthorized");
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.message || "Invalid or expired invitation code.",
        );
      }
      return res.json();
    },
    enabled: status === "authenticated" && isValidCode,
    staleTime: 1000 * 60 * 5, // Cache lookup for 5 minutes
    retry: false,
  });

  const errorMessage =
    actionError ||
    (!isValidCode
      ? "Invalid or missing invitation code."
      : lookupError?.message);

  const handleConfirmJoin = async () => {
    if (!urlCode) return;
    setIsJoining(true);
    setActionError(null);
    try {
      const res = await apiFetch("/api/organizations/join", {
        method: "POST",
        body: JSON.stringify({ code: urlCode }),
      });

      if (!res) return;

      if (res.ok) {
        await queryClient.invalidateQueries({ queryKey: ["userOrganization"] });
        await queryClient.invalidateQueries({
          queryKey: ["exploreOrganizations"],
        });
        await queryClient.invalidateQueries({
          queryKey: ["joinedOrganizations"],
        });

        await updateSession();
        router.push("/workspace");
      } else {
        const errData = await res.json().catch(() => ({}));
        setActionError(
          errData.message || "Failed to join organization. Please try again.",
        );
      }
    } catch {
      setActionError("Failed to join organization. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (status === "loading" || (isSearching && isValidCode)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary/30" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans relative flex flex-col">
      {/* Sticky Top Navigation Bar */}
      <nav className="sticky top-0 z-40 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={() => router.push("/workspace/organization")}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary-hover cursor-pointer"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />
            <span className="lowercase font-medium">back</span>
          </button>
        </div>
      </nav>

      {/* Main Content Container */}
      <div className="flex-1 px-6 py-10 md:py-14 flex justify-center">
        <div className="w-full max-w-lg bg-white p-4 sm:p-6">
          <div className="flex flex-col items-center text-center space-y-6">
            {orgData ? (
              /* Confirm Found Organization UI */
              <>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-primary border border-purple-100">
                  <CheckCircle size={13} />
                  <span>Verified Workspace</span>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 text-primary border border-purple-100 mt-2">
                  <Building2 size={32} />
                </div>

                <div className="w-full space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 leading-tight">
                    {orgData.name}
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-md mx-auto">
                    {orgData.description ||
                      "Official institution workspace for gender and development advancement training."}
                  </p>
                </div>

                {errorMessage && (
                  <div className="w-full p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium text-center">
                    {errorMessage}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => router.push("/workspace/organization")}
                    className="w-full sm:flex-1 py-3.5 px-4 rounded-xl text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                  >
                    Enter Different Code
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmJoin}
                    disabled={isJoining}
                    className="w-full sm:flex-1 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="animate-spin" size={14} />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Join</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Friendly Organization Not Found UI */
              <>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                  Notice
                </span>

                <div className="p-4 rounded-2xl bg-zinc-100 text-zinc-400 mt-2">
                  <SearchX size={32} />
                </div>

                <div className="w-full space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
                    Organization Not Found
                  </h1>

                  <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed max-w-sm mx-auto">
                    {errorMessage ||
                      "We couldn't locate an active workspace for that code. Please verify your 6-digit code or ask your team lead for a new invite."}
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => router.push("/workspace/organization")}
                    className="w-full py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-primary hover:bg-primary-hover shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                  >
                    <span>Enter Code Manually</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
