"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateProfile } from "./actions";

const Onboarding = () => {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const result = await updateProfile({ firstName, lastName });

    if (result.success) {
      // 1. Force NextAuth to refresh the session so 'status' becomes 'active'
      await update({ status: "active" });

      // 2. Redirect to modules
      router.push("/modules");
    } else {
      alert("Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block">
              First Name
            </label>
            <input
              name="firstName"
              required
              placeholder="e.g. Nathaniel"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase ml-1 mb-2 block">
              Last Name
            </label>
            <input
              name="lastName"
              required
              placeholder="e.g. Segovia"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-900 hover:bg-teal-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? "Saving Details..." : "Finish Setup"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
