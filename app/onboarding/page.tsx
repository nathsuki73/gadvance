"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { finishOnBoarding } from "../actions/onboarding";

const Onboarding = () => {
  const { data: session, update, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. TOP LEVEL HOOK: This watches for session updates globally
  useEffect(() => {
    const normalizedStatus = session?.user?.status?.trim().toLowerCase();
    if (status === "authenticated" && normalizedStatus === "active") {
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
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: String(formData.get("firstName") ?? ""),
      middleName: String(formData.get("middleName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
    };

    const result = await finishOnBoarding(payload);

    if (result.success) {
      const nextStatus = result.user?.status ?? "active";
      const nextName = result.user?.name ?? session?.user?.name;
      const nextEmail = result.user?.email ?? session?.user?.email;
      const nextFirstName = result.userProfile?.first_name ?? payload.firstName;
      const nextMiddleName =
        result.userProfile?.middle_name ?? payload.middleName ?? "";
      const nextLastName = result.userProfile?.last_name ?? payload.lastName;

      await update({
        ...session,
        user: {
          ...session?.user,
          status: nextStatus,
          name: nextName,
          email: nextEmail,
          firstName: nextFirstName,
          middleName: nextMiddleName || null,
          lastName: nextLastName,
        },
      });
      console.log("User", result);
      router.push("/workspace/module");
    } else {
      alert(result.error);
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
