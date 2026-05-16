"use client";

import React from "react";
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
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="mb-8">
          {section.groupTitle && (
            <p className="mb-2 text-sm font-medium text-sky-600">
              {section.groupTitle}
            </p>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            {section.title}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Section {currentIndex + 1} of {totalSections}
          </p>
        </div>

        {/* BLOCK CONTENT */}
        <div className="space-y-6">
          {section.blocks
            ?.sort((a, b) => a.order_index - b.order_index)
            .map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))}
        </div>

        {/* FOOTER NAVIGATION */}
        <div className="mt-16 flex items-center justify-between border-t border-zinc-200 pt-6">
          <button
            onClick={onPrevious}
            disabled={isFirst}
            className="
              rounded-xl border border-zinc-200
              bg-white
              px-5 py-2.5
              text-sm font-medium text-zinc-700
              transition
              hover:bg-zinc-50
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Previous
          </button>

          <button
            onClick={onNext}
            disabled={isLast}
            className="
              rounded-xl
              bg-zinc-900
              px-5 py-2.5
              text-sm font-medium text-white
              transition
              hover:opacity-90
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Next Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSectionViewer;
