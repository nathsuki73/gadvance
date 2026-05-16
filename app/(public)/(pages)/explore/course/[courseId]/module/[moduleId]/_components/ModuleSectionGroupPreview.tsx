// app/courses/[courseId]/modules/[moduleId]/_components/ModuleSectionGroupPreview.tsx

"use client";

import React from "react";

import Link from "next/link";

import {
  Layers3,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

type ModuleSectionGroupPreviewProps = {
  module: {
    id: string;

    section_groups?: Array<{
      id: string;
      title: string;
      sections?: Array<{
        id: string;
      }>;
    }>;
  };
};

const ModuleSectionGroupPreview = ({
  module,
}: ModuleSectionGroupPreviewProps) => {
  const groups =
    module.section_groups || [];

  return (
    <section className="py-16 md:py-24 bg-white">

      <div className="max-w-7xl mx-auto md:px-12 px-6">

        <div className="mb-12 border-l-4 border-[#00aeef] pl-6">

          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
            Module Contents
          </h2>

          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Section Groups
          </h3>

        </div>

        <div className="flex flex-col">

          {groups.map((group, index) => {

            const sectionCount =
              group.sections?.length || 0;

            return (
              <Link
                key={group.id}
                href="#"
                className="group flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2"
              >

                {/* LEFT */}
                <div className="flex items-start gap-4 sm:gap-8">

                  <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                    {(index + 1)
                      .toString()
                      .padStart(2, "0")}
                  </span>

                  <div className="flex flex-col gap-2">

                    <div className="flex items-center gap-3">

                      <Layers3
                        size={16}
                        className="text-[#00aeef] shrink-0"
                      />

                      <h4 className="text-base font-medium text-zinc-800 group-hover:text-[#00aeef] transition-colors">
                        {group.title}
                      </h4>

                    </div>

                    <p className="text-sm text-zinc-500 font-light leading-relaxed">
                      {sectionCount} instructional sections
                    </p>

                  </div>

                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4 shrink-0">

                  <CheckCircle2
                    size={18}
                    className="text-emerald-500"
                    strokeWidth={2}
                  />

                  <ChevronRight
                    size={16}
                    className="text-zinc-300 group-hover:text-[#00aeef] transition-colors"
                  />

                </div>

              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModuleSectionGroupPreview;