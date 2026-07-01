import { Check, X } from "lucide-react";
import { QuizResult } from "../types";

interface QuizResultsProps {
  result: QuizResult;
}

export default function QuizResults({ result }: QuizResultsProps) {
  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center space-y-10 py-8 text-center">
      {/* Status Circle */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        <svg className="-rotate-90 h-44 w-44">
          <circle
            cx="88"
            cy="88"
            r="72"
            className="fill-none stroke-zinc-200"
            strokeWidth="10"
          />

          <circle
            cx="88"
            cy="88"
            r="72"
            className={
              result.passed
                ? "fill-none stroke-primary"
                : "fill-none stroke-red-500"
            }
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray="452"
            strokeDashoffset="452"
            style={{
              animation: "drawCircle 1s ease forwards",
            }}
          />
        </svg>

        <div className="absolute animate-[pop_0.35s_ease_0.9s_forwards] scale-0">
          {result.passed ? (
            <Check className="h-16 w-16 text-primary" strokeWidth={3} />
          ) : (
            <X className="h-16 w-16 text-red-500" strokeWidth={3} />
          )}
        </div>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <span className="block text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
          Assessment Complete
        </span>

        <h1 className="text-5xl font-light tracking-tight text-zinc-900">
          {result.passed ? "Congratulations!" : "Assessment Complete"}
        </h1>

        <p className="text-lg font-light text-zinc-500">
          {result.passed
            ? "You successfully passed this assessment."
            : "You did not reach the required passing score."}
        </p>
      </div>

      {/* Score */}
      <div className="w-full rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
          Your Score
        </p>

        <div className="mt-4 text-6xl font-light text-zinc-900">
          {result.score}
          <span className="text-3xl text-zinc-400"> / {result.total}</span>
        </div>

        <p className="mt-4 text-lg font-light text-zinc-500">
          {percentage}% Correct
        </p>
      </div>
    </div>
  );
}
