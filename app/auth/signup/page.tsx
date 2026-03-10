"use client";

import React from "react";
import Link from "next/link"; // Essential for SPA-like navigation

const SignUp = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Main Container */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-sm flex overflow-hidden min-h-[600px]">
        {/* Left Side: Form */}
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            {/* Header */}
            <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
              Create <br /> Your Account
            </h1>
            <p className="text-gray-400 mb-10 text-sm">
              Join us and start your journey today
            </p>

            {/* Form */}
            <form className="space-y-4">
              {/* Name */}
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Confirm Password */}
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
              />

              {/* Terms */}
              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium text-gray-400 cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <span className="text-teal-600 hover:underline">
                    Terms & Conditions
                  </span>
                </label>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2"
              >
                Sign Up
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-teal-600 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

        {/* Right Side: Decorative Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Start your journey.</h2>
            <p className="opacity-80 font-light leading-relaxed">
              Get access to all Gadvance features and start building your next
              big idea today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
