"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail,
  HelpCircle,
  Code,
  ShieldCheck,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  SUPPORT_EMAIL,
  supportMailto,
  type SupportTopic,
} from "@/app/lib/support";

interface FAQItem {
  question: string;
  answer: string;
  category: "General" | "Account & Modules" | "Partnerships" | "Technical";
}

const FAQS: FAQItem[] = [
  {
    category: "General",
    question: "What is GADvance and who is it designed for?",
    answer:
      "GADvance is an adaptive e-learning platform for gender sensitivity and Gender and Development (GAD) education. It is designed for students, educators, employees, and organizations in the Philippines who want structured, self-paced GAD learning with assessments that adjust to each learner.",
  },
  {
    category: "Account & Modules",
    question: "How does the adaptive learning work?",
    answer:
      "GADvance uses Bayesian Knowledge Tracing (BKT) to estimate how well you have mastered each topic from your answers. After every response the estimate is updated, and checkpoint quizzes choose questions at a suitable Bloom's Taxonomy difficulty level. If a topic needs more work, GADvance points you back to the related lesson content for review.",
  },
  {
    category: "Account & Modules",
    question: "How do I join my organization?",
    answer:
      "Sign in, open Organizations from your workspace, and enter the join code provided by your organization's administrator. Once you have joined, the organization's learning plans become available to you.",
  },
  {
    category: "Account & Modules",
    question: "I did not receive my verification or password reset email.",
    answer:
      "Check your spam or promotions folder first, then use the resend option on the sign-up or forgot-password page. Links and codes expire for your security, so request a new one if it has expired. If the email still does not arrive, contact projectgadvance@gmail.com with the subject \"GADvance Account Assistance\".",
  },
  {
    category: "Partnerships",
    question: "Can my university or organization use GADvance?",
    answer:
      "Yes. Organizations can be set up with their own administrators, learning plans, and join codes. Email projectgadvance@gmail.com with the subject \"GADvance Organization Inquiry\" to discuss setting up your organization.",
  },
  {
    category: "Technical",
    question: "What should I do if I encounter a bug or login issue?",
    answer:
      "Email projectgadvance@gmail.com with the subject \"GADvance Bug Report\". Please include what you were doing, what you expected to happen, and your device and browser so the team can reproduce the issue.",
  },
  {
    category: "General",
    question: "How is my data protected?",
    answer:
      "Personal information is handled in line with the Data Privacy Act of 2012 (RA 10173) and our Privacy Policy. Never share your password or verification codes with anyone. To report a security concern, email projectgadvance@gmail.com with the subject \"GADvance Security Concern\".",
  },
];

export default function SupportPage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

    // Wait a tick so newly re-mounted .scroll-anim nodes (e.g. after
    // clearing/changing the search) exist in the DOM before we query for them.
    const frame = requestAnimationFrame(() => {
      const children = scrollRef.current?.querySelectorAll(".scroll-anim");
      children?.forEach((el) => observer.observe(el));
    });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [filteredFaqs.length, searchQuery]); // ← re-run whenever the visible FAQ set changes

  return (
    <div
      ref={scrollRef}
      className="bg-white overflow-hidden text-zinc-900 selection:bg-violet-50 selection:text-[#8b5cf6]"
    >
      {/* ================= HERO & DIRECT ASSISTANCE ================= */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 relative">
          <div className="max-w-3xl">
            <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
              We are here to <br />
              <span className="font-semibold italic font-serif text-[#8b5cf6]">
                facilitate your growth.
              </span>
            </h1>

            <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mt-8 text-lg sm:text-xl text-zinc-500 font-light leading-relaxed">
              Whether you are working through a course, setting up your
              account, or reporting an issue, every request goes to one
              support inbox: {SUPPORT_EMAIL}.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <ContactCard
              icon={<Mail size={24} strokeWidth={1.5} />}
              title="general support"
              topic="support"
              desc="Questions about access, enrollment, courses, or how GADvance works."
            />
            <ContactCard
              icon={<HelpCircle size={24} strokeWidth={1.5} />}
              title="account assistance"
              topic="account"
              desc="Help with sign-in, email verification, password resets, or organization membership."
            />
            <ContactCard
              icon={<Code size={24} strokeWidth={1.5} />}
              title="bug reports"
              topic="bug"
              desc="Tell us what went wrong, what you expected, and the device and browser you used."
            />
            <ContactCard
              icon={<ShieldCheck size={24} strokeWidth={1.5} />}
              title="security concerns"
              topic="security"
              desc="Report a suspected vulnerability or suspicious account activity. Never include passwords."
            />
          </div>
        </div>
      </section>

      {/* ================= FAQ & KNOWLEDGE BASE ================= */}
      <section className="py-24 bg-zinc-50/70 border-y border-zinc-100">
        <div className="mx-auto max-w-5xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">
              Knowledge Base
            </h2>
            <h3 className="text-3xl sm:text-5xl font-light tracking-tight text-zinc-900">
              Frequently asked <br />
              <span className="italic font-serif font-semibold text-[#8b5cf6]">
                questions.
              </span>
            </h3>

            {/* Quick Search in FAQ */}
            <div className="mt-8 relative max-w-md mx-auto">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-full border border-zinc-200 bg-white text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#8b5cf6] transition-all shadow-sm"
              />
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out rounded-2xl border border-zinc-200/80 bg-white overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-6 text-left flex items-center justify-between gap-4 transition-colors hover:bg-zinc-50"
                    >
                      <span className="text-base sm:text-lg font-medium text-zinc-900">
                        {faq.question}
                      </span>
                      <ChevronDown
                        size={20}
                        className={`text-[#8b5cf6] transition-transform duration-300 shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 text-sm font-light leading-relaxed text-zinc-600 border-t border-zinc-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-zinc-400 text-sm">
                No matching help topics found for &quot;{searchQuery}&quot;.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= TECHNICAL & ACADEMIC ORIGINS ================= */}
      <section className="py-24 sm:py-36 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left Column */}
            <div className="lg:w-1/2 scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-4">
                Technical Support
              </h2>
              <h3 className="text-3xl sm:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
                Created by the <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  LSPU CCS Team.
                </span>
              </h3>
              <p className="mt-6 text-base text-zinc-500 font-light leading-relaxed">
                GADvance was developed by a College of Computer Studies team at
                Laguna State Polytechnic University (LSPU). Platform bugs and
                account access issues are handled through the same support
                inbox.
              </p>

              <div className="mt-8">
                <span className="text-xs font-medium text-zinc-500">
                  Developed at LSPU College of Computer Studies
                </span>
              </div>
            </div>

            {/* Right Desk Card */}
            <div className="lg:w-1/2 w-full scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out">
              <div className="p-8 sm:p-10 rounded-3xl bg-zinc-50 border border-zinc-200/80 shadow-sm space-y-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-[#8b5cf6] shadow-sm">
                  <Code size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    Developer Desk
                  </span>
                  <h4 className="text-xl font-semibold text-zinc-900 mt-1">
                    Bug Reports & Technical Desk
                  </h4>
                </div>
                <p className="text-sm text-zinc-500 font-light leading-relaxed">
                  Report a bug, suggest an improvement, or ask for help
                  recovering your account.
                </p>
                <div className="pt-4 border-t border-zinc-200/60">
                  <a
                    href={supportMailto("bug")}
                    className="text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-semibold transition-colors break-words"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white py-28 text-center">
        <div className="mx-auto max-w-4xl px-8 relative z-10">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
              Still Have Questions?
            </h2>
            <h3 className="mt-6 text-3xl sm:text-5xl font-light leading-tight tracking-tight text-zinc-900">
              Access your personalized <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                learning workspace.
              </span>
            </h3>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/workspace"
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
              >
                Go to Workspace Dashboard
              </Link>

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
    </div>
  );
}

/* --- Helper Component --- */

const ContactCard = ({
  icon,
  title,
  topic,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  topic: SupportTopic;
  desc: string;
}) => (
  <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 sm:p-10 rounded-3xl bg-zinc-50/80 border border-zinc-200/80 transition-all hover:bg-white hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 group">
    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-[#8b5cf6] mb-6 shadow-sm">
      {icon}
    </div>
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
      {title}
    </h4>

    <a
      href={supportMailto(topic)}
      className="text-lg sm:text-2xl font-light text-zinc-900 hover:text-[#8b5cf6] transition-colors mb-4 break-words block leading-tight"
    >
      {SUPPORT_EMAIL}
    </a>

    <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
      {desc}
    </p>
  </div>
);
