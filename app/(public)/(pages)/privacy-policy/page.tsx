"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Sparkles,
  ArrowUpRight,
  Database,
  UserCheck,
  Mail,
  HelpCircle,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function PrivacyPolicyPage() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "scale-[0.98]",
              "-translate-x-10",
              "translate-x-10",
            );
            entry.target.classList.add(
              "opacity-100",
              "translate-y-0",
              "scale-100",
              "translate-x-0",
            );
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className="bg-white overflow-hidden text-zinc-900 selection:bg-violet-50 selection:text-[#8b5cf6]"
    >
      <main>
        {/* ================= HERO SECTION ================= */}
        <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white">
          <div className="mx-auto max-w-7xl px-8 lg:px-12 relative">
            <div className="max-w-3xl">
              <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
                Your privacy is <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  our priority.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mt-6 text-lg sm:text-xl text-zinc-500 font-light leading-relaxed">
                At GADvance, we are committed on safeguarding your personal
                information, maintaining research integrity, and upholding your
                rights under the Data Privacy Act of 2012 (RA 10173).
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out mt-6 flex items-center gap-4 text-xs font-medium text-zinc-400">
                <span>Effective Date: 2026</span>
                <span>•</span>
                <span>Version 1.0</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CORE PRIVACY PILLARS ================= */}
        <section className="py-16 bg-zinc-50/70 border-y border-zinc-100">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-100 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <Lock size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  RA 10173 Compliant
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  All personal data processed through GADvance aligns strictly
                  with Philippine National Privacy Commission guidelines.
                </p>
              </div>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-200 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <Eye size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  Full Transparency
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  The website collects only necessary information to facilitate learning
                  modules, certifications, and institutional engagement.
                </p>
              </div>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-300 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <UserCheck size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  User Control
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  Users retain complete control over their personal data, including user profile, learning
                  history, and communication preferences.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= POLICY SECTIONS ================= */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-5xl px-8 lg:px-12 space-y-16">
            {/* 1. Information We Collect */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Information We Collect
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                When you create an account, enroll in learning tracks, or
                interact with the GADvance workspace, we may collect the
                following data:
              </p>
              <ul className="list-disc pl-6 text-sm font-light text-zinc-600 space-y-2">
                <li>
                  <strong className="font-medium text-zinc-800">
                    Account Credentials:
                  </strong>{" "}
                  Full name, email address, and authentication credentials.
                </li>
                <li>
                  <strong className="font-medium text-zinc-800">
                    Academic & Professional Details:
                  </strong>{" "}
                  Institutional affiliation (e.g., student, educator, LGU, or
                  workplace affiliation) for certificate issuance.
                </li>
                <li>
                  <strong className="font-medium text-zinc-800">
                    Learning Progress:
                  </strong>{" "}
                  Module completion status and assessment results
                </li>
                <li>
                  <strong className="font-medium text-zinc-800">
                    Technical Logs:
                  </strong>{" "}
                  IP address, device type, browser information, and standard
                  session logs to ensure platform performance and security.
                </li>
              </ul>
            </div>

            {/* 2. How We Use Your Information */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  How We Use Your Information
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                Your personal data is used solely to deliver and enhance the
                GADvance learning experience:
              </p>
              <ul className="list-disc pl-6 text-sm font-light text-zinc-600 space-y-2">
                <li>
                  Providing workspace access and tracking coursework completion.
                </li>
                <li>
                  Communicating critical policy updates, workspace notices, and
                  platform improvements.
                </li>
                <li>
                  Gathering anonymized student data for research on gender development
                  and digital learning conducted at Laguna
                  State Polytechnic University – San Pablo City Campus.
                </li>
                <li>
                  Ensuring technical stability, preventing fraudulent activity,
                  and upholding community safety.
                </li>
              </ul>
            </div>

            {/* 3. Data Protection Rights (RA 10173) */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Your Rights as a Data Subject
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                Under Chapter IV of Republic Act No. 10173 (Data Privacy Act of
                2012), you are guaranteed the following rights:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-light text-zinc-600 space-y-1">
                  <p className="font-semibold text-zinc-800">
                    Right to Information & Access
                  </p>
                  <p>
                    Request copies of your personal data processed by GADvance
                    at any time.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-light text-zinc-600 space-y-1">
                  <p className="font-semibold text-zinc-800">
                    Right to Rectification
                  </p>
                  <p>
                    Update or correct inaccurate or incomplete profile
                    information in your workspace.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 text-xs font-light text-zinc-600 space-y-1">
                  <p className="font-semibold text-zinc-800">
                    Right to Erasure or Blocking
                  </p>
                  <p>
                    Request deletion of your account and personal records from
                    our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Cookies & Analytical Data */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Cookies & Platform Sessions
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                GADvance uses essential cookies and session storage to keep you
                authenticated across learning sessions and save your module
                preferences. The website does not use intrusive third-party ad-tracking
                cookies.
              </p>
            </div>

            {/* 5. Contact Information */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Contact Our Data Desk
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                If you have questions regarding this Privacy Policy, your
                personal data, or data deletion requests, please contact our
                administrative desk:
              </p>

              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Data Protection Inquiry
                  </p>
                  <p className="text-base font-semibold text-zinc-900 mt-1">
                    GADvance Research & Development Desk
                  </p>
                  <p className="text-xs text-zinc-500 font-light mt-0.5">
                    College of Computer Studies, LSPU – San Pablo City Campus
                  </p>
                </div>
                <a
                  href="mailto:gadvanceproject@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8b5cf6] px-6 py-3 text-xs font-medium text-white hover:bg-[#7c3aed] transition-colors"
                >
                  <Mail size={14} />
                  <span>gadvanceproject@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white py-28 text-center">
          <div className="mx-auto max-w-4xl px-8 relative z-10">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
              <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
                Secure & Empowered
              </h2>
              <h3 className="mt-6 text-3xl sm:text-5xl font-light leading-tight tracking-tight text-zinc-900">
                Ready to continue your <br />
                <span className="font-serif italic font-semibold text-[#8b5cf6]">
                  learning journey?
                </span>
              </h3>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                  redirectUrl="/workspace"
                >
                  Enter Workspace
                </ProtectedButton>

                <Link
                  href="/"
                  className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-4 text-base font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
