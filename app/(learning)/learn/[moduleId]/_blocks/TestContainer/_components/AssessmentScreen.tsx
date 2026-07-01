import { useState } from "react";
import { StaticTest, UserAnswers } from "../types";

interface QuizActiveProps {
  test: StaticTest;
  answers: UserAnswers;
  onAnswer: (qId: string, cId: string) => void;
  onSubmit: () => void;
}

export default function QuizActive({
  test,
  answers,
  onAnswer,
  onSubmit,
}: QuizActiveProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const question = test.questions[currentQuestion];
  const selected = answers[question.id];

  const handleSubmitAnswer = () => {
    if (!selected) return;

    setSubmitted(true);

    setTimeout(() => {
      if (currentQuestion === test.questions.length - 1) {
        onSubmit();
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setSubmitted(false);
      }
    }, 700);
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header */}
      <header className="border-b border-zinc-200 pb-6 sm:pb-8">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Assessment
          </span>

          <span className="shrink-0 text-xs font-light text-zinc-500">
            {currentQuestion + 1} / {test.questions.length}
          </span>
        </div>

        <div className="mt-5 sm:mt-6 h-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${((currentQuestion + 1) / test.questions.length) * 100}%`,
            }}
          />
        </div>
      </header>

      {/* Question */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          <p className="mb-2 sm:mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">
            Question {currentQuestion + 1}
          </p>

          <h2 className="max-w-3xl text-2xl font-light leading-tight tracking-tight text-zinc-900 sm:text-3xl">
            {question.question}
          </h2>
        </div>

        {/* Answers */}
        <div className="space-y-3 sm:space-y-4">
          {question.choices.map((choice) => {
            const isSelected = selected === choice.id;

            return (
              <button
                key={choice.id}
                disabled={submitted}
                onClick={() => onAnswer(question.id, choice.id)}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:gap-5 sm:p-6 ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-zinc-200 hover:border-primary/40 hover:bg-zinc-50"
                } ${
                  submitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                }`}
              >
                <div
                  className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:h-6 sm:w-6 ${
                    isSelected ? "border-primary bg-primary" : "border-zinc-300"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white sm:h-2.5 sm:w-2.5" />
                  )}
                </div>

                <span className="text-sm font-light leading-relaxed text-zinc-700 sm:text-base">
                  {choice.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          <span className="text-center text-sm font-light text-zinc-500 sm:text-left">
            Select one answer before continuing.
          </span>

          <button
            disabled={!selected || submitted}
            onClick={handleSubmitAnswer}
            className="w-full rounded-lg bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {currentQuestion === test.questions.length - 1
              ? "Finish Assessment"
              : "Submit Answer"}
          </button>
        </div>
      </div>
    </div>
  );
}
