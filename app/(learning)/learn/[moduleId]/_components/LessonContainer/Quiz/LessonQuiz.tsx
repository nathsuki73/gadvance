"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, PlayCircle } from "lucide-react";
import { fetchLessonQuiz } from "./service";
import { Quiz } from "./types";

type Props = {
  lessonBlockId: string;
};

type QuizState = "loading" | "ready" | "started" | "completed" | "error";

export default function LessonQuiz({ lessonBlockId }: Props) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("loading");

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadQuiz() {
      setQuizState("loading");
      setError(null);

      try {
        const data = await fetchLessonQuiz(lessonBlockId);

        if (cancelled) return;

        setQuiz(data);

        if (data.questions.length === 0) {
          setError("No quiz found.");
          setQuizState("error");
          return;
        }

        setQuizState("ready");
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Failed to load quiz.");
        setQuizState("error");
      }
    }

    loadQuiz();

    return () => {
      cancelled = true;
    };
  }, [lessonBlockId]);

  const score = useMemo(() => {
    if (!quiz) return 0;

    return quiz.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
  }, [answers, quiz]);

  if (quizState === "loading") {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (quizState === "error") {
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

  if (!quiz) return null;

  if (quizState === "ready") {
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
            Answer the following questions to reinforce what you&rsquo;ve
            learned in this lesson.
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
              onClick={() => setQuizState("started")}
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

  if (quizState === "completed") {
    const percentage = Math.round((score / quiz.questions.length) * 100);

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
            {score} of {quiz.questions.length}
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

  const question = quiz.questions[currentQuestion];
  const selected = answers[question.id];

  const handleNext = () => {
    if (!selected) return;

    setSubmitted(true);

    setTimeout(() => {
      if (currentQuestion === quiz.questions.length - 1) {
        setQuizState("completed");
      } else {
        setCurrentQuestion((prev) => prev + 1);
        setSubmitted(false);
      }
    }, 500);
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-zinc-200 pb-8">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
            Lesson Quiz
          </span>

          <span className="text-xs font-light text-zinc-500">
            {currentQuestion + 1} / {quiz.questions.length}
          </span>
        </div>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${
                ((currentQuestion + 1) / quiz.questions.length) * 100
              }%`,
            }}
          />
        </div>
      </header>

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
                disabled={submitted}
                onClick={() =>
                  setAnswers((prev) => ({
                    ...prev,
                    [question.id]: choice.id,
                  }))
                }
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
            onClick={handleNext}
            className="rounded-lg bg-primary px-6 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {currentQuestion === quiz.questions.length - 1
              ? "Finish Quiz"
              : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
