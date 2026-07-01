import { Check, X } from "lucide-react";
import { QuizResult } from "../types";

interface QuizResultsProps {
  result: QuizResult;
}

export default function QuizResults({ result }: QuizResultsProps) {
  const percentage = Math.round((result.score / result.total) * 100);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="rotate-90 h-full w-full">
          {/* Background track */}
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="1"
            className="fill-none stroke-zinc-200"
          />

          {/* Animated progress */}
          <circle
            cx="60"
            cy="60"
            r="52"
            strokeWidth="4"
            strokeLinecap="square"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset="100"
            className={`fill-none animate-circle-progress ${
              result.passed ? "stroke-primary" : "stroke-[#8b5cf6]"
            }`}
            style={
              {
                "--progress": 100 - percentage,
              } as React.CSSProperties
            }
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {result.passed ? (
            <Check
              className="animate-[fade-in_.3s_ease_.8s_forwards] opacity-0 text-primary"
              size={48}
              strokeWidth={1.5}
            />
          ) : (
            <X
              className="animate-[fade-in_.3s_ease_.8s_forwards] opacity-0"
              size={48}
              strokeWidth={2.5}
            />
          )}
        </div>
      </div>

      <span className="mt-10 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
        Assessment Complete
      </span>

      <h1 className="mt-4 text-4xl font-light tracking-tight text-zinc-900">
        {result.passed ? "Passed" : "Not Passed"}
      </h1>

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
    </div>
  );
}
