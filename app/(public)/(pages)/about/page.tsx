"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { SUPPORT_EMAIL, supportMailto } from "@/app/lib/support";
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
                learning that adapts <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">
                  to every learner.
                </span>
              </h1>

              <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mt-8 text-xl md:text-2xl text-zinc-500 font-light leading-relaxed lowercase">
                gadvance is an adaptive e-learning platform for gender
                sensitivity and gender and development (gad) education. it uses
                bayesian knowledge tracing to estimate what each learner has
                mastered and adjusts assessments to match.
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
                title="gender-responsive education"
                desc="structured gad lessons on core concepts, gender roles, and the policies that promote equality, aligned with sdg 4 (quality education) and sdg 5 (gender equality)."
              />
              <ValueItem
                icon={<Code size={24} strokeWidth={1.5} />}
                title="innovation for equity"
                desc="leveraging digital infrastructure built at lspu san pablo to create accessible, data-informed pathways for growth."
              />
              <ValueItem
                icon={<Globe size={24} strokeWidth={1.5} />}
                title="learning for organizations"
                desc="organizations can enroll their members through a join code and follow their learning progress from the gadvance admin portal."
              />
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: ADVANCEMENT FRAMEWORK ================= */}
        <section className="py-28 bg-zinc-50/50 border-t border-zinc-100">
          <div className="mx-auto max-w-7xl px-8 lg:px-12">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-2xl mb-16">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-4">
                how learning works
              </h2>
              <h3 className="text-3xl sm:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
                from first lesson <br />
                <span className="italic font-serif font-semibold text-[#8b5cf6]">
                  to mastery.
                </span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              <RoadmapItem
                phase="01"
                title="pre-test"
                desc="a short pre-test records what you already know before the course begins."
              />
              <RoadmapItem
                phase="02"
                title="lessons"
                desc="work through structured modules and lessons at your own pace."
              />
              <RoadmapItem
                phase="03"
                title="adaptive checkpoints"
                desc="checkpoint quizzes choose question difficulty from your estimated mastery and point you to lesson content to review when needed."
              />
              <RoadmapItem
                phase="04"
                title="post-test and results"
                desc="a post-test and your progress view show how your understanding has grown."
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
                  href={supportMailto("support")}
                  className="text-sm font-medium text-zinc-800 hover:text-[#8b5cf6] transition-colors"
                >
                  {SUPPORT_EMAIL}
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
