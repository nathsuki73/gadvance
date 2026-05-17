"use client";

import React from "react";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import BlockRenderer from "./BlockRenderer";
import { ModuleSectionViewerProps } from "../types";

const ModuleSectionViewer = ({
  section,
  currentIndex,
  totalSections,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: ModuleSectionViewerProps) => {
  return (
    <div className="min-h-screen">
      {/* Block Render Engine Content Wrapper */}
      <div className="w-full">
        {section.blocks
          ?.sort((a, b) => a.order_index - b.order_index)
          .map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
      </div>

      {/* 
        Minimalist Footer Navigation System:
        Re-engineered to isolate operations perfectly in the layout center
      */}
      <div className="mt-20 py-8  border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-100">
        {/* Center Side: High-Priority Linear Forward Progress Action */}
        <div className="w-full flex justify-center">
          {!isLast ? (
            <button
              type="button"
              onClick={onNext}
              className="group flex items-center justify-center gap-3 rounded-full bg-[#00aeef] px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#00aeef] active:scale-[0.98] w-full sm:w-auto"
            >
              <span>Continue</span>
              <ArrowDown
                size={14}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ) : (
            /* Complete instructional branch readout indicator (Hidden forward triggers) */
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50/50 border border-sky-100/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-[#00aeef]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00aeef] animate-pulse" />
              final instructional milestone reached
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleSectionViewer;
