"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, GraduationCap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/context/ToastContext";

const MagicLinkContent = () => {
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const email = searchParams.get("email") || "";
  const isInstitutional = email.toLowerCase().endsWith("@lspu.edu.ph");

  // Timer & Resend State
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!email) {
      showToast("No recipient email found to resend to.", "error");
      return;
    }

    setResending(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        showToast("Verification link resent successfully!", "success");
        setTimer(60);
        setCanResend(false);
      } else {
        showToast(data.error || "Failed to resend verification link.", "error");
      }
    } catch {
      showToast("Network error. Failed to resend link.", "error");
    } finally {
      setResending(false);
    }
  };

  const maskEmail = (str: string) => {
    if (!str || !str.includes("@")) return "your email address";
    const [local, domain] = str.split("@");
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local.slice(0, 2)}${"*".repeat(local.length - 2)}@${domain}`;
  };

  const maskedEmail = maskEmail(email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
      <div className="bg-white w-full max-w-[22rem] md:max-w-md rounded-[2.5rem] shadow-sm p-6 sm:p-8 md:p-12 border border-zinc-100 text-center">
        {/* Dynamic Header Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-violet-50 text-[#8b5cf6] rounded-2xl mb-6">
          {isInstitutional ? <GraduationCap size={32} /> : <Mail size={32} />}
        </div>

        <h2 className="text-2xl font-black tracking-tight">Magic Link Sent!</h2>
        <p className="text-zinc-500 text-sm mt-2 mb-6 leading-relaxed">
          We sent a secure verification link to your inbox. Click the link in
          the email to activate your account.
        </p>

        {/* Institutional Badge / Email Display */}
        <div className="flex flex-col items-center gap-3 mb-8 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
          {isInstitutional && (
            <div className="py-1 px-3 bg-violet-50 border border-violet-100 rounded-full inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-[#6d28d9] uppercase tracking-widest">
                LSPU Verified Domain
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <Mail size={14} className="text-[#8b5cf6]" />
            <span>{maskedEmail}</span>
          </div>
        </div>

        {/* Status Callout Box */}
        <div className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-left flex items-start gap-3">
          <CheckCircle2
            size={18}
            className="text-emerald-600 shrink-0 mt-0.5"
          />
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Link created! Check your spam folder if you don&apos;t see it within
            a few minutes.
          </p>
        </div>

        {/* Resend & Navigation */}
        <div className="flex flex-col items-center gap-4">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#8b5cf6] font-black text-sm hover:underline disabled:opacity-50"
            >
              {resending ? "Resending Link..." : "Resend Verification Link"}
            </button>
          ) : (
            <p className="text-zinc-400 text-sm font-medium">
              Resend link in{" "}
              <span className="text-zinc-900 font-mono font-bold">
                {timer}s
              </span>
            </p>
          )}

          <Link
            href="/auth/signup"
            className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-600 transition-colors mt-2"
          >
            <ArrowLeft size={14} /> Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function VerifyLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-500">
          Loading...
        </div>
      }
    >
      <MagicLinkContent />
    </Suspense>
  );
}
