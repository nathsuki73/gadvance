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
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side - Decorative Branding Panel */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-teal-400 via-[#00A8CC] to-blue-600 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(at_40%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>

        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 text-white text-center px-8 max-w-md">
          <div className="w-28 h-28 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <KeyRound size={64} className="text-white" />
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6">
            Secure your account.
          </h2>
          <p className="text-xl opacity-90 leading-relaxed">
            Multi-factor authentication ensures that only you can access and
            reset your password.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col lg:items-center justify-center p-8 md:p-12 lg:p-16 relative">
        {/* Logo - Top Right + Clickable */}
        <Link
          href="/auth/signin"
          className="absolute top-8 right-8 lg:top-10 lg:right-12 flex items-center gap-2 z-20 hover:opacity-80 transition-opacity group"
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

        <div className="w-full max-w-lg mt-16 lg:mt-0">
          {/* Updated Title Style */}
          <h1 className="mb-2">
            <span className="text-4xl font-bold text-gray-900">Forgot</span>
            <span className="text-4xl font-bold text-teal-500"> Password?</span>
          </h1>

          <p className="text-gray-500 mb-10 text-lg">
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
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="joe@example.com"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-gray-700 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white py-4 rounded-2xl text-sm font-bold uppercase tracking-widest transition-all shadow-md active:scale-[0.985] disabled:opacity-60"
            >
              {loading ? "Sending Code..." : "SEND VERIFICATION CODE"}
            </button>
          </form>

          <div className="mt-10">
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-teal-600 transition-colors"
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
