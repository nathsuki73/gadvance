"use client";

import { useSession } from "next-auth/react";
import { handleSignIn, handleSignOut } from "../../lib/auth";
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
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {session.user?.name}!
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  You are now signed in.
                </p>
                <button
                  onClick={handleSignOut}
                  className="px-6 py-3 text-white bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Hello, <br /> Welcome Back
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  Welcome back to your special place
                </p>

                {/* Form (optional, still works for email/password if you add backend) */}
                <form className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="johndoe@gmail.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="••••••••••••••••"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-gray-600 placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium py-2">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-400">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        defaultChecked
                      />
                      Remember me
                    </label>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  {/* Sign In Buttons */}
                  <div className="flex flex-col gap-3 mt-4">
                    <button
                      type="button"
                      onClick={handleSignIn} // Google Sign In
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Sign in with Google
                    </button>

                    <button
                      type="submit"
                      className="bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Sign In with Email
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          {!session && (
            <p className="text-sm text-gray-500 mt-8">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-teal-500 font-semibold hover:underline"
              >
                Sign Up
              </a>
            </p>
          )}
        </div>

        {/* Right Side: Decorative Gradient Panel */}
        <div className="hidden lg:block lg:w-1/2 p-6">
          <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#00a8cc] rounded-[2.5rem]">
            {/* Illustration or image can go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
