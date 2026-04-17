"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn, useSession } from "next-auth/react";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn, handleSignOut } from "../../lib/auth";

const SignIn = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (status === "authenticated") {
      const normalizedStatus = session?.user?.status?.trim().toLowerCase();
      if (normalizedStatus === "onboarding") {
        router.push("/onboarding");
      } else {
        router.push("/workspace/module");
      }
    }
  }, [status, session, router]);

  const displayName =
    [
      session?.user?.firstName,
      session?.user?.middleName,
      session?.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Student";

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/workspace/module",
      });

      if (!result || result.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/workspace/module");
    } catch (submissionError) {
      console.error("Sign-in error:", submissionError);
      setError("Unable to sign in right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-sm flex overflow-hidden min-h-[600px] border border-zinc-100">
        <div className="w-full lg:w-1/2 p-8 md:p-16 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-gradient-to-tr from-orange-400 to-teal-400 rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">G</span>
              </div>
              <span className="font-bold text-gray-800 tracking-tight text-lg">
                Gadvance
              </span>
            </div>

            {status === "loading" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-gray-400">Verifying session...</p>
              </div>
            ) : session ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-4xl font-bold text-gray-900 mb-2 leading-tight">
                  Welcome back, <br />
                  <span className="text-teal-500">{displayName}</span>
                </h1>
                <p className="text-gray-400 mb-10 text-sm">
                  Redirecting you to your workspace...
                </p>
                <button
                  onClick={() => handleSignOut()}
                  className="px-8 py-4 text-xs text-gray-400 font-bold uppercase tracking-widest hover:text-red-500 transition-all"
                >
                  Switch Account
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

                {error && (
                  <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleInputChange}
                      autoComplete="email"
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                  </div>

                  <div>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-600 placeholder-gray-400 bg-gray-50/50"
                    />
                    <div className="flex justify-end mt-2">
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg shadow-teal-100 mt-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="relative flex items-center py-6">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-gray-300 text-[10px] uppercase tracking-widest font-bold">
                      Or continue with
                    </span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  <GoogleButton onClick={handleSignIn} />
                </form>
              </>
            )}
          </div>

          {!session && status !== "loading" && (
            <p className="text-sm text-gray-500 mt-8">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="text-teal-600 font-bold hover:underline"
              >
                Create Account
              </Link>
            </p>
          )}
        </div>

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
