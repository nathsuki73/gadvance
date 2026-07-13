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
      <div className="flex h-40 w-40 items-center justify-center rounded-full border border-zinc-200">
        <Check size={52} strokeWidth={1.5} className="text-primary" />
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
