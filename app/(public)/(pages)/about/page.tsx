"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import {
  ArrowRight,
  Target,
  Globe,
  Code,
  School,
  Sparkles,
  ArrowUpRight,
  GraduationCap,
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
        {/* ================= SECTION 1: HERO / THE MISSION ================= */}
        <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden bg-gradient-to-b from-white via-violet-50/50 to-white">
          <div className="mx-auto max-w-7xl px-8 lg:px-12 relative">
            <div className="max-w-3xl">
              <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
                bridging the gap <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  in gender leadership.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mt-8 text-xl md:text-2xl text-zinc-500 font-light leading-relaxed lowercase">
                gadvance emerged from an urgent need to address structural
                disparities that limit professional mobility. we catalyze gender
                advancement by deploying specialized digital education designed
                to dismantle systemic barriers.
              </p>

              <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out mt-10">
                <ProtectedButton
                  onClick={() => {
                    window.location.href = "/workspace";
                  }}
                  className="rounded-full bg-[#8b5cf6] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 inline-flex items-center gap-2"
                  redirectUrl="/workspace"
                >
                  <span>Explore the Platform</span>
                  <ArrowUpRight size={18} />
                </ProtectedButton>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: ACADEMIC HERITAGE ================= */}
        <section className="py-24 bg-zinc-50/80 border-y border-zinc-100">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out flex flex-col md:flex-row items-center gap-10">
              <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-white border border-violet-100 shadow-sm shrink-0">
                <div className="relative h-10 w-10">
                  <Image
                    src={logoIcon}
                    alt="gadvance icon"
                    className="object-contain"
                    fill
                    sizes="40px"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
                  the academic foundation
                </h2>
                <p className="text-lg sm:text-xl text-zinc-600 font-light leading-relaxed">
                  Pioneered by researchers at the{" "}
                  <span className="font-semibold text-zinc-900">
                    College of Computer Studies (CCS)
                  </span>{" "}
                  within{" "}
                  <span className="font-semibold text-zinc-900">
                    Laguna State Polytechnic University – San Pablo City Campus
                  </span>
                  , GADvance synthesizes technological innovation with the
                  urgent pursuit of workplace equity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: PILLARS OF ADVANCEMENT ================= */}
        <section className="py-28 bg-white">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl mb-16">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
                core values
              </h2>
              <h3 className="mt-4 text-3xl sm:text-5xl font-light tracking-tight text-zinc-900">
                Pillars of{" "}
                <span className="italic font-serif font-semibold text-[#8b5cf6]">
                  advancement.
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ValueItem
                icon={<Target size={24} strokeWidth={1.5} />}
                title="strategic advocacy"
                desc="modernizing organizational culture by equipping individuals with leadership competencies required for decision-making."
              />
              <ValueItem
                icon={<Code size={24} strokeWidth={1.5} />}
                title="innovation for equity"
                desc="leveraging digital infrastructure built at lspu san pablo to create accessible, data-informed pathways for growth."
              />
              <ValueItem
                icon={<Globe size={24} strokeWidth={1.5} />}
                title="cultural transformation"
                desc="facilitating a shift in institutional frameworks, moving beyond compliance toward genuine belonging and equitable opportunity."
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: ADVANCEMENT FRAMEWORK ================= */}
        <section className="py-28 bg-zinc-50/50 border-t border-zinc-100">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-2xl mb-16">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-4">
                advancement framework
              </h2>
              <h3 className="text-3xl sm:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
                a methodology for <br />
                <span className="italic font-serif font-semibold text-[#8b5cf6]">
                  equitable progress.
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <RoadmapItem
                phase="01"
                title="gap analysis"
                desc="diagnosing specific cultural and structural frictions that hinder gender advancement in local and regional workplaces."
              />
              <RoadmapItem
                phase="02"
                title="empowerment modules"
                desc="delivering targeted e-learning modules designed to build negotiation skills, advocacy, and leadership readiness."
              />
              <RoadmapItem
                phase="03"
                title="institutional alignment"
                desc="working alongside institutions to integrate inclusive frameworks that foster fair, transparent talent pipelines."
              />
              <RoadmapItem
                phase="04"
                title="sustainable progress"
                desc="monitoring long-term learning outcomes to ensure gender advancement remains a permanent organizational priority."
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 5: CREATORS & CREDENTIALS ================= */}
        <section className="py-28 bg-white border-t border-zinc-100 text-center">
          <div className="mx-auto max-w-4xl px-8">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
              <div className="inline-flex items-center gap-3 mb-8">
                <div className="h-px w-10 bg-zinc-200" />
                <School size={20} className="text-[#8b5cf6]" />
                <div className="h-px w-10 bg-zinc-200" />
              </div>

              <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-zinc-900 lowercase mb-6">
                engineered at{" "}
                <span className="text-[#8b5cf6] font-semibold italic font-serif">
                  lspu-spcc ccs department
                </span>
              </h2>

              <p className="max-w-2xl mx-auto text-zinc-500 font-light lowercase leading-relaxed mb-10 text-base sm:text-lg">
                gadvance stands as a testament to academic social
                responsibility. engineered by the college of computer studies,
                this project redefines how digital technology can champion
                gender equity and social inclusion in the professional sphere.
              </p>

              <div className="inline-block border-b border-zinc-200 pb-2 hover:border-[#8b5cf6] transition-colors">
                <p className="text-[10px] font-bold tracking-[0.3em] text-zinc-400 uppercase mb-1">
                  connect with the research team
                </p>
                <a
                  href="mailto:gadvanceproject@gmail.com"
                  className="text-sm font-medium text-zinc-800 hover:text-[#8b5cf6] transition-colors"
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

const ValueItem = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out bg-zinc-50/60 p-8 rounded-3xl border border-zinc-100 flex flex-col space-y-4 hover:border-violet-200 hover:bg-white hover:shadow-lg hover:shadow-violet-500/5 transition-all">
    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-[#8b5cf6]">
      {icon}
    </div>
    <h4 className="text-xl font-medium text-zinc-900 lowercase">{title}</h4>
    <p className="text-zinc-500 font-light leading-relaxed text-sm lowercase">
      {desc}
    </p>
  </div>
);

const RoadmapItem = ({
  phase,
  title,
  desc,
}: {
  phase: string;
  title: string;
  desc: string;
}) => (
  <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out flex flex-col border-t border-zinc-200/80 pt-8">
    <span className="text-[10px] font-bold tracking-[0.3em] text-[#8b5cf6] mb-4 uppercase">
      phase {phase}
    </span>
    <h4 className="text-xl font-medium text-zinc-900 lowercase">{title}</h4>
    <p className="mt-3 text-zinc-500 font-light leading-relaxed text-sm lowercase">
      {desc}
    </p>
  </div>
);
