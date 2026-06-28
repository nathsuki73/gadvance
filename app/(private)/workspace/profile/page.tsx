"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  Brain,
  Save,
  Loader2,
  Shield,
  MapPin,
} from "lucide-react";
import PublicHeader from "@/app/(public)/_components/header/PublicHeader";
import Footer from "@/app/components/Footer";
import ContactInfo from "@/app/(private)/workspace/profile/contact-info";
import PersonalityInfo from "@/app/(private)/workspace/profile/personality";
import { ProfileApiData, ProfileFormData } from "@/app/(private)/workspace/profile/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  
  const [activeTab, setActiveTab] = useState("basic-info");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDatabaseData, setIsLoadingDatabaseData] = useState(true);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    gender: "",
    birthday: "",
  });

  // Auth Guard Loop
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  // Fetch verified registration data from database on mount
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
          throw new Error(`Profile request failed with status ${response.status}.`);
        }
      } catch (error) {
        console.error("Error hydrating profile input initial values:", error);
      } finally {
        setIsLoadingDatabaseData(false);
      }
    };

    fetchRegisteredProfileData();
  }, [status, session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    if (!apiBaseUrl || !session?.laravelJwt) {
      setSaveMessage({ type: "error", text: "Authentication session missing. Please sign in again." });
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
          (result.errors ? Object.values(result.errors).flat().join(", ") : "") ||
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

      setSaveMessage({ type: "success", text: "Profile details updated successfully!" });
    } catch (error: any) {
      setSaveMessage({ type: "error", text: error.message || "Something went wrong. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoadingDatabaseData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffdf8]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#00a9d1]/20 border-t-[#00a9d1]" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf8] text-zinc-900">
      <main className="relative flex-1 overflow-hidden py-12 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-28 -left-24 h-96 w-96 rounded-full bg-[#00a9d1]/10 blur-3xl" />
          <div className="absolute right-0 top-28 h-96 w-96 rounded-full bg-[#ff8a00]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[280px_1fr] items-start">
            
            {/* Left Sidebar Menu */}
            <aside className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4">
              <div className="mb-4 px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Manage Account</p>
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("basic-info")}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "basic-info"
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <User className="h-4 w-4" />
                  Basic Information
                </button>
                <button
                  onClick={() => setActiveTab("contact-info")}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "contact-info"
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Mail className="h-4 w-4" /> Contact Information
                </button>
                <button
                  onClick={() => setActiveTab("personality")}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === "personality"
                      ? "bg-primary/10 text-primary"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  <Brain className="h-4 w-4" /> Personality
                </button>
              </nav>
            </aside>

            {/* Right Side Card Frame */}
            <section className="rounded-3xl border border-zinc-200 bg-white p-6 md:p-8">
              <div className="border-b border-zinc-100 pb-5">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Edit Profile</h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Modifying account configurations populated from registration details.
                </p>
              </div>

              {activeTab === "basic-info" ? (
                <>
                  {saveMessage && (
                    <div className={`mt-6 rounded-xl p-4 text-sm font-medium ${saveMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                      {saveMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="firstName" className="text-xs font-semibold text-zinc-600">First Name</label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="middleName" className="text-xs font-semibold text-zinc-600">Middle Name</label>
                        <input
                          type="text"
                          id="middleName"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="lastName" className="text-xs font-semibold text-zinc-600">Last Name</label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="age" className="text-xs font-semibold text-zinc-600">Age</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          min="1"
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="gender" className="text-xs font-semibold text-zinc-600">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none bg-white transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="birthday" className="text-xs font-semibold text-zinc-600">Birthday</label>
                        <input
                          type="date"
                          id="birthday"
                          name="birthday"
                          value={formData.birthday}
                          onChange={handleInputChange}
                          className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-[#00a9d1]/10"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end border-t border-zinc-100 pt-5">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#00a9d1]/20 hover:bg-primary-hover transition-all disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Updates...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Information
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : activeTab === "contact-info" ? (
                <ContactInfo />
              ) : activeTab === "personality" ? (
                <PersonalityInfo />
              ) : (
                <div className="py-8 text-sm text-zinc-500">Coming soon.</div>
              )}
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;