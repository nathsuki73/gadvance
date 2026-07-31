import { Question } from "../types";

interface ActiveQuestionProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  selectedChoiceId: string | undefined;
  isSubmitted: boolean;
  isSaving: boolean;
  onSelectChoice: (questionId: string, choiceId: string) => void;
  onNext: () => void;
}

export function QuizActiveQuestion({
  question,
  currentIndex,
  totalQuestions,
  selectedChoiceId,
  isSubmitted,
  isSaving,
  onSelectChoice,
  onNext,
}: ActiveQuestionProps) {
  const progressPercentage = ((currentIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="w-full space-y-10">
      <header className="border-b border-zinc-200 pb-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Lesson Quiz
          </span>
          <span className="text-xs font-light text-zinc-500">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div className="mt-6 h-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </header>

      <div className="space-y-8">
        <div>
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Question {currentIndex + 1}
          </p>
          <h2 className="text-2xl sm:text-3xl font-light leading-tight tracking-tight text-zinc-900">
            {question.question}
          </h2>
        </div>

        <div className="space-y-4">
          {question.choices.map((choice) => {
            const isSelected = selectedChoiceId === choice.id;
            return (
              <button
                key={choice.id}
                disabled={isSubmitted || isSaving}
                onClick={() => onSelectChoice(question.id, choice.id)}
                className={`flex w-full items-start gap-4 sm:gap-5 rounded-2xl border p-5 sm:p-6 text-left transition ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-zinc-200 hover:border-primary/40 hover:bg-zinc-50"
                } ${isSubmitted || isSaving ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
              >
                <div
                  className={`mt-1 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? "border-primary bg-primary" : "border-zinc-300"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-white" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-light leading-relaxed text-zinc-700">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-zinc-200 pt-8">
          <span className="text-center sm:text-left text-sm font-light text-zinc-500">
            {isSaving
              ? "Saving response..."
              : "Select one answer before continuing."}
          </span>
          <button
            disabled={!selectedChoiceId || isSubmitted || isSaving}
            onClick={onNext}
            className="w-full sm:w-auto rounded-lg bg-primary px-6 py-3.5 sm:py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving
              ? "Saving..."
              : isLastQuestion
                ? "Finish Quiz"
                : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}