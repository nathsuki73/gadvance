"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  MapPin,
  Image as ImageIcon,
  Download,
  CheckCircle2,
  FileText,
  Search,
  X,
  RotateCcw,
} from "lucide-react";

import { ProfileData } from "./types";
import BasicInfo from "./_components/basic-info";
import ContactLocationInfo from "./_components/contact-location-info";
import AvatarBioInfo from "./_components/avatar-bio-info";
import { getUserProfile, getStudentCertificates } from "../service";

const NAV_ITEMS = [
  { id: "personal-identity", label: "Personal Identity", icon: User },
  { id: "contact-location", label: "Contact & Location", icon: MapPin },
  { id: "avatar-bio", label: "Avatar & Bio", icon: ImageIcon },
] as const;

export default function ProfilePage() {
  const { status, data: session } = useSession();
  const userEmail = session?.user?.email;

  const [activeTab, setActiveTab] = useState<string>("personal-identity");
  const [certificateSearchQuery, setCertificateSearchQuery] =
    useState<string>("");

  // 1. Fetch User Profile using React Query cleanly typed to ProfileData
  const { data: profileData, isLoading: isProfileLoading } =
    useQuery<ProfileData>({
      queryKey: ["userProfile", userEmail],
      queryFn: async () => {
        const res = await getUserProfile();
        if (!res.success || !res.data) {
          throw new Error("Failed to fetch profile data");
        }
        return res.data as ProfileData;
      },
      enabled: status === "authenticated",
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    });

  // 2. Fetch Certificates using React Query (Cached & Optimized)
  const { data: certificatesResponse, isLoading: certsLoading } = useQuery({
    queryKey: ["studentCertificates", userEmail],
    queryFn: async () => {
      const res = await getStudentCertificates();
      if (!res.success || !res.data) {
        return [];
      }
      return res.data;
    },
    enabled: status === "authenticated",
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const certificates = certificatesResponse ?? [];

  // Filter logic for certificates
  const filteredCertificates = certificates.filter((cert) => {
    const cleanQuery = certificateSearchQuery.trim().toLowerCase();
    if (!cleanQuery) return true;
    const title = (cert.learning_plan?.title || "").toLowerCase();
    const code = (cert.verify_code || "").toLowerCase();
    return title.includes(cleanQuery) || code.includes(cleanQuery);
  });

  const isLoading = status === "loading" || isProfileLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-[#8b5cf6]" />
          <p className="text-xs font-medium text-zinc-400">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-zinc-50/50 py-6 text-zinc-900 md:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 md:mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            Account Settings
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            View and manage your student profile and contact details.
          </p>
        </header>

        {/* Profile Settings Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr] md:gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="w-full min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-2 sm:p-3 shadow-sm">
            <div className="hidden md:block mb-2 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Navigation
              </span>
            </div>
            <nav className="flex w-full min-w-0 gap-1 overflow-x-auto no-scrollbar md:flex-col">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap md:w-full ${
                      isActive
                        ? "bg-violet-50 text-[#8b5cf6] shadow-sm shadow-violet-500/5"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive ? "text-[#8b5cf6]" : "text-zinc-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Form Area */}
          <section className="w-full min-w-0 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-6 md:p-8">
            <div className="border-b border-zinc-100 pb-4 sm:pb-5">
              <h2 className="text-base font-bold tracking-tight text-zinc-900 sm:text-lg">
                {activeTab === "personal-identity" && "Personal Identity"}
                {activeTab === "contact-location" && "Contact & Location"}
                {activeTab === "avatar-bio" && "Avatar & Bio"}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {activeTab === "personal-identity" &&
                  "Update your full legal name, age, gender, and date of birth."}
                {activeTab === "contact-location" &&
                  "Update your address, location, and phone number details."}
                {activeTab === "avatar-bio" &&
                  "Update your profile picture and short personal bio."}
              </p>
            </div>

            <div className="pt-4 sm:pt-6">
              {activeTab === "personal-identity" && (
                <BasicInfo initialData={profileData} onSuccess={() => {}} />
              )}
              {activeTab === "contact-location" && (
                <ContactLocationInfo
                  initialData={profileData}
                  onSuccess={() => {}}
                />
              )}
              {activeTab === "avatar-bio" && (
                <AvatarBioInfo initialData={profileData} onSuccess={() => {}} />
              )}
            </div>
          </section>
        </div>

        {/* Certificates Section */}
        <section className="mt-12 md:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                My Certificates
              </h2>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                View, download, and manage your earned credentials of
                completion.
              </p>
            </div>
            <span className="self-start sm:self-auto rounded-full bg-zinc-200/80 px-3 py-1 text-xs font-bold text-zinc-700">
              {filteredCertificates.length}{" "}
              {filteredCertificates.length === 1
                ? "Certificate"
                : "Certificates"}
            </span>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative flex items-center w-full">
              <div className="pointer-events-none absolute left-6 flex items-center justify-center text-zinc-400 z-10 select-none">
                <Search size={18} />
              </div>

              <input
                type="text"
                placeholder="Search certificates by title or verification code..."
                value={certificateSearchQuery}
                onChange={(e) => setCertificateSearchQuery(e.target.value)}
                style={{ paddingLeft: "3.75rem", paddingRight: "3rem" }}
                className="w-full rounded-full border border-zinc-200 bg-white py-3.5 text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 shadow-sm shadow-violet-500/5 transition-all focus:border-[#8b5cf6] focus:outline-none focus:ring-1 focus:ring-[#8b5cf6]"
              />

              {certificateSearchQuery && (
                <button
                  type="button"
                  onClick={() => setCertificateSearchQuery("")}
                  className="absolute right-4 p-1 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {certsLoading ? (
            <div className="flex h-48 w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-100 border-t-[#8b5cf6]" />
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-bold text-zinc-800">
                {certificates.length === 0
                  ? "No Certificates Earned Yet"
                  : "No matching certificates found"}
              </h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                {certificates.length === 0
                  ? "Complete your enrolled learning plans and achieve 100% progress to earn and unlock official certificates."
                  : `We couldn't find anything matching "${certificateSearchQuery}". Try adjusting your keywords.`}
              </p>
              {certificates.length > 0 && (
                <button
                  onClick={() => setCertificateSearchQuery("")}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#8b5cf6] px-5 py-2 text-xs font-semibold text-white hover:bg-[#7c3aed] transition-all cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Clear search</span>
                </button>
              )}
            </div>
          ) : (
            <div className="max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filteredCertificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all hover:border-purple-300 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-100 px-3 py-1 text-[11px] font-bold text-[#8b5cf6]">
                          <CheckCircle2 size={12} /> Verified Credential
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-zinc-400">
                          {cert.verify_code}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 line-clamp-2">
                          {cert.learning_plan?.title ||
                            "Certificate of Completion"}
                        </h3>
                        <p className="mt-1 text-[11px] text-zinc-500">
                          Earned on{" "}
                          {new Date(cert.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6 flex items-center pt-4 border-t border-zinc-100">
                      <a
                        href={cert.azure_file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#8b5cf6] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#7c3aed] active:scale-[0.98]"
                      >
                        <Download size={14} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
