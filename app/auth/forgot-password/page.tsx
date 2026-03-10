"use client";

import React, { useState } from "react";
import Link from "next/link";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your password reset logic here (e.g., Firebase, Supabase, or custom API)
    console.log("Reset link sent to:", email);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-sm flex overflow-hidden min-h-[600px]">
        {/* Left Side: Reset Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <Link
              href="/auth/signin"
              className="flex items-center gap-2 mb-12 w-fit"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </Link>

            {/* Header */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {isSubmitted ? "Check your email" : "Forgot Password?"}
              </h1>
              <p className="text-gray-400 mb-10 text-sm max-w-sm">
                {isSubmitted
                  ? `We've sent a password reset link to ${email}. Please check your inbox.`
                  : "No worries! Enter your email address and we'll send you a link to reset your password."}
              </p>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2"
                  >
                    Send Reset Link
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="text-teal-600 font-bold text-sm hover:underline"
                >
                  Didn't get the email? Try again
                </button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8">
            <Link
              href="/auth/signin"
              className="group flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Right Side: Decorative Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-10 h-10"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">Secure your account.</h2>
            <p className="opacity-80 font-light leading-relaxed">
              We use industry-standard encryption to ensure your password reset
              process is safe and private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
