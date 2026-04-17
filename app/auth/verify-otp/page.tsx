"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft, Mail, GraduationCap } from "lucide-react";
import Link from "next/link";
import {
  sendForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "../forgot-password/actions";
import { signIn } from "next-auth/react";

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const OTPContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Dynamic Context & Domain Logic
  const context = searchParams.get("context") || "signup";
  const email = searchParams.get("email") || "user@email.com";

  // Detect if the email is an institutional LSPU account
  const isInstitutional = email.toLowerCase().endsWith("@lspu.edu.ph");

  const uiConfigs = {
    signup: {
      title: isInstitutional
        ? "Verify Institutional Account"
        : "Verify your Email",
      description: isInstitutional
        ? "Please enter the 6-digit code sent to your official university inbox to activate your student profile."
        : "Enter the code sent to your email to activate your account.",
      button: isInstitutional ? "Activate Student Account" : "Complete Sign Up",
      nextPath: "/onboarding",
    },
    reset: {
      title: "Identity Check",
      description:
        "Enter the code to verify it's you before resetting your password.",
      button: "Reset Password",
      nextPath: "/auth/new-password",
    },
  };

  const currentUI =
    uiConfigs[context as keyof typeof uiConfigs] || uiConfigs.signup;

  // 2. OTP Input State & Refs
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [blockSecondsRemaining, setBlockSecondsRemaining] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isBlocked = blockSecondsRemaining > 0;

  const handleChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // 3. Timer Logic
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!isBlocked) return;

    const interval = setInterval(() => {
      setBlockSecondsRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked]);

  const handleVerify = async () => {
    const fullCode = otp.join("");
    if (fullCode.length < 6 || isBlocked) return;

    setLoading(true);

    try {
      // Signup OTP needs to establish a NextAuth session before navigating.
      if (context === "signup") {
        const authResult = await signIn("credentials", {
          email,
          otp: fullCode,
          redirect: false,
        });

        if (!authResult || authResult.error) {
          setStatusMessage("OTP verification failed.");
          setAttemptsLeft(null);
          setBlockSecondsRemaining(0);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
          return;
        }

        router.push("/onboarding");
        return;
      }

      const result = await verifyForgotPasswordOtp(email, fullCode);

      if (result.success) {
        setStatusMessage(null);
        setAttemptsLeft(null);
        setBlockSecondsRemaining(0);
        router.push(`${currentUI.nextPath}?email=${encodeURIComponent(email)}`);
      } else {
        setStatusMessage(result.error);
        setAttemptsLeft(result.attemptsLeft ?? null);
        setBlockSecondsRemaining(result.blockSecondsRemaining ?? 0);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setStatusMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-sans text-zinc-900">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-sm p-8 md:p-12 border border-zinc-100 text-center">
        {/* Dynamic Header Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl mb-6">
          {isInstitutional ? (
            <GraduationCap size={32} />
          ) : (
            <ShieldCheck size={32} />
          )}
        </div>

        <h2 className="text-2xl font-black tracking-tight">
          {currentUI.title}
        </h2>
        <p className="text-zinc-500 text-sm mt-2 mb-6">
          {currentUI.description}
        </p>

        {/* Institutional Badge / Email Display */}
        <div className="flex flex-col items-center gap-3 mb-8">
          {isInstitutional && (
            <div className="py-1 px-3 bg-teal-50 border border-teal-100 rounded-full inline-flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-teal-700 uppercase tracking-widest">
                LSPU Verified Domain
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
            <Mail size={12} />
            <span>
              {email.replace(
                /(.{2})(.*)(?=@)/,
                (gp1, gp2, gp3) => gp2 + gp3.replace(/./g, "*"),
              )}
            </span>
          </div>
        </div>

        {/* 6-Digit OTP Box Grid */}
        <div className="flex justify-between gap-2 mb-8">
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-14 text-center text-xl font-bold border border-zinc-200 rounded-xl bg-zinc-50/50 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || isBlocked || otp.join("").length < 6}
          className="w-full bg-[#00A8CC] hover:bg-[#0096b6] text-white py-4 rounded-xl font-bold transition-all mb-6 shadow-lg shadow-teal-100 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
        >
          {loading ? "Verifying..." : currentUI.button}
        </button>

        {statusMessage && (
          <div className="mb-6 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-left">
            <p className="text-sm font-semibold text-rose-700">
              {statusMessage}
            </p>
            {isBlocked && (
              <p className="mt-1 text-xs font-bold text-rose-600">
                Block ends in {formatDuration(blockSecondsRemaining)}
              </p>
            )}
            {!isBlocked && attemptsLeft !== null && (
              <p className="mt-1 text-xs font-bold text-rose-600">
                Remaining attempts: {attemptsLeft}
              </p>
            )}
          </div>
        )}

        {/* Resend Logic */}
        <div className="flex flex-col items-center gap-4">
          {canResend ? (
            <button
              onClick={async () => {
                if (context === "reset") {
                  setResending(true);

                  try {
                    const resendResult = await sendForgotPasswordOtp(email);

                    if (!resendResult.success) {
                      setStatusMessage(
                        resendResult.error ||
                          "Failed to resend verification code.",
                      );
                      return;
                    }
                  } catch {
                    setStatusMessage("Something went wrong. Please try again.");
                    return;
                  } finally {
                    setResending(false);
                  }
                }

                setTimer(60);
                setCanResend(false);
                setOtp(["", "", "", "", "", ""]);
                setStatusMessage(null);
                setAttemptsLeft(null);
              }}
              disabled={isBlocked || resending}
              className="text-teal-600 font-black text-sm hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resending ? "Resending..." : "Resend Code"}
            </button>
          ) : (
            <p className="text-zinc-400 text-sm font-medium">
              Resend code in{" "}
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

// Use Suspense to handle searchParams in Next.js 13+
export default function VerifyOTP() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OTPContent />
    </Suspense>
  );
}
