"use client";

import React, { useState, useEffect } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { finishOnBoarding } from "../(public)/actions/onboarding";

const Onboarding = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const normalizedStatus = session?.user?.status?.trim().toLowerCase();
  const shouldShowRedirecting =
    isRedirecting ||
    (status === "authenticated" && normalizedStatus === "active");

  const waitForActiveSession = async () => {
    for (let i = 0; i < 8; i += 1) {
      const latest = await getSession();
      const latestStatus = latest?.user?.status?.trim().toLowerCase();
      if (latestStatus === "active") {
        return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return false;
  };

  // 1. TOP LEVEL HOOK: This watches for session updates globally
  useEffect(() => {
    if (status === "authenticated" && normalizedStatus === "active") {
      router.replace("/workspace/module");
    }
  }, [status, normalizedStatus, router]);

  // Handle loading state
  if (status === "loading" || shouldShowRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-sm border border-zinc-100 text-center">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Almost there</h1>
          <p className="text-gray-400 text-sm mt-2">
            Redirecting you to Workspace Module...
          </p>
        </div>
      </div>
    );
  }

  const googleFirst = session?.user?.firstName || "";
  const googleLast = session?.user?.lastName || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        firstName: String(formData.get("firstName") ?? ""),
        middleName: String(formData.get("middleName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
      };

      const result = await finishOnBoarding(payload);

      if (!result.success) {
        alert(result.error);
        return;
      }

      const nextStatus = result.user?.status ?? "active";
      const nextEmail = result.user?.email ?? session?.user?.email;
      const nextFirstName = result.userProfile?.first_name ?? payload.firstName;
      const nextMiddleName =
        result.userProfile?.middle_name ?? payload.middleName ?? "";
      const nextLastName = result.userProfile?.last_name ?? payload.lastName;

      const updatedSession = await update({
        ...session,
        user_profile: {
          first_name: nextFirstName,
          middle_name: nextMiddleName || null,
          last_name: nextLastName,
        },
        user: {
          ...session?.user,
          status: nextStatus,
          email: nextEmail,
          firstName: nextFirstName,
          middleName: nextMiddleName || null,
          lastName: nextLastName,
        },
      });

      const updatedStatus = updatedSession?.user?.status?.trim().toLowerCase();
      if (updatedStatus !== "active") {
        await waitForActiveSession();
      }

      setIsRedirecting(true);
      console.log("User", result);
      router.replace("/workspace/module");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      alert("Unable to finish onboarding right now. Please try again.");
      setIsRedirecting(false);
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
