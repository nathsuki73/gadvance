"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  UserCheck,
  Scale,
  Mail,
  BookOpen,
  BarChart3,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function TermsOfServicePage() {
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
                Terms of <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  Service.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mt-6 text-lg sm:text-xl text-zinc-500 font-light leading-relaxed">
                Welcome to GADvance. By accessing or using our e-learning
                platform, modules, and community workspaces, you agree to comply
                with these Terms of Service.
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out mt-6 flex items-center gap-4 text-xs font-medium text-zinc-400">
                <span>Effective Date: July 2026</span>
                <span>•</span>
                <span>Version 1.0</span>
              </div>
            </div>
          </div>
        </section>

{/* ================= QUICK HIGHLIGHTS ================= */}
        <section className="py-16 bg-zinc-50/70 border-y border-zinc-100">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-100 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  Educational Use
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  Curriculum materials and toolkits are provided for
                  non-commercial educational, research, and institutional
                  development purposes.
                </p>
              </div>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-200 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  Safe Space Standards
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  Zero tolerance for harassment, discrimination, or abusive
                  conduct in community discussions under RA 11313 guidelines.
                </p>
              </div>

              {/* REPLACED CARD: Adaptive Mastery Tracking */}
              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-300 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
                <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-medium text-zinc-900">
                  Adaptive Mastery
                </h3>
                <p className="mt-3 text-xs sm:text-sm font-light leading-relaxed text-zinc-500">
                  Intelligent progress tracking analyzes learning patterns and 
                  assessment responses to measure genuine concept mastery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= DETAILED CLAUSES ================= */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-5xl px-8 lg:px-12 space-y-16">
            {/* 01. Acceptance of Terms */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  01
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Acceptance of Terms
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                By creating an account, accessing course materials, or utilizing
                the GADvance workspace, you affirm that you have read,
                understood, and agreed to be bound by these Terms. If you are
                registering on behalf of an institution, school, or
                organization, you represent that you have the authority to bind
                that entity to these Terms.
              </p>
            </div>

            {/* 02. User Accounts & Workspace Conduct */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  02
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  User Accounts & Community Conduct
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                Users are responsible for maintaining the confidentiality of
                their login credentials. When interacting within community
                forums and learning spaces, users must follow the following
                rules:
              </p>
              <ul className="list-disc pl-6 text-sm font-light text-zinc-600 space-y-2">
                <li>
                  <strong className="font-medium text-zinc-800">
                    Respectful Communication:
                  </strong>{" "}
                  Engage constructively without discriminatory language, hate
                  speech, or personal attacks.
                </li>
                <li>
                  <strong className="font-medium text-zinc-800">
                    Compliance with Laws:
                  </strong>{" "}
                  Adhere to Republic Act 11313 (Safe Spaces Act) and relevant
                  Philippine statutes regarding online interactions.
                </li>
                <li>
                  <strong className="font-medium text-zinc-800">
                    Account Security:
                  </strong>{" "}
                  You are responsible for all activities occurring under your
                  workspace account. Notify us immediately if you suspect
                  unauthorized access.
                </li>
              </ul>
            </div>

            {/* 03. Intellectual Property Rights */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  03
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Intellectual Property & Course Content
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                All learning materials and programs, software code, design assets,
                research papers, and media provided on GADvance are protected by
                intellectual property laws and remain the property of GADvance
                and Laguna State Polytechnic University – San Pablo City Campus
                (LSPU CCS).
              </p>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                You are granted a limited, revocable, non-exclusive license to
                view materials solely for personal learning or
                internal organizational GAD planning. Reproduction or
                redistribution for commercial sale without prior written consent
                is strictly prohibited.
              </p>
            </div>

            {/* 05. Service Availability & Disclaimers */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out border-b border-zinc-100 pb-12 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  04
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Disclaimer of Warranties & Limitation of Liability
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                The platform is provided on an &quot;as-is&quot; and
                &quot;as-available&quot; basis. While we strive to ensure
                seamless performance, GADvance does not warrant uninterrupted or
                error-free service. Information provided within modules does not
                constitute formal legal counsel; organizations should consult
                official gazettes or legal specialists for binding policy
                interpretations.
              </p>
            </div>

            {/* 06. Modifications & Inquiries */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono text-[#8b5cf6] bg-violet-50 px-2.5 py-1 rounded-md">
                  05
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-zinc-900">
                  Modifications & Inquiries
                </h2>
              </div>
              <p className="text-sm font-light text-zinc-600 leading-relaxed">
                We reserve the right to modify these terms as our platform
                evolves. Continued use of the platform after updates constitutes
                acceptance of the new terms. For legal or policy inquiries,
                contact our administrative desk:
              </p>

              <div className="p-6 rounded-3xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Administrative Desk
                  </p>
                  <p className="text-base font-semibold text-zinc-900 mt-1">
                    GADvance Research & Development Team
                  </p>
                  <p className="text-xs text-zinc-500 font-light mt-0.5">
                    College of Computer Studies, LSPU – San Pablo City Campus
                  </p>
                </div>
                <a
                  href="mailto:gadvanceproject@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-[#8b5cf6] px-6 py-3 text-xs font-medium text-white hover:bg-[#7c3aed] transition-colors shrink-0"
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
                Ready to Get Started?
              </h2>
              <h3 className="mt-6 text-3xl sm:text-5xl font-light leading-tight tracking-tight text-zinc-900">
                Begin your learning journey in <br />
                <span className="font-serif italic font-semibold text-[#8b5cf6]">
                  our workspace.
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
