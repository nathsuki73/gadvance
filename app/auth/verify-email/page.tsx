"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSession, signIn, useSession } from "next-auth/react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import { useToast } from "@/app/components/context/ToastContext";

type ErrorType = "expired" | "already_exists" | "invalid" | "network";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();

  // New links carry the parameters in the URL fragment (#registration=…&token=…),
  // which browsers never send to servers, so the token stays out of server,
  // proxy, and analytics logs. Links sent before this change use the query.
  // This component only renders in the browser (useSearchParams + Suspense).
  const [{ registration, token }] = useState(() => {
    const fragment = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.hash.slice(1),
    );
    return {
      registration: fragment.get("registration") ?? searchParams.get("registration"),
      token: fragment.get("token") ?? searchParams.get("token"),
    };
  });
  const hasValidParams = Boolean(registration && token);

  // The token is single use and already held in state: remove it from the
  // address bar and history immediately so it cannot leak via screenshots,
  // shared screens, or browser history.
  useEffect(() => {
    if (window.location.hash || window.location.search) {
      window.history.replaceState(null, "", "/auth/verify-email");
    }
  }, []);

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    hasValidParams ? "verifying" : "error",
  );
  const [errorType, setErrorType] = useState<ErrorType>(
    hasValidParams ? "invalid" : "invalid",
  );
  const [errorMessage, setErrorMessage] = useState<string>(
    hasValidParams ? "" : "Verification link is missing required parameters.",
  );

  const hasCalledApi = useRef(false);
  // Wait for NextAuth to finish loading: calling signIn while the session
  // provider is still initialising races on the CSRF cookie and fails.
  const { status: sessionStatus } = useSession();

  useEffect(() => {
    if (!hasValidParams || hasCalledApi.current || sessionStatus === "loading") return;
    hasCalledApi.current = true;

    const executeVerification = async () => {
      try {
        // Verifies the account and creates the session in one step. The
        // exchange with the API happens on the server (NextAuth authorize).
        const attempt = () =>
          signIn("credentials", {
            registration: registration!,
            verificationToken: token!,
            redirect: false,
          });

        // Concurrent NextAuth requests on first load can leave a CSRF cookie
        // that does not match the token. NextAuth rejects that before the
        // link reaches the API, so the link is not used up and it is safe to
        // retry once the cookie has settled.
        let result = await attempt();
        for (let retry = 0; retry < 2 && result?.url?.includes("csrf=true"); retry++) {
          await new Promise((resolve) => setTimeout(resolve, 300));
          result = await attempt();
        }

        // NextAuth can report ok without signing in (for example a CSRF
        // failure redirects to the sign-in page), so confirm a session exists.
        const session = result?.ok && !result.error ? await getSession() : null;

        if (session?.laravelJwt) {
          setStatus("success");
          showToast("Email verified. You are signed in.", "success");
          setTimeout(() => router.replace("/onboarding"), 1200);
          return;
        }

        setStatus("error");
        const code = result?.error ?? "";

        if (code === "ALREADY_VERIFIED") {
          setErrorType("already_exists");
          setErrorMessage("This email is already verified.");
        } else if (code === "LINK_EXPIRED") {
          setErrorType("expired");
          setErrorMessage("This verification link has expired or has already been used.");
        } else if (code === "VERIFICATION_IN_PROGRESS") {
          setErrorType("network");
          setErrorMessage("This link is already being verified. Please refresh in a moment.");
        } else {
          setErrorType("invalid");
          setErrorMessage("Unable to verify this email link.");
        }
      } catch {
        setStatus("error");
        setErrorType("network");
        setErrorMessage(
          "Network connection issue. Please check your internet connection.",
        );
      }
    };

    executeVerification();
  }, [hasValidParams, registration, token, router, showToast, sessionStatus]);

  return (
    <div className="min-h-screen flex bg-white font-sans text-zinc-900 overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 py-12 relative z-10 bg-white">
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="relative h-7 w-7">
            <Image
              src={logoIcon.src}
              alt="GADvance logo"
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-semibold tracking-tight">GADvance</span>
        </div>

        <div className="w-full max-w-md mx-auto lg:mx-0">
          {status === "verifying" && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-50 text-[#8b5cf6] rounded-2xl mb-6 shadow-sm">
                <Loader2 size={32} className="animate-spin" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                Verifying Email...
              </h1>
              <p className="text-zinc-400 text-sm font-light leading-relaxed">
                Please wait a moment while we validate your activation code.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 shadow-sm border border-emerald-100">
                <CheckCircle2 size={32} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                Email Verified!
              </h1>
              <p className="text-zinc-400 text-sm font-light leading-relaxed mb-8">
                You are signed in. Taking you to set up your profile...
              </p>

              <Link
                href="/onboarding"
                className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Continue Setup <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 text-red-500 rounded-2xl mb-6 shadow-sm border border-red-100">
                {errorType === "expired" ? (
                  <Clock size={30} />
                ) : (
                  <AlertCircle size={30} />
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
                {errorType === "expired"
                  ? "Link Expired"
                  : errorType === "already_exists"
                    ? "Already Verified"
                    : "Link Invalid"}
              </h1>

              <p className="text-zinc-500 text-sm font-light leading-relaxed mb-6">
                {errorMessage}
              </p>

              <div className="w-full rounded-2xl border border-red-100 bg-red-50/70 p-5 mb-8 text-left shadow-sm">
                <p className="text-xs text-red-700 leading-relaxed font-light">
                  {errorType === "expired" &&
                    "Verification links expire after 30 minutes for security reasons. You can request a fresh link by signing up or choosing resend."}
                  {errorType === "already_exists" &&
                    "Your email is already verified, so this link cannot sign you in again. Sign in with your password or Google."}
                  {errorType === "invalid" &&
                    "This link appears broken or incomplete. Please verify you clicked the complete link in your email."}
                  {errorType === "network" &&
                    "Could not reach the server. Please check your connection and refresh."}
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full">
                {errorType === "already_exists" ? (
                  <Link
                    href="/auth/signin"
                    className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <LogIn size={14} /> Sign In Now
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/signup"
                      className="w-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-8 py-4 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-violet-100 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={14} /> Request New Link
                    </Link>

                    <Link
                      href="/auth/signin"
                      className="w-full bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200 px-8 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-center"
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="hidden lg:flex lg:w-1/2 bg-[#8b5cf6] flex-col items-center justify-center p-12 text-white relative"
        style={{ clipPath: "ellipse(100% 100% at 100% 50%)" }}
      >
        <div className="text-center px-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-light mb-8 leading-[1.1] tracking-tight">
            Empowering your <br />
            <span className="font-semibold italic font-serif">
              learning journey.
            </span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm mx-auto font-light">
            Verify your email to secure your account and join our platform for
            gender and development advancements.
          </p>
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center text-[10px] tracking-[0.4em] text-white/40 uppercase">
          © 2026 gadvance. all rights reserved.
        </div>
      </div>
    </div>
  );
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-zinc-500 font-sans text-sm">
          Loading verification details...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
