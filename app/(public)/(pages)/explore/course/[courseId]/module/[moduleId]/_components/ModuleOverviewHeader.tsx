"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { ChevronRight, Sparkles } from "lucide-react";

import type { ModuleResponse } from "../types";

type ModuleOverviewHeaderProps = {
  module: ModuleResponse;
};

const ModuleOverviewHeader = ({ module }: ModuleOverviewHeaderProps) => {
  const router = useRouter();

  const handleContinueLearning = () => {
    router.push(`/learn/${module.id}`);
  };
  const handleAdaptiveLearning = () => {
    router.push(`/adaptive/${module.id}`);
  };

  return (
    <section className="bg-[#00aeef] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-100">
              Learning Module
            </p>

            <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              {module.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg font-light leading-relaxed text-sky-50">
              {module.about}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleContinueLearning}
              className="inline-flex items-center gap-3 rounded-md bg-white px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[#00aeef] transition-all hover:-translate-y-1 hover:bg-sky-50"
            >
              Continue Learning
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleAdaptiveLearning}
              className="inline-flex items-center gap-3 rounded-md justify-center bg-white px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[#00aeef] transition-all hover:-translate-y-1 hover:bg-sky-50"
            >
              Adaptive Learn
              <Sparkles size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModuleOverviewHeader;
