"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { sendForgotPasswordLink } from "./actions"; // Updated action call
import logoIcon from "@/app/assets/logo.ico";
import { useToast } from "@/app/components/context/ToastContext";

const ForgotPassword = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Timer & Resend State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSubmitted && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [isSubmitted, timer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToast("Please enter your email address.", "warning");
      return;
    }

    setLoading(true);
    try {
      // Trigger your backend action (e.g. sends password reset magic link)
      await sendForgotPasswordLink(trimmedEmail);
    } catch (error) {
      console.error("Forgot password request failed:", error);
    } finally {
      setLoading(false);
      setIsSubmitted(true);
      setTimer(60);
      setCanResend(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    showToast("Reset link resent!", "success");
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      {/* Left Side: Form / Status Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        {/* Brand Logo - Top Left */}
        <Link
          href="/auth/signin"
          className="absolute top-8 left-8 flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative h-7 w-7">
            <Image
              src={logoIcon.src}
              alt="GADvance logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </Link>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {!isSubmitted ? (
            /* STATE 1: INITIAL FORM */
            <>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 mt-16 lg:mt-0 tracking-tight">
                Forgot your password?
              </h1>
              <p className="text-zinc-400 mb-8 text-sm font-light leading-relaxed">
                Enter your registered email address below and we&apos;ll send
                you a secure link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest">
                    Email Address
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="myemail@gmail.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50/50 focus:border-[#8b5cf6] transition-all text-zinc-700 placeholder-zinc-300 bg-zinc-50/50"
                    />
                    <Mail
                      size={18}
                      className="absolute left-4 text-zinc-300 pointer-events-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STATE 2: GENERIC CONFIRMATION (PREVENTS ENUMERATION) */
            <div className="animate-in fade-in zoom-in-95 duration-300 mt-16 lg:mt-0">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 shadow-sm border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>

              <h1 className="text-3xl font-bold text-zinc-900 mb-3 tracking-tight">
                Check Your Inbox
              </h1>

              {/* Security Best Practice Notice */}
              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 mb-8 text-left">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  If an account exists for{" "}
                  <span className="font-bold text-zinc-900">{email}</span>,
                  we&apos;ve sent a password reset link to your inbox.
                </p>
                <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                  Be sure to check your spam or junk folder if you don&apos;t
                  see it within a few minutes.
                </p>
              </div>

              {/* Resend Option */}
              <div className="flex flex-col items-center gap-3 mb-8">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-[#8b5cf6] font-bold text-xs uppercase tracking-widest hover:underline"
                  >
                    Resend Reset Link
                  </button>
                ) : (
                  <p className="text-zinc-400 text-xs font-medium">
                    Resend link in{" "}
                    <span className="text-zinc-900 font-mono font-bold">
                      {timer}s
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-100">
            <Link
              href="/auth/signin"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <ArrowLeft
                size={14}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Back to Sign In
            </Link>
          </div>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl mb-8 shadow-inner border border-white/20">
            <Mail size={36} className="text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-light mb-6 leading-[1.1] tracking-tight">
            Account recovery <br />
            <span className="font-semibold italic font-serif text-white">
              made simple.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Follow the link sent to your email inbox to safely update your
            account credentials.
          </p>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
