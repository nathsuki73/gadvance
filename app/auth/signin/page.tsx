"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn as nextAuthSignIn, signOut, useSession } from "next-auth/react";
import { GoogleButton } from "@/app/components/ui/GoogleButton";
import { handleSignIn, handleSignOut } from "../../lib/auth";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import logoIcon from "@/app/assets/logo.ico";
import { useToast } from "@/app/components/context/ToastContext";
import { OnboardingLogo } from "@/app/onboarding/_components/OnboardingLogo";

const SignIn = () => {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSwitchAccountDialog, setShowSwitchAccountDialog] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  // A session is only genuinely valid if it exists, has no errors, and has a laravelJwt
  const isSessionValid = Boolean(
    session && !session?.error && session?.laravelJwt,
  );

  useEffect(() => {
    if (status === "authenticated") {
      // 1. If session carries an error or lacks token, clear NextAuth memory completely
      if (
        session?.error === "RefreshAccessTokenError" ||
        !session?.laravelJwt
      ) {
        signOut({ redirect: false });
        return;
      }

      // 2. Normal redirect for active users
      const normalizedStatus = session?.user?.status?.trim().toLowerCase();
      if (normalizedStatus === "onboarding") {
        router.replace("/onboarding");
      } else {
        router.replace("/workspace");
      }
    }
  }, [status, session, router]);

  const displayName = session?.user?.name?.trim() || "";

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      showToast("Email and password are required.", "warning");
      return;
    }

    setLoading(true);

    try {
      const result = await nextAuthSignIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        showToast("Invalid email or password.", "error");
        setLoading(false);
        return;
      }

      showToast("Signed in successfully!", "success");

      const sessionRes = await fetch("/api/auth/session");
      const freshSession = await sessionRes.json();
      const normalizedStatus = freshSession?.user?.status?.trim().toLowerCase();

      const destination =
        normalizedStatus === "onboarding" ? "/onboarding" : "/workspace";
      window.location.assign(destination);
    } catch (submissionError) {
      console.error("Sign-in error:", submissionError);
      showToast("Unable to sign in right now. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        {/* Logo - Top Left */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <OnboardingLogo />
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {status === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-zinc-400 font-medium tracking-tight">
                Verifying session...
              </p>
            </div>
          ) : isSessionValid ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-tight">
                Welcome back
                {displayName ? (
                  <>
                    ,{" "}
                    <span className="text-[#8b5cf6] font-serif italic">
                      {displayName}
                    </span>
                  </>
                ) : (
                  "!"
                )}
              </h1>
              <p className="text-zinc-400 mb-10 text-sm lowercase font-light">
                Redirecting to your workspace...
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-20 tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-zinc-400 mb-10 text-sm font-light">
                Sign in to access your dashboard
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Email Address
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="joe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Password
                    </label>
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-600 placeholder-zinc-300 bg-zinc-50/50"
                  />
                  <Link
                    href="/auth/forgot-password"
                    className="text-[10px] font-bold text-[#8b5cf6] hover:text-[#7c3aed] uppercase tracking-widest transition-colors mt-3 block text-right"
                  >
                    forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <div className="relative flex items-center py-4">
                  <div className="grow border-t border-zinc-100"></div>
                  <span className="shrink mx-4 text-zinc-300 text-[12px] uppercase tracking-[0.2em] font-bold">
                    Or
                  </span>
                  <div className="grow border-t border-zinc-100"></div>
                </div>

                <GoogleButton onClick={handleSignIn} />
              </form>
            </>
          )}

          {/* Show "Create Account" footer whenever the user is NOT in a valid active session */}
          {!isSessionValid && status !== "loading" && (
            <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mt-10 text-center">
              No account?{" "}
              <Link
                href="/auth/signup"
                className="text-[#8b5cf6] hover:underline transition-colors"
              >
                create account
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Right Side: Decorative Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{
          clipPath: "ellipse(100% 100% at 100% 50%)",
        }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Continue the <br />
            <span className="font-semibold italic font-serif text-white">
              evolution of your journey.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Welcome back to your dashboard. pick up exactly where you left off
            and keep driving the conversation toward a more equitable world.
          </p>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>

      <ConfirmDialog
        open={showSwitchAccountDialog}
        title="Switch accounts?"
        description="This will sign you out of the current account so you can choose a different one."
        confirmLabel="Switch account"
        cancelLabel="Cancel"
        onCancel={() => setShowSwitchAccountDialog(false)}
        onConfirm={() => {
          setShowSwitchAccountDialog(false);
          handleSignOut();
        }}
      />
    </div>
  );
};

export default SignIn;
