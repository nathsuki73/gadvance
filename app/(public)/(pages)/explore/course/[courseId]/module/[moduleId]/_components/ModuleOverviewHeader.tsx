// app/courses/[courseId]/modules/[moduleId]/_components/ModuleOverviewHeader.tsx

"use client";

import React from "react";

import {
  BookOpen,
  Clock3,
  CheckCircle2,
  Layers3,
  ChevronRight,
} from "lucide-react";

type ModuleOverviewHeaderProps = {
  module: {
    title: string;
    about?: string;

    progress?: {
      percentage: number;
      completed_blocks: number;
      total_blocks: number;
    };

    section_groups?: unknown[];
  };
};

const ModuleOverviewHeader = ({
  module,
}: ModuleOverviewHeaderProps) => {
  const progress =
    module.progress?.percentage || 0;

  const completedBlocks =
    module.progress?.completed_blocks || 0;

  const totalBlocks =
    module.progress?.total_blocks || 0;

  const totalGroups =
    module.section_groups?.length || 0;

  const isCompleted =
    progress >= 100;

  return (
    <section className="bg-[#00aeef] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">

          {/* LEFT */}
          <div className="flex flex-col gap-8">

            {/* Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <BookOpen
                  size={24}
                  strokeWidth={1.5}
                />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-100">
                Learning Module
              </span>
            </div>

            {/* Title */}
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                {module.title}
              </h1>

              <p className="mt-6 text-lg text-sky-50 font-light leading-relaxed">
                {module.about ||
                  "Structured module content and guided instructional materials."}
              </p>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/20 text-[11px] font-bold uppercase tracking-widest text-sky-100">

              <div className="flex items-center gap-2">
                <Layers3 size={14} />
                {totalGroups} section groups
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                {completedBlocks}/{totalBlocks} blocks completed
              </div>

              {isCompleted && (
                <div className="flex items-center gap-2 text-yellow-200">
                  <Clock3 size={14} />
                  completed
                </div>
              )}
            </div>

            {/* Progress */}
            <div className="pt-2 max-w-xl">

              <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.25em] text-sky-100">
                <span>module progress</span>

                <span>{progress}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-sky-50/80 font-light">
                {isCompleted
                  ? "You completed this module."
                  : "Continue progressing through the learning blocks."}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="w-full lg:w-auto flex flex-col gap-3 lg:pb-2">

            <button
              className="w-full lg:w-auto bg-white text-[#00aeef] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-sky-50 hover:-translate-y-1 active:scale-[0.98] rounded-md"
            >
              <div className="flex items-center justify-center gap-3">
                Continue Learning

                <ChevronRight size={16} />
              </div>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ModuleOverviewHeader;