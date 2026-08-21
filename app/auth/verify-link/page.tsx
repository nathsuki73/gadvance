"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/app/components/context/ToastContext";

const MagicLinkContent = () => {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const router = useRouter();
  const urlEmail = searchParams.get("email");

  const [email, setEmail] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 🛡️ Strict Sign-Up Source of Truth: sessionStorage is required. No self-healing from arbitrary URLs.
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("pending_verification_email");

    // If there is no valid stored email from sign-up, do not let them stay here!
    if (!storedEmail || !emailRegex.test(storedEmail)) {
      sessionStorage.removeItem("pending_verification_email");
      router.replace("/auth/signup");
      return;
    }

    // We have a valid sign-up session. Now self-heal the URL if it was broken/tampered with.
    setEmail(storedEmail);
    if (urlEmail !== storedEmail) {
      window.history.replaceState(
        null,
        "",
        `/auth/verify-link?email=${encodeURIComponent(storedEmail)}`,
      );
    }

    setIsReady(true);
  }, [urlEmail, router]);

  const storageKey = email
    ? `magic_link_expiry_${email}`
    : "magic_link_expiry_fallback";

  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  // ⏱️ Drift-Free Timestamp Sync & Calculation Loop
  useEffect(() => {
    if (!isReady) return;

    const checkExpiration = () => {
      const savedExpiry = sessionStorage.getItem(storageKey);
      const now = Date.now();

      if (savedExpiry) {
        const timeLeft = Math.floor((Number(savedExpiry) - now) / 1000);
        if (timeLeft > 0) {
          setTimer(timeLeft);
          setCanResend(false);
        } else {
          setTimer(0);
          setCanResend(true);
        }
      } else {
        const newExpiry = now + 60000; // 60 seconds
        sessionStorage.setItem(storageKey, String(newExpiry));
        setTimer(60);
        setCanResend(false);
      }
    };

    // Run calculation immediately on load/focus
    checkExpiration();

    // Re-check exact delta every second (and automatically corrects itself when tab regains focus)
    const interval = setInterval(checkExpiration, 1000);

    // Also recalculate instantly if the user switches back to the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkExpiration();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isReady, storageKey]);

  const handleResend = async () => {
    if (!email || !emailRegex.test(email)) {
      showToast("No valid recipient email found to resend to.", "error");
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

        // Reset target absolute timestamp for another 60s cooldown
        const freshExpiry = Date.now() + 60000;
        sessionStorage.setItem(storageKey, String(freshExpiry));

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
      <div className="bg-white w-full max-w-[22rem] md:max-w-md rounded-[2.5rem] shadow-sm p-6 sm:p-8 md:p-12 border border-zinc-100 text-center">
        {/* Header Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-violet-50 text-[#8b5cf6] rounded-2xl mb-6">
          <Mail size={32} />
        </div>

        <h2 className="text-2xl font-black tracking-tight">Magic Link Sent!</h2>
        <p className="text-zinc-500 text-sm mt-2 mb-6 leading-relaxed">
          We sent a secure verification link to your inbox. Click the link in
          the email to activate your account.
        </p>

        {/* Email Display */}
        <div className="flex flex-col items-center gap-3 mb-8 bg-zinc-50/80 p-4 rounded-2xl border border-zinc-100">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
            <Mail size={14} className="text-[#8b5cf6]" />
            <span>{email || "your email address"}</span>
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
              disabled={resending || !emailRegex.test(email)}
              className="text-[#8b5cf6] font-black text-sm hover:underline disabled:opacity-50 cursor-pointer"
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
            onClick={() =>
              sessionStorage.removeItem("pending_verification_email")
            }
            className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest hover:text-zinc-600 transition-colors mt-2 cursor-pointer"
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
