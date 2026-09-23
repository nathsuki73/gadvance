"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import {
  Target,
  Code,
  School,
  ArrowUpRight,
  BookOpen,
  Building2,
  CheckCircle2,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function AboutPage() {
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
      className="w-full bg-white overflow-x-hidden text-zinc-900 selection:bg-violet-50 selection:text-[#8b5cf6]"
    >
      <main>
        {/* ================= SECTION 1: HERO / THE MISSION ================= */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden bg-gradient-to-b from-white via-violet-50/40 to-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-12 relative">
            <div className="max-w-3xl">
              <span className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out inline-block text-xs font-bold tracking-widest text-[#8b5cf6] uppercase mb-4">
                About the Platform
              </span>

              <h1 className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-100 ease-out text-4xl sm:text-6xl font-light tracking-tight text-zinc-900 leading-[1.15]">
                Making gender and development learning{" "}
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  accessible to everyone.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-150 ease-out mt-6 text-lg sm:text-xl text-zinc-600 font-light leading-relaxed">
                GADvance is an educational platform designed to make Gender and
                Development (GAD) topics easy to understand, engage with, and
                apply. Through structured digital lessons and organized group
                workspaces, we help students, educators, and organizations build
                more respectful and inclusive spaces.
              </p>

              <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 delay-200 ease-out mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="rounded-full bg-[#8b5cf6] px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                  redirectUrl="/workspace"
                >
                  <span>Explore the Platform</span>
                  <ArrowUpRight size={16} />
                </ProtectedButton>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: ACADEMIC HERITAGE ================= */}
        <section className="py-20 bg-zinc-50/80 border-y border-zinc-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out flex flex-col md:flex-row items-start md:items-center gap-6 sm:gap-8">
              <div className="flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white border border-violet-100 shadow-xs shrink-0">
                <div className="relative h-9 w-9 sm:h-10 sm:w-10">
                  <Image
                    src={logoIcon}
                    alt="GADvance icon"
                    className="object-contain"
                    fill
                    sizes="40px"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]">
                  Academic Background
                </h2>
                <p className="text-base sm:text-lg text-zinc-600 font-light leading-relaxed">
                  Developed by researchers from the{" "}
                  <strong className="font-semibold text-zinc-900">
                    College of Computer Studies (CCS)
                  </strong>{" "}
                  at{" "}
                  <strong className="font-semibold text-zinc-900">
                    Laguna State Polytechnic University – San Pablo City Campus
                  </strong>
                  , GADvance is a web platform built to make Digital lessons and concepts easier to access and learn online.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: WHAT WE FOCUS ON ================= */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out max-w-2xl mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] mb-5">
                Core Focus
              </h2>
              <h3 className="mt-2 text-3xl sm:text-4xl font-light text-zinc-900">
                What drives{" "}
                <span className="italic font-serif font-semibold text-[#8b5cf6]">
                  our platform.
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ValueItem
                icon={<BookOpen size={22} />}
                title="Clear & Practical Learning"
                desc="Breaking down significant and relevant learning concepts into approachable, modular lessons anyone can follow."
              />
              <ValueItem
                icon={<Code size={22} />}
                title="Accessible Technology"
                desc="A clean, responsive web application built with privacy and usability in mind, allowing learners to study at their own pace."
              />
              <ValueItem
                icon={<Building2 size={22} />}
                title="Collaborative Workspaces"
                desc="Dedicated organization spaces where schools, offices, and study groups can take focused plans and discuss lessons together."
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: HOW GADVANCE WORKS ================= */}
        <section className="py-24 bg-zinc-50/50 border-t border-zinc-100">
          <div className="mx-auto max-w-7xl px-6 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out max-w-2xl mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#8b5cf6] mb-2">
                How It Works
              </h2>
              <h3 className="text-3xl sm:text-4xl font-light text-zinc-900">
                The learning{" "}
                <span className="italic font-serif font-semibold text-[#8b5cf6]">
                  process.
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              <RoadmapItem
                step="01"
                title="Browse & Enroll"
                desc="Choose from public or organization-based learning plan assigned directly to your group."
              />
              <RoadmapItem
                step="02"
                title="Interactive Modules"
                desc="Read lessons, review case materials, and complete short checkpoints to confirm your understanding."
              />
              <RoadmapItem
                step="03"
                title="Complete Checkpoints"
                desc="Reinforce your understanding through module checkpoints and knowledge checks designed to validate key concepts."
              />
              <RoadmapItem
                step="04"
                title="Track Completion"
                desc="Monitor your active courses and finished modules in your personal dashboard as you progress."
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: RESEARCH & CONTACT ================= */}
        <section className="py-24 bg-white border-t border-zinc-100 text-center">
          <div className="mx-auto max-w-3xl px-6">
            <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-zinc-200" />
                <School size={18} className="text-[#8b5cf6]" />
                <div className="h-px w-8 bg-zinc-200" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-zinc-900 mb-4">
                Engineered at{" "}
                <span className="text-[#8b5cf6] font-semibold italic font-serif">
                  LSPU-SPCC CCS Department
                </span>
              </h2>

              <p className="max-w-xl mx-auto text-zinc-500 font-light leading-relaxed mb-8 text-sm sm:text-base">
                GADvance is an academic research initiative from the College of
                Computer Studies. We aim to show how technology can support
                accessible education and community advocacy.
              </p>

              <div className="inline-block border-b border-zinc-200 pb-2 hover:border-[#8b5cf6] transition-colors">
                <p className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-1">
                  Connect With the Research Team
                </p>
                <a
                  href="mailto:gadvanceproject@gmail.com"
                  className="text-sm font-semibold text-zinc-800 hover:text-[#8b5cf6] transition-colors"
                >
                  gadvanceproject@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* --- Sub-components --- */

function ValueItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out bg-zinc-50/70 p-6 sm:p-7 rounded-2xl border border-zinc-100 flex flex-col space-y-3 hover:border-violet-200 hover:bg-white hover:shadow-md transition-all">
      <div className="h-10 w-10 rounded-xl bg-violet-100/70 text-[#8b5cf6] flex items-center justify-center">
        {icon}
      </div>
      <h4 className="text-base sm:text-lg font-semibold text-zinc-900">
        {title}
      </h4>
      <p className="text-zinc-500 font-light leading-relaxed text-xs sm:text-sm">
        {desc}
      </p>
    </div>
  );
}

function RoadmapItem({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="scroll-anim opacity-0 translate-y-8 transition-all duration-700 ease-out flex flex-col border-t border-zinc-200/80 pt-6">
      <span className="text-[10px] font-bold tracking-widest text-[#8b5cf6] mb-2 uppercase">
        Step {step}
      </span>
      <h4 className="text-base sm:text-lg font-semibold text-zinc-900">
        {title}
      </h4>
      <p className="mt-2 text-zinc-500 font-light leading-relaxed text-xs sm:text-sm">
        {desc}
      </p>
    </div>
  );
}