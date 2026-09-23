"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  BookOpen,
  Building2,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  Lock,
  HeartHandshake,
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
              "translate-y-8",
              "scale-[0.98]",
            );
            entry.target.classList.add(
              "opacity-100",
              "translate-y-0",
              "scale-100",
            );
            observerInstance.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={scrollRef}
      className="w-full bg-white overflow-x-hidden text-zinc-900 selection:bg-violet-100 selection:text-[#8b5cf6]"
    >
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-white via-violet-50/40 to-white pt-24 pb-16 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 text-left space-y-6 order-1">
              <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
                <span className="inline-block text-xs font-bold tracking-widest text-[#8b5cf6] uppercase mb-2">
                  Welcome to the GADvance Community
                </span>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light leading-[1.15] tracking-tight text-zinc-900">
                  Learn, ask questions, and <br />
                  <span className="font-serif italic font-bold text-[#8b5cf6]">
                    grow together.
                  </span>
                </h1>
              </div>

              <p className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out max-w-xl text-base sm:text-lg text-zinc-600 font-light leading-relaxed">
                Connect with members from your school or group. Discuss lessons, complete learning plans together, and share what you learn along the way.
              </p>

              <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  redirectUrl="/workspace"
                >
                  <span>Go to My Workspace</span>
                  <ArrowUpRight size={16} />
                </ProtectedButton>

                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-3.5 text-center text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
                >
                  How it Works
                </a>
              </div>
            </div>

            {/* Right Interactive Forum Card Preview */}
            <div className="lg:col-span-6 w-full order-2">
              <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-150 ease-out relative rounded-3xl bg-white border border-violet-100 shadow-xl shadow-violet-500/10 p-5 sm:p-7 space-y-4 max-w-lg mx-auto lg:max-w-none">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={18} className="text-[#8b5cf6]" />
                    <span className="text-xs font-semibold text-zinc-800">
                      Sample Discussions
                    </span>
                  </div>
                </div>

                {/* Card item 1 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-violet-200 transition-all text-left space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#8b5cf6] block">
                    Lesson 2 • Safe Spaces
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-800 leading-snug">
                    What does a safe workplace look like in practice?
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    Learners share practical tips and daily habits that help keep schools and offices respectful.
                  </p>
                </div>

                {/* Card item 2 */}
                <div className="p-4 rounded-2xl bg-zinc-50/80 border border-zinc-100 hover:border-violet-200 transition-all text-left space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#8b5cf6] block">
                    Module 4 • Policy & Rights
                  </span>
                  <h4 className="text-sm font-semibold text-zinc-800 leading-snug">
                    Questions on the latest assessment activity
                  </h4>
                  <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                    A helpful exchange on how to apply the gender analysis checklist in group assignments.
                  </p>
                </div>

                {/* <div className="pt-2 text-center">
                  <ProtectedButton
                    onClick={() => {
                      window.location.href = "/workspace";
                    }}
                    className="text-xs font-semibold text-[#8b5cf6] hover:text-[#7c3aed] inline-flex items-center gap-1 transition-colors cursor-pointer"
                    redirectUrl="/workspace"
                  >
                    <span>Open workspace to read more</span>
                    <ArrowUpRight size={14} />
                  </ProtectedButton>
                </div> */}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 3 EASY STEPS ================= */}
      <section id="how-it-works" className="py-20 bg-zinc-50/70 border-y border-zinc-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">
              Simple & Direct
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-light text-zinc-900">
              What you can do here
            </h3>
            <p className="mt-2 mb-10 text-sm text-zinc-500 max-w-md mx-auto">
              Everything in GADvance revolves around clear lessons and helpful group discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-violet-100/70 text-[#8b5cf6] flex items-center justify-center mb-4">
                <BookOpen size={20} />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-zinc-900">
                1. Take Courses
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed flex-1">
                Enroll in assigned or public learning plans, step through chapters at your own pace, and track your progress.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-150 ease-out bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-violet-100/70 text-[#8b5cf6] flex items-center justify-center mb-4">
                <Building2 size={20} />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-zinc-900">
                2. Join Your Organization
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed flex-1">
                Connect with your specific school or academic organization to access exclusive learning materials and see your peers.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out bg-white p-6 sm:p-7 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-xl bg-violet-100/70 text-[#8b5cf6] flex items-center justify-center mb-4">
                <MessageSquare size={20} />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-zinc-900">
                3. Ask & Share
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed flex-1">
                Post questions when you are stuck, reply to fellow learners, and share insights under each module topic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= COMMUNITY RULES ================= */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out text-center max-w-xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">
              Friendly Reminders
            </h2>
            <h3 className="mt-2 text-2xl sm:text-3xl font-light text-zinc-900">
              Community Rules
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Quick guidelines so everyone feels welcome and supported.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white border border-zinc-200/70 text-[#8b5cf6] shrink-0">
                <HeartHandshake size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Be Kind & Respectful</h4>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  Treat everyone with respect. No insults, hate speech, or rude comments.
                </p>
              </div>
            </div>

            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-150 ease-out p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white border border-zinc-200/70 text-[#8b5cf6] shrink-0">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Stay on Topic</h4>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  Keep discussions focused on the lessons and assessments. Avoid unrelated topics or spam.
                </p>
              </div>
            </div>

            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white border border-zinc-200/70 text-[#8b5cf6] shrink-0">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Respect Privacy</h4>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  Do not share other people&apos;s personal contact info or private details without permission.
                </p>
              </div>
            </div>

            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-250 ease-out p-5 sm:p-6 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-start gap-4">
              <div className="p-2 rounded-xl bg-white border border-zinc-200/70 text-[#8b5cf6] shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">Honest Work</h4>
                <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                  Help each other understand concepts, but submit your own answers on assessments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="bg-gradient-to-b from-white via-violet-50/50 to-white py-20 text-center border-t border-zinc-100">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">
              Ready to jump in?
            </h2>
            <h3 className="text-2xl sm:text-4xl font-light text-zinc-900">
              Head over to your workspace
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed max-w-md mx-auto">
              Check your courses and keep your progress going.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 cursor-pointer"
                redirectUrl="/workspace"
              >
                Open Workspace
              </ProtectedButton>

              <Link
                href="/"
                className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-3.5 text-sm font-semibold text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95"
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