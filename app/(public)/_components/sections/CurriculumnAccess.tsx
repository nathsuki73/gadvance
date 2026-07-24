"use client";

import React, { useEffect, useRef } from "react";
import { FileText, ArrowRight, Download } from "lucide-react";

const CurriculumAccess = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 1. Reveal element smoothly
            entry.target.classList.remove(
              "opacity-0",
              "translate-y-10",
              "translate-x-10",
              "-translate-x-10",
            );
            entry.target.classList.add(
              "opacity-100",
              "translate-y-0",
              "translate-x-0",
            );

            // 2. Stop observing so it only animates ONCE
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="overflow-hidden bg-white py-32 sm:py-48">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-24 lg:flex-row">
          {/* Text Side - Slides in from the left */}
          <div className="scroll-anim slide-left opacity-0 -translate-x-10 transition-all duration-1000 ease-out will-change-transform max-w-2xl">
            <h2 className="mb-8 text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">
              curriculum
            </h2>
            <h3 className="text-4xl font-light leading-tight tracking-tight text-zinc-900 md:text-5xl">
              explore the{" "}
              <span className="font-serif italic">learning modules.</span>
            </h3>
            <p className="mt-8 text-xl font-light leading-9 text-zinc-500">
              our 2026 roadmap covers the essential pillars of gender
              advancement tailored for the philippine workplace. download the
              overview to see the full list of modules, learning outcomes, and
              certification paths.
            </p>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row">
              {/* Primary action */}
              <button className="group flex items-center justify-center gap-3 rounded-full bg-[#8b5cf6] px-8 py-4 text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-100 active:scale-95">
                <Download size={18} />
                <span className="font-medium lowercase">download overview</span>
              </button>

              {/* Secondary action */}
              <button className="flex items-center justify-center gap-3 rounded-full border border-zinc-200 px-8 py-4 text-zinc-600 transition-all hover:bg-zinc-50 active:scale-95">
                <span className="font-medium lowercase">
                  institutional inquiry
                </span>
                <ArrowRight size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Visual Side: The "Roadmap" document card - Slides in from the right */}
          <div className="scroll-anim slide-right opacity-0 translate-x-10 transition-all duration-1000 delay-300 ease-out will-change-transform relative w-full max-w-sm">
            {/* Skeuomorphic card */}
            <div className="aspect-[3/4] flex cursor-default flex-col justify-between rounded-[32px] border border-zinc-100 bg-zinc-50 p-10 shadow-sm transition-all duration-500 hover:-rotate-1 hover:bg-white hover:shadow-xl">
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <FileText size={24} className="text-[#8b5cf6]" />
                </div>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6]">
                  v1.0 2026
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-semibold leading-snug text-zinc-900">
                  gender advancement <br /> roadmap & curriculum
                </h4>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs lowercase text-zinc-500">
                      12 foundational modules
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs lowercase text-zinc-500">
                      institutional framework
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs lowercase text-zinc-500">
                      certification standards
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-200/60 pt-8">
                <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">
                  gadvance philippines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurriculumAccess;
