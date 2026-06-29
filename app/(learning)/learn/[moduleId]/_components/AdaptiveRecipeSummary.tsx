import React from "react";

export type AdaptiveRecipeSummaryProps = {
  adaptiveRecipe?: {
    target_bloom_tier?: string;
    predicted_learning_tags?: Array<{ label: string; confidence: number }>;
  } | null;
  hasAdaptiveRecipe: boolean;
};

export const AdaptiveRecipeSummary = ({
  adaptiveRecipe,
  hasAdaptiveRecipe,
}: AdaptiveRecipeSummaryProps) => {
  if (!hasAdaptiveRecipe) return null;

  return (
    <div className="mb-8 rounded-3xl border border-[#e9d5ff] bg-gradient-to-br from-[#faf5ff] via-white to-[#f5f3ff] p-5 shadow-sm animate-in fade-in zoom-in-95 duration-700">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8b5cf6]">
            Adaptive recipe received
          </p>
          <h2 className="mt-2 text-lg font-semibold text-zinc-900">
            Showing recommended lesson blocks in a staged reveal
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-500">
            The questionnaire result has been applied to this lesson. The
            recommended blocks will animate in sequence so the layout feels
            intentionally introduced instead of appearing all at once.
          </p>
        </div>

        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            Bloom Tier
          </p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">
            {adaptiveRecipe?.target_bloom_tier || "Adaptive"}
          </p>
        </div>
      </div>

      {adaptiveRecipe?.predicted_learning_tags?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {adaptiveRecipe.predicted_learning_tags.map((tag) => (
            <span
              key={tag.label}
              className="rounded-full border border-[#e9d5ff] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#7c3aed]"
            >
              {tag.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
};
