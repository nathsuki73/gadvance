import { Check } from "lucide-react";

export function QuizCompleted({
  score,
  totalQuestions,
}: {
  score: number;
  totalQuestions: number;
}) {
  const percentage =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 120 120" className="h-full w-full rotate-90">
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
            className="fill-none stroke-primary animate-circle-progress"
            style={{ "--progress": 100 - percentage } as React.CSSProperties}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <Check
            className="animate-[fade-in_.3s_ease_.8s_forwards] opacity-0 text-primary"
            size={48}
            strokeWidth={1.5}
          />
        </div>
      </div>

      <span className="mt-10 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
        Quiz Complete
      </span>

      <p className="mt-4 text-zinc-500">
        You answered{" "}
        <span className="font-medium text-zinc-900">
          {score} of {totalQuestions}
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
