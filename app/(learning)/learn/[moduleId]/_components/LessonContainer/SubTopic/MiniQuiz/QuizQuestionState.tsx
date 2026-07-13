import { Question } from "../../Quiz/types";
import { QuizProgressHeader } from "./QuizProgressHeader";

type Props = {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selected: string | undefined;
  submitted: boolean;
  isSaving: boolean;
  onSelect: (choiceId: string) => void;
  onNext: () => void;
};

export function QuizQuestionState({
  question,
  currentQuestion,
  totalQuestions,
  selected,
  submitted,
  isSaving,
  onSelect,
  onNext,
}: Props) {
  return (
    <div className="space-y-10">
      <QuizProgressHeader current={currentQuestion} total={totalQuestions} />

      <div className="space-y-8">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Question {currentQuestion + 1}
          </p>

          <h2 className="text-3xl font-light leading-tight tracking-tight text-zinc-900">
            {question.question}
          </h2>
        </div>

        <div className="space-y-4">
          {question.choices.map((choice) => {
            const isSelected = selected === choice.id;

            return (
              <button
                key={choice.id}
                disabled={submitted || isSaving}
                onClick={() => onSelect(choice.id)}
                className={`flex w-full items-start gap-5 rounded-2xl border p-6 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-zinc-200 hover:border-primary/40 hover:bg-zinc-50"
                }`}
              >
                <div
                  className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected ? "border-primary bg-primary" : "border-zinc-300"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2.5 w-2.5 rounded-full bg-white" />
                  )}
                </div>

                <span className="font-light leading-relaxed text-zinc-700">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-200 pt-8">
          <span className="text-sm font-light text-zinc-500">
            Select one answer before continuing.
          </span>

          <button
            disabled={!selected || submitted}
            onClick={onNext}
            className="rounded-lg bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentQuestion === totalQuestions - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
