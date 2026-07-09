import { AlertCircle } from "lucide-react";

type Props = {
  error: string | null;
};

export function QuizErrorState({ error }: Props) {
  return (
    <div className="mx-auto max-w-lg py-20 text-center">
      <AlertCircle
        className="mx-auto text-red-500"
        size={48}
        strokeWidth={1.5}
      />

      <h2 className="mt-6 text-2xl font-light">Unable to load quiz</h2>

      <p className="mt-3 text-zinc-500">{error ?? "Something went wrong."}</p>

      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-lg bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-primary-hover"
      >
        Retry
      </button>
    </div>
  );
}
