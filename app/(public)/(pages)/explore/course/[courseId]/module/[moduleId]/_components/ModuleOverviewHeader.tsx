"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { ChevronRight } from "lucide-react";

import type { ModuleResponse } from "../types";

type ModuleOverviewHeaderProps = {
  module: ModuleResponse;
};

const ModuleOverviewHeader = ({ module }: ModuleOverviewHeaderProps) => {
  const router = useRouter();
  const lessonsCount = module.lessons?.length || 0;
  const progress = module.progress?.percentage || 0;

  const handleContinueLearning = () => {
    router.push(`/learn/${module.id}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/60 bg-[#fcfbf8] text-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -right-16 -bottom-12 h-80 w-80 rounded-full bg-sky-400/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 md:px-12 lg:py-16">
        <div className="rounded-4xl border border-zinc-200/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(24,24,27,0.05)] backdrop-blur-sm md:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-400">
                Module Journey
              </p>

              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 md:text-5xl lg:text-6xl">
                {module.title}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-500 md:text-lg">
                {module.about ||
                  "A focused learning path built to guide you through the core ideas and activities of this module."}
              </p>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                {module.description ||
                  "Move through the lessons at your own pace and keep track of your progress from one section to the next."}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleContinueLearning}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover"
                >
                  Continue Learning
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModuleOverviewHeader;
