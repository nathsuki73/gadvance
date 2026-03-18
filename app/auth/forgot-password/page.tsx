"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Logic: 1. Check if email exists -> 2. Generate Reset OTP -> 3. SMTP Send
    // Redirecting to our Smart OTP page with the reset context
    setTimeout(() => {
      setLoading(false);
      router.push(
        `/auth/verify-otp?context=reset&email=${encodeURIComponent(email)}`,
      );
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[600px] border border-zinc-100">
        {/* Left Side: Reset Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                Forgot <br /> <span className="text-teal-500">Password?</span>
              </h1>
              <p className="text-gray-400 mb-10 text-sm max-w-sm font-medium">
                No worries! Enter your email and we'll send a 6-digit security
                code to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    size={20}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Sending Code..." : "Send Verification Code"}
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Right Side: Decorative Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
              <KeyRound size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure reset.</h2>
            <p className="opacity-80 font-light leading-relaxed max-w-xs">
              We use multi-factor authentication to ensure that only you can
              access and change your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
