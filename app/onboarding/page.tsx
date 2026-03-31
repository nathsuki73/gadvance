"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { submitOnboardingToLaravel } from "./actions";

const Onboarding = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. TOP LEVEL HOOK: This watches for session updates globally
  useEffect(() => {
    if (status === "authenticated" && session?.user?.status === "active") {
      router.push("/workspace/module");
    }
  }, [session, status, router]);

  // Handle loading state
  if (status === "loading") return null;

  // Split Google name
  const fullName = session?.user?.name || "";
  const [googleFirst, ...lastParts] = fullName.split(" ");
  const googleLast = lastParts.join(" ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.accessToken) {
      alert("Session expired. Please log in again.");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      // Direct browser-to-Laravel call
      await submitOnboardingToLaravel({
        firstName: formData.get("firstName") as string,
        middleName: formData.get("middleName") as string,
        lastName: formData.get("lastName") as string,
        token: session.accessToken,
      });

      // Refresh the NextAuth session to pick up the 'active' status from Laravel
      await update();
    } catch (error: any) {
      // Displays the specific error from Laravel
      alert(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-sm border border-zinc-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-100">
            <span className="text-white font-black text-xl">G</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Your Profile
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Help us personalize your Gadvance experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
              First Name
            </label>
            <input
              name="firstName"
              required
              defaultValue={googleFirst}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
              Middle Name (Optional)
            </label>
            <input
              name="middleName"
              placeholder="Your middle name"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 mb-1 block tracking-wider">
              Last Name
            </label>
            <input
              name="lastName"
              required
              defaultValue={googleLast}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-gray-900 font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-base"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-teal-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4 text-sm uppercase tracking-widest"
          >
            {loading ? "Creating Profile..." : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
