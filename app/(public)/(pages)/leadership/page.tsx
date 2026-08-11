"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Users,
  Target,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import image1 from "@/app/(public)/assets/hero.png";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function WomenInLeadershipPage() {
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
    <div ref={scrollRef} className="bg-white overflow-hidden text-zinc-900">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-violet-50/50 to-white pt-24 pb-20">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-left space-y-8">
              <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl">
                Break boundaries. <br />
                Lead with{" "}
                <span className="font-semibold text-[#8b5cf6]">
                  purpose
                </span> & <br />
                <span className="font-serif italic text-zinc-800">
                  transform culture.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out max-w-2xl text-lg font-light leading-relaxed text-zinc-600 sm:text-xl">
                GADvance&apos;s digital learning track equips women and
                institutional allies with executive skills, strategic
                negotiation, and gender-transformative leadership frameworks for
                modern organizations.
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out flex flex-col sm:flex-row items-center gap-4 pt-4">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 flex items-center justify-center gap-2"
                  redirectUrl="/workspace"
                >
                  <span>Start Track Enrollment</span>
                  <ArrowUpRight size={18} />
                </ProtectedButton>

                <a
                  href="#modules"
                  className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-8 py-4 text-center text-base font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  Explore Modules
                </a>
              </div>
            </div>

            {/* Hero Right Visual */}
            <div className="lg:col-span-5 scroll-anim opacity-0 translate-y-10 transition-all duration-[1200ms] delay-400 ease-out">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl bg-gradient-to-tr from-violet-100 to-violet-50 p-4 border border-violet-100/80 shadow-2xl shadow-violet-500/10">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-white">
                  <Image
                    src={image1}
                    alt="Women in Leadership E-learning"
                    fill
                    priority
                    className="object-cover object-top hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />

                  {/* Focus Badge */}
                  <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/90 border border-white/50 p-4 rounded-xl shadow-lg">
                    <p className="text-xs uppercase tracking-wider font-bold text-[#8b5cf6]">
                      Core Objective
                    </p>
                    <p className="text-sm font-medium text-zinc-800 mt-1">
                      Strengthening executive readiness and practical
                      decision-making through self-paced learning.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THE GAP / CHALLENGE ================= */}
      <section className="py-28 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              The Leadership Imperative
            </h2>
            <h3 className="mt-6 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Constructive pathways to the <br className="hidden sm:block" />
              <span className="font-serif italic text-[#8b5cf6]">
                decision-making table.
              </span>
            </h3>
            <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-zinc-500">
              Systemic obstacles and workplace biases often hinder career
              growth. Our learning plans focuses on practical skills and
              organizational frameworks that support equitable advancement.
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Target size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Executive Self-Efficacy
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Develop strategic communication, advocacy skills, and confident
                decision-making grounded in core professional strengths.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Sponsorship & Mentorship
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Learn to build professional networks, secure sponsorship, and
                establish mentorship structures within your workplace.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Award size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Institutional Action
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Gain frameworks to evaluate organizational policy, advocate for
                fair practices, and promote psychological safety.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================  MODULES ================= */}
      <section id="modules" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out text-center max-w-3xl mx-auto">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
              Structured Learning
            </h2>
            <h3 className="mt-4 text-3xl font-light tracking-tight text-zinc-900 sm:text-5xl">
              Roadmap for <br />
              <span className="font-serif italic font-semibold">
                Women Leaders
              </span>
            </h3>
            <p className="mt-6 text-lg font-light text-zinc-500">
              Interactive, self-paced modules equipped with structured
              coursework and practical exercises.
            </p>
          </div>

          {/* Module Cards */}
          <div className="mt-20 space-y-6 max-w-4xl mx-auto">
            {[
              {
                num: "01",
                title: "Strategic Negotiation & Professional Advocacy",
                desc: "Frameworks for value identification, effective dialogue, and navigating high-stakes professional negotiations.",
                duration: "2 Hours • Self-Paced",
              },
              {
                num: "02",
                title: "Addressing Bias in Workplace Evaluations",
                desc: "Understanding performance-appraisal challenges and establishing objective criteria to support talent development.",
                duration: "1.5 Hours • Interactive Modules",
              },
              {
                num: "03",
                title: "Executive Presence & Authentic Leadership",
                desc: "Developing a personal leadership voice while communicating effectively across institutional levels.",
                duration: "2.5 Hours • Practical Case Studies",
              },
              {
                num: "04",
                title: "Leading Gender Mainstreaming & Policy Initiatives",
                desc: "Aligning institutional practices and operational strategies with gender and development frameworks.",
                duration: "3 Hours • Advanced Certificate",
              },
            ].map((module, idx) => (
              <div
                key={idx}
                className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-2xl border border-zinc-100 bg-zinc-50/60 hover:bg-white hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/5 transition-all"
              >
                <div className="flex items-start gap-6">
                  <span className="text-2xl font-bold text-[#8b5cf6]">
                    {module.num}
                  </span>
                  <div>
                    <h4 className="text-xl font-medium text-zinc-900 group-hover:text-[#8b5cf6] transition-colors">
                      {module.title}
                    </h4>
                    <p className="mt-2 text-sm font-light text-zinc-500 max-w-xl leading-relaxed">
                      {module.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-zinc-200/60">
                  <span className="text-xs font-medium text-zinc-400">
                    {module.duration}
                  </span>
                  <BookOpen size={18} className="text-[#8b5cf6]" />
                </div>
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
              Take Your Next Step
            </h2>
            <h3 className="mt-6 text-4xl font-light leading-tight tracking-tight text-zinc-900 sm:text-6xl">
              Ready to advance your <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                leadership journey?
              </span>
            </h3>
            <p className="mt-8 text-xl font-light text-zinc-600 max-w-2xl mx-auto">
              Join learners and organizations building inclusive, supportive
              workplace cultures.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-5 text-lg font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Enroll in Leadership Track
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
