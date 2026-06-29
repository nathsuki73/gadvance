import React from "react";

export type ModuleSectionViewerHeaderProps = {
  currentIndex: number;
  totalSections: number;
  lesson: {
    title: string;
    description?: string | null;
  };
};

export const ModuleSectionViewerHeader = ({
  currentIndex,
  totalSections,
  lesson,
}: ModuleSectionViewerHeaderProps) => (
  <div className="mb-10 border-b border-zinc-100 pb-6">
    <p className="mb-1 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-primary">
      Part {(currentIndex + 1).toString().padStart(2, "0")} of{" "}
      {totalSections.toString().padStart(2, "0")}
    </p>
    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
      {lesson.title}
    </h1>
    {lesson.description ? (
      <p className="mt-2 text-sm font-light leading-relaxed text-zinc-400">
        {lesson.description}
      </p>
    ) : null}
  </div>
);
