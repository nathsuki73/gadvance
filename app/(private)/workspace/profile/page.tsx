"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { User, Mail, Brain } from "lucide-react";

import { ProfileData } from "./types";
import { apiFetch } from "@/app/lib/api-client";
import BasicInfo from "./_components/basic-info";
import ContactInfo from "./_components/contact-info";
import PersonalityInfo from "./_components/personality-info";

const NAV_ITEMS = [
  { id: "basic-info", label: "Basic Information", icon: User },
  { id: "contact-info", label: "Contact Information", icon: Mail },
  { id: "personality", label: "Personality", icon: Brain },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const [activeTab, setActiveTab] = useState<string>("basic-info");
  const [profileData, setProfileData] = useState<ProfileData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Centralized fetch logic
  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated" || !session?.laravelJwt) return;

    try {
      const response = await apiFetch("/api/profile", { method: "GET" });
      if (response && response.ok) {
        const payload = await response.json();
        setProfileData(payload.data ?? payload);
      }
    } catch (error) {
      console.error("Failed to load profile data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, fetchProfile]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
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
    <div className="min-h-screen bg-zinc-50/50 py-8 text-zinc-900 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage and update your personal identity and account parameters.
          </p>
        </header>

        <div className="grid gap-8 items-start md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
            <div className="mb-2 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Navigation
              </span>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-violet-50 text-[#8b5cf6] shadow-sm shadow-violet-500/5"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${isActive ? "text-[#8b5cf6]" : "text-zinc-400"}`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Tab Content Container */}
          <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm md:p-8">
            <div className="border-b border-zinc-100 pb-5">
              <h2 className="text-lg font-bold capitalize tracking-tight text-zinc-900">
                {activeTab.replace("-", " ")}
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                {activeTab === "basic-info" &&
                  "Update your personal identity details and public profile info."}
                {activeTab === "contact-info" &&
                  "Manage primary contact details and communication avenues."}
                {activeTab === "personality" &&
                  "View and refine your workplace personality traits and metrics."}
              </p>
            </div>

            <div className="pt-6">
              {activeTab === "basic-info" && (
                <BasicInfo initialData={profileData} onSuccess={fetchProfile} />
              )}
              {activeTab === "contact-info" && (
                <ContactInfo initialData={profileData} />
              )}
              {activeTab === "personality" && (
                <PersonalityInfo initialData={profileData} />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
