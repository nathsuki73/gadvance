"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { User, MapPin, Image as ImageIcon } from "lucide-react";

import { ProfileData } from "./types";
import { apiFetch } from "@/app/lib/api-client";
import BasicInfo from "./_components/basic-info";
import ContactLocationInfo from "./_components/contact-location-info";
import AvatarBioInfo from "./_components/avatar-bio-info";

const NAV_ITEMS = [
  { id: "personal-identity", label: "Personal Identity", icon: User },
  { id: "contact-location", label: "Contact & Location", icon: MapPin },
  { id: "avatar-bio", label: "Avatar & Bio", icon: ImageIcon },
] as const;

export default function ProfilePage() {
  const { status, data: session } = useSession();

  const [activeTab, setActiveTab] = useState<string>("personal-identity");
  const [profileData, setProfileData] = useState<ProfileData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (status !== "authenticated" || !session?.laravelJwt) return;

    try {
      const response = await apiFetch("/api/user/profile", { method: "GET" });
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
                <BasicInfo initialData={profileData} onSuccess={fetchProfile} />
              )}
              {activeTab === "contact-location" && (
                <ContactLocationInfo
                  initialData={profileData?.profile || profileData?.user_profile || profileData}
                  onSuccess={fetchProfile}
                />
              )}
              {activeTab === "avatar-bio" && (
                <AvatarBioInfo
                  initialData={profileData}
                  onSuccess={fetchProfile}
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
