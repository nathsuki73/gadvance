"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import { sendForgotPasswordOtp } from "./actions";
import logoIcon from "@/app/assets/logo.ico";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const response = await sendForgotPasswordOtp(email);
      if (response.success) {
        router.push(
          `/auth/verify-otp?context=reset&email=${encodeURIComponent(email)}`,
        );
        return;
      }
      setErrorMessage(response.error || "Failed to send verification code.");
    } catch {
      setErrorMessage("Connection failed. Check your network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo - Top Left */}
        <Link
          href="/auth/signin"
          className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity group"
        >
          <div className="relative h-9 w-9 shrink-0">
            <img
              src={logoIcon.src}
              alt="GADVance logo"
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-2xl font-semibold tracking-tight text-gray-900 group-hover:text-teal-600 transition-colors">
            GADVance
          </span>
        </Link>

        {/* Form Content */}
        <div>
          {/* Title with blue/teal accent */}
          <h1 className="text-[42px] leading-none font-bold tracking-tighter mb-3">
            <span className="text-gray-900">Forgot</span>
            <span className="text-[#00B4D8]"> Password?</span>
          </h1>

          <p className="text-gray-500 mb-10 text-[17px] leading-relaxed">
            No worries! Enter your email and we will send a 6-digit security
            code to reset your password.
          </p>

          {errorMessage && (
            <p className="mb-6 rounded-2xl border border-rose-100 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
              {errorMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/30 focus:border-[#00B4D8] transition-all text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Button with design's blue-teal color */}
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#00B4D8] hover:bg-[#00A8CC] text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.985] disabled:opacity-60"
            >
              {loading ? "Sending Code..." : "SEND VERIFICATION CODE"}
            </button>
          </form>

          <div className="mt-10">
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#00B4D8] transition-colors"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              BACK TO SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
