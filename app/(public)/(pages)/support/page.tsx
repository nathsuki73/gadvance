"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageCircle,
  FileText,
  HelpCircle,
  Code,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  PhoneCall,
  Search,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

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
      "GADvance is an e-learning and gender advancement platform tailored for students, educators, public servants, and private institutions in the Philippines. It provides self-paced learning tracks, policy frameworks, and interactive community spaces.",
  },
  {
    category: "Account & Modules",
    question: "How do I enroll in a learning track or access my certificate?",
    answer:
      "Simply create an account or sign in to your GADvance workspace. Once logged in, you can browse available modules under your workspace dashboard. Certificates are automatically generated upon completing all module requirements and assessments.",
  },
  {
    category: "Partnerships",
    question: "How can my university or organization integrate GADvance?",
    answer:
      "We partner with academic institutions, local government units (LGUs), and organizations looking to strengthen their Gender Focal Point System (GFPS) and Safe Spaces Act compliance. Reach out to our partnership desk at gadvanceproject@gmail.com for institutional onboardings.",
  },
  {
    category: "Technical",
    question: "What should I do if I encounter platform bugs or login issues?",
    answer:
      "For technical anomalies, video playback issues, or account recovery support, you can contact our developer desk at gadvanceproject@gmail.com. Please include details about your device and browser for faster troubleshooting.",
  },
  {
    category: "General",
    question: "How is user data protected on GADvance?",
    answer:
      "We prioritize data privacy and research integrity. Personal information and community discussions are safeguarded in compliance with the Data Privacy Act of 2012 (RA 10173).",
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
              Whether you are navigating our e-learning modules or seeking
              institutional partnership details, our team is ready to provide
              the clarity you need.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            <ContactCard
              icon={<Mail size={24} strokeWidth={1.5} />}
              title="general inquiries"
              detail="gadvanceproject@gmail.com"
              desc="For students and individual learners seeking guidance on curriculum access and enrollment."
            />
            <ContactCard
              icon={<MessageCircle size={24} strokeWidth={1.5} />}
              title="partnership support"
              detail="gadvanceproject@gmail.com"
              desc="Dedicated assistance for organizations and universities integrating our GAD frameworks."
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
                Engineered by the <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  LSPU CCS Team.
                </span>
              </h3>
              <p className="mt-6 text-base text-zinc-500 font-light leading-relaxed">
                For platform-related bugs, account access issues, or technical
                integration inquiries, our developer team at Laguna State
                Polytechnic University (LSPU) Computer Studies is available for
                direct troubleshooting.
              </p>

              <div className="mt-8">
                <span className="text-xs font-medium text-zinc-500">
                  Developed for GADvance Philippines
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
                  Report platform anomalies, request feature improvements, or
                  seek help regarding account recovery.
                </p>
                <div className="pt-4 border-t border-zinc-200/60">
                  <a
                    href="mailto:gadvanceproject@gmail.com"
                    className="text-[#8b5cf6] hover:text-[#7c3aed] text-sm font-semibold transition-colors break-words"
                  >
                    gadvanceproject@gmail.com
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
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Go to Workspace Dashboard
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
    </div>
  );
}

/* --- Helper Component --- */

const ContactCard = ({
  icon,
  title,
  detail,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
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
      href={`mailto:${detail}`}
      className="text-lg sm:text-2xl font-light text-zinc-900 hover:text-[#8b5cf6] transition-colors mb-4 break-words block leading-tight"
    >
      {detail}
    </a>

    <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
      {desc}
    </p>
  </div>
);
