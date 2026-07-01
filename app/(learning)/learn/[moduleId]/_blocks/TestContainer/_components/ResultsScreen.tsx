import { Check, ChevronRight } from "lucide-react";
import { QuizResult } from "../types";

interface QuizResultsProps {
  result: QuizResult;
  onContinue: () => void;
  showPassFail: boolean;
}

export default function QuizResults({
  result,
  onContinue,
  showPassFail,
}: QuizResultsProps) {
  const percentage = Math.round((result.score / result.total) * 100);
  const passed = showPassFail && result.passed;
  const ringColor = !showPassFail
    ? "stroke-primary"
    : passed
      ? "stroke-primary"
      : "stroke-[#8b5cf6]";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="rotate-90 h-full w-full">
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="1"
            className="fill-none stroke-zinc-200"
          />
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="4"
            strokeLinecap="square"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            className={`fill-none animate-circle-progress ${ringColor}`}
            style={{ "--progress": 100 - percentage } as React.CSSProperties}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <Check
            className={`animate-[fade-in_.3s_ease_.8s_forwards] opacity-0 ${
              !showPassFail || passed ? "text-primary" : "text-[#8b5cf6]"
            }`}
            size={48}
            strokeWidth={1.5}
          />
        </div>
      </div>

      <span className="mt-10 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
        Assessment Complete
      </span>

      <p className="mt-3 text-zinc-500">
        You answered{" "}
        <span className="font-medium text-zinc-900">
          {result.score} of {result.total}
        </span>{" "}
        questions correctly.
      </p>

      <div className="mt-6 text-6xl font-extralight text-zinc-900">
        {percentage}
        <span className="text-3xl text-zinc-400">%</span>
      </div>

      {showPassFail && (
        <span
          className={`mt-4 text-xs font-semibold uppercase tracking-[0.2em] ${passed ? "text-primary" : "text-[#8b5cf6]"}`}
        >
          {passed ? "Passed" : "Not Passed"}
        </span>
      )}

      <button
        onClick={onContinue}
        className="mt-12 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all hover:bg-primary-hover active:scale-[0.98]"
      >
        Continue
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
