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
    <div className="mx-auto w-full max-w-3xl space-y-6 sm:space-y-10">
      <QuizProgressHeader current={currentQuestion} total={totalQuestions} />

      <div className="space-y-6 sm:space-y-8">
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-zinc-400">
            Question {currentQuestion + 1} of {totalQuestions}
          </p>

          <h2 className="text-xl sm:text-3xl font-light leading-snug sm:leading-tight tracking-tight text-zinc-900 break-words">
            {question.question}
          </h2>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {question.choices.map((choice) => {
            const isSelected = selected === choice.id;

            return (
              <button
                key={choice.id}
                disabled={submitted || isSaving}
                onClick={() => onSelect(choice.id)}
                className={`flex w-full items-start gap-3.5 sm:gap-5 rounded-xl sm:rounded-2xl border p-4 sm:p-6 text-left transition active:scale-[0.99] ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-zinc-200 hover:border-primary/40 hover:bg-zinc-50/80"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                    isSelected ? "border-primary bg-primary" : "border-zinc-300"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white" />
                  )}
                </div>

                <span className="text-sm sm:text-base font-light leading-relaxed text-zinc-700 break-words">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-200 pt-6 sm:pt-8">
          <span className="text-center sm:text-left text-xs sm:text-sm font-light text-zinc-500">
            Select one answer before continuing.
          </span>

          <button
            disabled={!selected || submitted || isSaving}
            onClick={onNext}
            className="w-full sm:w-auto rounded-lg bg-primary px-6 py-3.5 sm:py-3 text-[10px] font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-white transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
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