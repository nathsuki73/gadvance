"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  HeartHandshake,
  Shield,
  Share2,
  MessageCircle,
  Tag,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function CommunityPage() {
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
      className="bg-white overflow-hidden text-zinc-900 selection:bg-violet-100 selection:text-[#8b5cf6]"
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/50 to-white pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Interactive Forum Threads Card */}
            <div className="lg:col-span-6 scroll-anim opacity-0 translate-y-10 transition-all duration-[1200ms] ease-out order-2 lg:order-1">
              <div className="relative rounded-3xl bg-white border border-violet-100 shadow-xl shadow-violet-500/10 p-6 sm:p-8 space-y-4">
                {/* Forum Card Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#8b5cf6]" />
                    <span className="text-xs font-semibold text-zinc-800">
                      Active Community Discussions
                    </span>
                  </div>
                  <span className="text-[10px] font-medium bg-violet-50 text-[#8b5cf6] px-2.5 py-1 rounded-full">
                    Moderated Forum
                  </span>
                </div>

                {/* Sample Thread Preview 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-violet-200 transition-all text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold text-[#8b5cf6] flex items-center gap-1">
                      <Tag size={10} /> Institutional Policy
                    </span>
                    <span>Recent Topic</span>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-800 leading-snug">
                    Establishing CODI committees under the Safe Spaces Act
                  </h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2">
                    Sharing best practices for drafting reporting guidelines and
                    ensuring confidential employee support.
                  </p>
                </div>

                {/* Sample Thread Preview 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-violet-200 transition-all text-left space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold text-[#8b5cf6] flex items-center gap-1">
                      <Tag size={10} /> Leadership
                    </span>
                    <span>Active Thread</span>
                  </div>
                  <h4 className="text-sm font-medium text-zinc-800 leading-snug">
                    Inclusive mentorship strategies for women leaders
                  </h4>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed line-clamp-2">
                    How peer networks and executive sponsorship help navigate
                    workplace advancement.
                  </p>
                </div>

                {/* Forum Footer Link */}
                <div className="pt-2 text-center">
                  <ProtectedButton
                    onClick={() => {
                      window.location.href = "/workspace";
                    }}
                    className="text-xs font-medium text-[#8b5cf6] hover:text-[#7c3aed] inline-flex items-center gap-1 transition-colors"
                    redirectUrl="/workspace"
                  >
                    <span>Browse all topics in workspace</span>
                    <ArrowUpRight size={14} />
                  </ProtectedButton>
                </div>
              </div>
            </div>

            {/* Right Hero Content */}
            <div className="lg:col-span-6 text-left space-y-6 order-1 lg:order-2">
              <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl">
                Growing <br />
                <span className="">
                  together
                </span>{" "}
                in <br />
                <span className="font-serif italic font-bold text-primary">
                  shared purpose.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out max-w-xl text-lg font-light leading-relaxed text-zinc-600">
                GADvance is a collective of forward-thinking leaders, students,
                and institutions committed to building inclusive spaces,
                dismantling gender barriers, and sharing practical insights.
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out flex flex-col sm:flex-row items-center gap-4 pt-4">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 flex items-center justify-center gap-2"
                  redirectUrl="/workspace"
                >
                  <span>Join the Community</span>
                  <ArrowUpRight size={18} />
                </ProtectedButton>

                <a
                  href="#guidelines"
                  className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-8 py-4 text-center text-base font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  Community Guidelines
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY FEATURES ================= */}
      <section className="py-28 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 text-center">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              The Network
            </h2>
            <h3 className="mt-4 text-3xl font-light tracking-tight text-zinc-900 sm:text-5xl">
              Designed for <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                collaborative advocacy.
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-100 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Share2 size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Shared Insights
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Access a library of localized case studies, educational
                resources, and peer-to-peer learning experiences.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-200 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <MessageSquare size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Constructive Dialogue
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Participate in moderated discussions, topic forums, and live
                learning sessions with GAD champions.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 delay-300 ease-out bg-white p-8 rounded-3xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-2xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <HeartHandshake size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Peer Mentorship
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Connect with students, educators, and professionals navigating
                similar paths toward gender equity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY GUIDELINES ================= */}
      <section id="guidelines" className="py-24 bg-white">
        <div className="mx-auto max-w-5xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              Safe Space Commitment
            </h2>
            <h3 className="mt-4 text-3xl font-light tracking-tight text-zinc-900 sm:text-4xl">
              Our Community Standards
            </h3>
            <p className="mt-4 text-base font-light text-zinc-500">
              To ensure a respectful environment for everyone, our forum
              operates under clear engagement principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                title: "Mutual Respect & Inclusivity",
                desc: "We value constructive discourse and zero tolerance for discriminatory language, harassment, or hate speech.",
              },
              {
                title: "Psychological Safety",
                desc: "Members are encouraged to share perspectives openly without fear of judgment or hostile retorts.",
              },
              {
                title: "Privacy & Confidentiality",
                desc: "Personal experiences shared within learning circles remain confidential within the workspace.",
              },
              {
                title: "Constructive Learning",
                desc: "Discussions focus on constructive solutions, mutual support, and evidence-informed advocacy.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 rounded-2xl bg-zinc-50/60 border border-zinc-100"
              >
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-[#8b5cf6]" />
                  <h4 className="text-lg font-medium text-zinc-900">
                    {item.title}
                  </h4>
                </div>
                <p className="mt-3 text-xs font-light text-zinc-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-violet-50 to-white py-32 text-center">
        <div className="mx-auto max-w-4xl px-8 relative z-10">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#8b5cf6]">
              Your Voice Matters
            </h2>
            <h3 className="mt-6 text-4xl font-light leading-tight tracking-tight text-zinc-900 sm:text-6xl">
              Be part of a growing <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                network for change.
              </span>
            </h3>
            <p className="mt-8 text-xl font-light text-zinc-600 max-w-2xl mx-auto">
              Join the GADvance community workspace to participate in
              discussions and connect with peers.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-5 text-lg font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Enter Community Forum
              </ProtectedButton>

              <Link
                href="/"
                className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-5 text-lg font-medium text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
              >
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
