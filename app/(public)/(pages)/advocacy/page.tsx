"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  Megaphone,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import ProtectedButton from "@/app/components/ProtectedButton";

export default function AdvocacyPage() {
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
        <div className="mx-auto max-w-7xl px-8 lg:px-12 w-full text-center">
          <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out text-4xl font-light leading-[1.1] tracking-tight text-zinc-900 sm:text-6xl lg:text-7xl max-w-4xl mx-auto">
            Voices for equity. <br />
            Education for{" "}
            <span className="font-semibold text-[#8b5cf6]">
              inclusion.
            </span>{" "}
            <br />
            <span className="font-serif italic text-zinc-800">
              Action for all.
            </span>
          </h1>

          <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out max-w-2xl mx-auto mt-8 text-lg font-light leading-relaxed text-zinc-600 sm:text-xl">
            Advocacy begins with understanding. GADvance bridges education and
            awareness to cultivate workplaces and communities free from
            discrimination, where everyone can live and work authentically.
          </p>

          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out flex flex-col sm:flex-row items-center justify-center gap-4 pt-10">
            <ProtectedButton
              onClick={() => {
                window.location.href = "/workspace";
              }}
              className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-8 py-4 text-base font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-200 active:scale-95 flex items-center justify-center gap-2"
              redirectUrl="/workspace"
            >
              <span>Join the Advocacy Movement</span>
              <ArrowUpRight size={18} />
            </ProtectedButton>

            <a
              href="#media"
              className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-8 py-4 text-center text-base font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-95"
            >
              Watch Campaign Spotlight
            </a>
          </div>
        </div>
      </section>

      {/* ================= EMBEDDED VIDEO SPOTLIGHT SECTION ================= */}
      <section id="media" className="py-24 bg-zinc-50 border-y border-zinc-100">
        <div className="mx-auto max-w-5xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              Spotlight Campaign
            </h2>
            <h3 className="mt-4 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-4xl">
              &quot;Never apologize for who you are.&quot;
            </h3>
            <p className="mt-4 text-base font-light text-zinc-500">
              Understanding the human impact of acceptance and psychological
              safety in everyday settings.
            </p>
          </div>

          {/* Video Container Card */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out relative rounded-3xl overflow-hidden bg-white p-3 border border-violet-100 shadow-xl shadow-violet-500/10">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/C2Poo-E2fDY?si=yrK2BY5fNT_S_n0X"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= THREE PILLARS OF ADVOCACY ================= */}
      <section className="py-28 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#8b5cf6]">
              Our Core Focus Areas
            </h2>
            <h3 className="mt-6 text-3xl font-light leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Transforming advocacy into <br className="hidden sm:block" />
              <span className="font-serif italic text-[#8b5cf6]">
                sustainable impact.
              </span>
            </h3>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out bg-zinc-50/60 p-8 rounded-2xl border border-zinc-100">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Heart size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Empathy & Understanding
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Building awareness around diverse gender identities and lived
                experiences to eliminate prejudice and foster genuine empathy.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out bg-zinc-50/60 p-8 rounded-2xl border border-zinc-100">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <Megaphone size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Community Voice
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Amplifying marginalized voices and creating accessible platforms
                for individuals to share insights, stories, and educational
                tools.
              </p>
            </div>

            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out bg-zinc-50/60 p-8 rounded-2xl border border-zinc-100">
              <div className="h-12 w-12 rounded-xl bg-violet-50 text-[#8b5cf6] flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h4 className="text-xl font-medium text-zinc-900">
                Safe Environments
              </h4>
              <p className="mt-3 text-sm font-light leading-relaxed text-zinc-500">
                Assisting organizations and educational institutions in
                implementing policies that ensure safety, respect, and zero
                tolerance for harassment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACTIONABLE ADVOCACY MODULES ================= */}
      <section className="py-28 bg-zinc-50 border-t border-zinc-100">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
              Advocacy Through Learning
            </h2>
            <h3 className="mt-4 text-3xl font-light tracking-tight text-zinc-900 sm:text-5xl">
              Educational Frameworks for <br />
              <span className="font-serif italic font-semibold">
                Active Allyship
              </span>
            </h3>
            <p className="mt-6 text-lg font-light text-zinc-500">
              Turn intent into structured action through our specialized
              e-learning advocacy courses.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                num: "01",
                title: "Fundamentals of Gender & Identity Advocacy",
                desc: "An introductory course exploring core terminology, inclusive language, and foundational concepts of human rights and equality.",
              },
              {
                num: "02",
                title: "Building Inclusive Organizational Cultures",
                desc: "Actionable strategies for HR leaders and workplace allies to remove unconscious bias and foster psychological safety.",
              },
              {
                num: "03",
                title: "Active Allyship & Bystander Intervention",
                desc: "Practical frameworks for recognizing microaggressions, speaking up safely, and supporting colleagues effectively.",
              },
              {
                num: "04",
                title: "Policy Reform & Community Engagement",
                desc: "Navigating local policies, Gender and Development (GAD) mandates, and driving institutional policy updates.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out p-8 rounded-2xl bg-white border border-zinc-200/80 hover:border-violet-200 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-[#8b5cf6]">
                    {item.num}
                  </span>
                  <h4 className="text-xl font-medium text-zinc-900">
                    {item.title}
                  </h4>
                </div>
                <p className="mt-4 text-sm font-light text-zinc-500 leading-relaxed">
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
              Be Part of the Solution
            </h2>
            <h3 className="mt-6 text-4xl font-light leading-tight tracking-tight text-zinc-900 sm:text-6xl">
              Advocate for a culture of <br />
              <span className="font-serif italic font-semibold text-[#8b5cf6]">
                respect and equality.
              </span>
            </h3>
            <p className="mt-8 text-xl font-light text-zinc-600 max-w-2xl mx-auto">
              Start your learning journey today and help build inclusive
              communities across the Philippines.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <ProtectedButton
                onClick={() => {
                  window.location.href = "/workspace";
                }}
                className="w-full sm:w-auto rounded-full bg-[#8b5cf6] px-10 py-5 text-lg font-medium text-white transition-all hover:bg-[#7c3aed] hover:shadow-xl hover:shadow-violet-200 active:scale-95"
                redirectUrl="/workspace"
              >
                Explore Advocacy Workspace
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
