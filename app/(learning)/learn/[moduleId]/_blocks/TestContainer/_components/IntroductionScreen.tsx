import { PlayCircle } from "lucide-react";
import { StaticTest } from "../types";

// --- Introduction Screen ---
interface QuizIntroProps {
  test: StaticTest;
  onStart: () => void;
}

export default function QuizIntro({ test, onStart }: QuizIntroProps) {
  return (
    <div className=" space-y-10">
      {/* Header */}
      <header className="border-b border-zinc-200 pb-8">
        <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
          assessment
        </span>

        <h1 className="text-4xl font-light tracking-tight text-zinc-900 sm:text-5xl">
          {test.title}
        </h1>

        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-zinc-500">
          {test.description}
        </p>
      </header>

      {/* Information Card */}
      <section className="rounded-3xl border border-zinc-200 bg-zinc-50/30 p-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
          Before you begin
        </h2>

        <ul className="mt-6 space-y-4 text-sm font-light leading-relaxed text-zinc-500">
          <li className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>
              Read each question carefully before selecting an answer.
            </span>
          </li>

          <li className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Only one answer may be selected for each question.</span>
          </li>

          <li className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
            <span>Review your responses before submitting the assessment.</span>
          </li>
        </ul>

        <div className="mt-10 border-t border-zinc-200 pt-6">
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all hover:bg-primary-hover active:scale-[0.98]"
          >
            <PlayCircle size={14} />
            Start Assessment
          </button>
        </div>
      </section>
    </div>
  );
}
