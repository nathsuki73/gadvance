"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Brain,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ContactInfo from "@/app/(private)/workspace/profile/contact-info";
import PersonalityInfo from "@/app/(private)/workspace/profile/personality";
import {
  ProfileApiData,
  ProfileFormData,
} from "@/app/(private)/workspace/profile/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDatabaseData, setIsLoadingDatabaseData] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    birthday: "",
  });

  // Auth Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // Fetch initial profile data
  useEffect(() => {
    const fetchRegisteredProfileData = async () => {
      if (status !== "authenticated") return;

      if (!apiBaseUrl || !session?.laravelJwt) {
        setIsLoadingDatabaseData(false);
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${session.laravelJwt}`,
          },
        });

        if (response.ok) {
          const payload = (await response.json()) as {
            data?: ProfileApiData;
          } & ProfileApiData;
          const dbData = payload.data ?? payload;

          if (!dbData || typeof dbData !== "object") {
            throw new Error("Profile response did not contain data.");
          }

          setFormData({
            firstName: dbData.first_name || "",
            middleName: dbData.middle_name || "",
            lastName: dbData.last_name || "",
            age: dbData.age?.toString() || "",
            gender: dbData.gender || "",
            birthday: dbData.date_of_birth || dbData.birthday || "",
          });
        } else {
          throw new Error(
            `Profile request failed with status ${response.status}.`,
          );
        }
      } catch (error) {
        console.error("Error hydrating profile input initial values:", error);
      } finally {
        setIsLoadingDatabaseData(false);
      }
    };

    fetchRegisteredProfileData();
  }, [status, session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    if (!apiBaseUrl || !session?.laravelJwt) {
      setSaveMessage({
        type: "error",
        text: "Authentication session missing. Please sign in again.",
      });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/user/profile/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${session.laravelJwt}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorText =
          result.message ||
          (result.errors
            ? Object.values(result.errors).flat().join(", ")
            : "") ||
          "Failed to update database profile parameters.";
        throw new Error(errorText);
      }

      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        },
      });

      setSaveMessage({
        type: "success",
        text: "Profile details updated successfully!",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setSaveMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (
    status === "loading" ||
    (status === "authenticated" && isLoadingDatabaseData)
  ) {
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

  const navigationItems = [
    { id: "basic-info", label: "Basic Information", icon: User },
    { id: "contact-info", label: "Contact Information", icon: Mail },
    { id: "personality", label: "Personality", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 py-8 text-zinc-900 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage and update your personal identity and account parameters.
          </p>
        </div>

        <div className="grid gap-8 items-start md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
            <div className="mb-2 px-3 py-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Navigation
              </span>
            </div>
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSaveMessage(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-violet-50 text-[#8b5cf6] shadow-sm shadow-violet-500/5"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-[#8b5cf6]" : "text-zinc-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Card */}
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

            {activeTab === "basic-info" ? (
              <>
                {saveMessage && (
                  <div
                    className={`mt-6 flex items-center gap-3 rounded-xl p-4 text-xs font-medium transition-all ${
                      saveMessage.type === "success"
                        ? "border border-emerald-200/60 bg-emerald-50 text-emerald-700"
                        : "border border-rose-200/60 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {saveMessage.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span>{saveMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="firstName"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="middleName"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        Middle Name
                      </label>
                      <input
                        type="text"
                        id="middleName"
                        name="middleName"
                        value={formData.middleName}
                        onChange={handleInputChange}
                        className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="lastName"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="age"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        Age
                      </label>
                      <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="gender"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer not to say">
                          Prefer not to say
                        </option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="birthday"
                        className="text-xs font-semibold text-zinc-700"
                      >
                        Birthday
                      </label>
                      <input
                        type="date"
                        id="birthday"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        className="rounded-xl border border-zinc-200 px-3.5 py-2.5 text-xs text-zinc-800 outline-none transition-all focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100"
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-end border-t border-zinc-100 pt-5">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#7c3aed] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : activeTab === "contact-info" ? (
              <div className="pt-6">
                <ContactInfo />
              </div>
            ) : activeTab === "personality" ? (
              <div className="pt-6">
                <PersonalityInfo />
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
