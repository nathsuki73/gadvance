"use client";

import { useSession } from "next-auth/react";
import { handleSignIn, handleSignOut } from "../../lib/auth";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import React from "react";

const SignIn = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-sm flex overflow-hidden min-h-[600px]">
        {/* Left Side: Form / Session UI */}
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
            {session ? (
              <div className="animate-in fade-in duration-500">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome back!
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  Logged in as{" "}
                  <span className="text-teal-600 font-medium">
                    {session.user?.email}
                  </span>
                </p>
                <button
                  onClick={handleSignOut}
                  className="px-8 py-3 text-white bg-red-500 rounded-xl font-semibold hover:bg-red-600 transition-all shadow-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  Hello, <br /> Welcome Back
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  Sign in to access your projects and settings.
                </p>

                <form className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <a
                        href="#"
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Forgot?
                      </a>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 py-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 cursor-pointer"
                      defaultChecked
                    />
                    <label
                      htmlFor="remember"
                      className="text-xs font-medium text-gray-400 cursor-pointer select-none"
                    >
                      Keep me logged in
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100"
                  >
                    Sign In
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-gray-300 text-xs uppercase tracking-widest">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  {/* Google SSO Button - Now at the Bottom */}
                  <GoogleButton onClick={handleSignIn} />
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          {!session && (
            <p className="text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <a
                href="/auth/signup"
                className="text-teal-600 font-bold hover:underline"
              >
                Create Account
              </a>
            </p>
          )}
        </div>

        {/* Right Side: Decorative Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Focus on your growth.</h2>
            <p className="opacity-80 font-light leading-relaxed">
              Join thousands of developers building the future of SaaS with
              Gadvance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
