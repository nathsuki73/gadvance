import React from "react";
import { ArrowDown, CheckCircle, Lock } from "lucide-react";

export type ModuleSectionViewerFooterProps = {
  isLast: boolean;
  isNextStageAccessible: boolean;
  isAssessmentMode: boolean;
  onNext: () => void;
};

export const ModuleSectionViewerFooter = ({
  isLast,
  isNextStageAccessible,
  isAssessmentMode,
  onNext,
}: ModuleSectionViewerFooterProps) => (
  <div className="mx-auto mt-20 w-full max-w-4xl shrink-0 border-t border-zinc-100 pt-8">
    <div className="flex justify-center">
      {!isLast ? (
        isNextStageAccessible ? (
          <button
            type="button"
            onClick={onNext}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-primary px-12 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-100 active:scale-[0.98] sm:w-auto"
          >
            <span>{isAssessmentMode ? "proceed" : "continue"}</span>
            <ArrowDown
              size={14}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </button>
        ) : (
          <div className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-zinc-200/60 bg-zinc-50 px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 select-none sm:w-auto">
            <Lock size={12} className="text-zinc-300" strokeWidth={2.5} />
            complete current material to unlock next section
          </div>
        )
      ) : (
        <div className="inline-flex items-center gap-2.5 rounded-full border border-emerald-100/60 bg-emerald-50 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
          <CheckCircle
            size={12}
            className="text-emerald-500"
            strokeWidth={2.5}
          />
          final curriculum milestone completed
        </div>
      )}
    </div>
  </div>
);
