import { PlayCircle } from "lucide-react";

type Props = {
  onStart: () => void;
};

export function QuizIntroState({ onStart }: Props) {
  return (
    <div className="space-y-10">
      <header className="border-b border-zinc-200 pb-8">
        <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
          Lesson Quiz
        </span>

        <h1 className="text-4xl font-light tracking-tight text-zinc-900">
          Check Your Understanding
        </h1>

        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-zinc-500">
          Answer the following questions to reinforce what you&rsquo;ve learned
          in this lesson.
        </p>
      </header>

      <section className="rounded-3xl border border-zinc-200 bg-zinc-50/40 p-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
          Before you begin
        </h2>

        <ul className="mt-6 space-y-4 text-sm font-light leading-relaxed text-zinc-500">
          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            Read every question carefully.
          </li>

          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            Only one answer can be selected.
          </li>

          <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            Your score will appear after completing the quiz.
          </li>
        </ul>

        <div className="mt-10 border-t border-zinc-200 pt-6">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:bg-primary-hover"
          >
            <PlayCircle size={14} />
            Start Quiz
          </button>
        </div>
      </section>
    </div>
  );
}
