"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Check, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import {
  startQuizAttemptAction,
  saveQuizAnswerAction,
  submitQuizAttemptAction,
} from "../actions";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  backendBlockId: string;
};

type QuizBlockMetadata = {
  title?: string;
  description?: string;
};

type QuizBlockProps = {
  content?: string | null;
  metadata?: QuizBlockMetadata;
  onQuestionCompleted?: (blockId: string) => void;
  lessonId?: string;
};

const QuizBlock = ({
  content,
  metadata,
  onQuestionCompleted,
  lessonId,
}: QuizBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | 1. DATA PARSING (ALWAYS RUNS FIRST)
  |--------------------------------------------------------------------------
  |*/
  const questions: QuizQuestion[] = useMemo(() => {
    try {
      if (!content) return [];
      const parsed = JSON.parse(content);
      return Array.isArray(parsed.questions) ? parsed.questions : [];
    } catch {
      return [];
    }
  }, [content]);

  /*
  |--------------------------------------------------------------------------
  | 2. ALL STATE HOOKS (UNCONDITIONAL ORDER)
  |--------------------------------------------------------------------------
  |*/
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  // Track backend score independently to survive clean cache reloads
  const [serverScore, setServerScore] = useState<number | null>(null);

  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Read item out of questions safely via active state index positions
  const currentQuestion = questions[currentQuestionIndex];

  // 🛡️ FALLBACK RESOLUTION TRACKER
  const resolvedLessonId = useMemo(() => {
    if (lessonId) return lessonId;
    return "";
  }, [lessonId]);

  /*
  |--------------------------------------------------------------------------
  | 3. ATTEMPT INITIALIZATION HYDRATOR
  |--------------------------------------------------------------------------
  |*/
  useEffect(() => {
    let isMounted = true;

    const initializeQuizSession = async () => {
      if (questions.length === 0 || !resolvedLessonId) {
        if (isMounted) setInitialLoading(false);
        return;
      }

      try {
        if (isMounted) setInitialLoading(true);
        const result = await startQuizAttemptAction(resolvedLessonId);

        if (!isMounted) return;

        if (result.success && result.attempt) {
          setActiveAttemptId(result.attempt.id);

          // CASE A: User has an active ongoing attempt in progress
          if (
            result.attempt.current_question_index > 0 &&
            !result.attempt.completed
          ) {
            setStarted(true);
            setCurrentQuestionIndex(result.attempt.current_question_index);

            const databaseAnswersMap: Record<number, string> = {};
            questions.forEach((q, idx) => {
              const savedAns = result.attempt.answers[q.backendBlockId];
              if (savedAns) {
                databaseAnswersMap[idx] = savedAns.selected_option;
                onQuestionCompleted?.(q.backendBlockId);
              }
            });
            setAnswers(databaseAnswersMap);
          }

          // 🎯 CASE B: User has completely finished this assessment
          if (result.attempt.completed) {
            const calculatedPercentage = Math.round(result.attempt.score);

            // Calculate actual absolute points scored from percent baseline
            const completedAbsoluteScore = Math.round(
              (calculatedPercentage / 100) * questions.length,
            );
            setServerScore(completedAbsoluteScore);

            setAnimatedScore(calculatedPercentage);
            setStarted(true);
            setSubmitted(true);

            // Mark all individual question blocks complete in the sidebar on reload
            questions.forEach((q) => {
              onQuestionCompleted?.(q.backendBlockId);
            });
          }
        }
      } catch (err) {
        console.error("Hydration State Failure Engine:", err);
      } finally {
        if (isMounted) setInitialLoading(false);
      }
    };

    initializeQuizSession();

    return () => {
      isMounted = false;
    };
  }, [questions, resolvedLessonId]);

  /*
  |--------------------------------------------------------------------------
  | 4. SCORE TICKER RUNTIME AGGREGATORS
  |--------------------------------------------------------------------------
  |*/
  const runtimeScore = questions.reduce((total, question, index) => {
    return answers[index] === question.correctAnswer ? total + 1 : total;
  }, 0);

  // Fallback cleanly to verified server points if local state is unhydrated
  const displayScore = serverScore !== null ? serverScore : runtimeScore;

  const percentage =
    questions.length > 0
      ? Math.round((displayScore / questions.length) * 100)
      : 0;

  useEffect(() => {
    if (submitted && animatedScore === 0 && percentage > 0) {
      setAnimatedScore(percentage);
    }
  }, [submitted, percentage, animatedScore]);

  /*
  |--------------------------------------------------------------------------
  | CORE MUTATION HANDLERS
  |--------------------------------------------------------------------------
  |*/
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !activeAttemptId || isSyncing || !currentQuestion)
      return;

    try {
      setIsSyncing(true);
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      const nextIndex = currentQuestionIndex + 1;

      const syncResult = await saveQuizAnswerAction(activeAttemptId, {
        quiz_block_id: currentQuestion.backendBlockId,
        selected_option: selectedAnswer,
        is_correct: isCorrect,
        next_index: nextIndex,
      });

      if (!syncResult.success) throw new Error("Sync anomaly");

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedAnswer,
      }));
      setSelectedAnswer("");
      onQuestionCompleted?.(currentQuestion.backendBlockId);

      if (currentQuestionIndex === questions.length - 1) {
        const evaluation = await submitQuizAttemptAction(activeAttemptId);
        if (evaluation.success) {
          setSubmitted(true);
        }
        return;
      }

      setCurrentQuestionIndex(nextIndex);
    } catch (err) {
      console.error("Mutation Sync Error:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRetake = async () => {
    setStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setAnswers({});
    setSubmitted(false);
    setAnimatedScore(0);
    setServerScore(null);
    setActiveAttemptId(null);

    if (resolvedLessonId) {
      setInitialLoading(true);
      const result = await startQuizAttemptAction(resolvedLessonId);
      if (result.success && result.attempt) {
        setActiveAttemptId(result.attempt.id);
      }
      setInitialLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | 5. UI CONDITIONALS AND RENDERS
  |--------------------------------------------------------------------------
  |*/
  if (initialLoading) {
    return (
      <div className="flex py-20 items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#00aeef]" />
        <span className="ml-3 text-sm text-zinc-400 font-light">
          restoring test data...
        </span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-zinc-100 bg-white p-12 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-300">
          no assessments available
        </p>
      </div>
    );
  }

  // STATE A: EVALUATION INTERFACE CARD
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-16 px-4 text-center animate-fade-in">
        <div className="relative inline-flex items-center justify-center mb-10">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="#f4f4f5"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="#00aeef"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * animatedScore) / 100}
              className="transition-all duration-100 ease-out"
            />
          </svg>
          <span className="absolute text-2xl font-semibold tracking-tight text-zinc-900">
            {animatedScore}%
          </span>
        </div>
        <h2 className="text-3xl font-light tracking-tight text-zinc-900">
          Assessment{" "}
          <span className="italic font-serif text-[#00aeef]">completed.</span>
        </h2>
        <p className="mt-4 text-zinc-500 font-light">
          You correctly answered {displayScore} out of {questions.length}{" "}
          questions.
        </p>
        <div className="mt-12 flex justify-center">
          <button
            onClick={handleRetake}
            className="group flex items-center gap-3 rounded-full border border-zinc-100 bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-all hover:text-zinc-900 hover:border-zinc-300 active:scale-[0.98]"
          >
            <RotateCcw size={14} strokeWidth={2} /> retake quiz
          </button>
        </div>
      </div>
    );
  }

  // STATE B: INTRO WELCOME CARD
  if (!started) {
    return (
      <div className="mx-auto max-w-3xl py-12 px-4 animate-fade-in">
        <div className="flex flex-col items-center text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-6">
            knowledge validation
          </div>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-zinc-900 leading-tight">
            {metadata?.title ?? "Quiz"}
          </h2>
          <p className="mt-6 text-lg text-zinc-500 font-light leading-relaxed max-w-xl">
            {metadata?.description ??
              "Check your understanding before completing this lesson."}
          </p>
          <div className="mt-12 w-full max-w-xs border-y border-zinc-100 py-6 flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            <span>total questions</span>
            <span className="font-mono text-base text-zinc-900 font-medium">
              {questions.length.toString().padStart(2, "0")}
            </span>
          </div>
          <button
            onClick={() => setStarted(true)}
            className="group mt-12 flex items-center gap-4 rounded-full bg-[#00aeef] px-10 py-5 text-white transition-all hover:bg-[#0096ce] hover:shadow-lg hover:shadow-sky-100/50"
          >
            <span className="text-xs uppercase tracking-widest font-bold">
              begin quiz
            </span>
            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    );
  }

  // STATE C: ACTIVE LESSON QUIZ QUESTIONS CARDS
  return (
    <div className="mx-auto max-w-3xl py-12 px-4 animate-fade-in">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-100">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#00aeef]">
          objective {(currentQuestionIndex + 1).toString().padStart(2, "0")} /{" "}
          {questions.length.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="mt-10">
        <h3 className="text-2xl font-light tracking-tight text-zinc-900 leading-snug lowercase">
          {currentQuestion?.question}
        </h3>
      </div>
      <div className="mt-12 flex flex-col gap-3">
        {currentQuestion?.options.map((option) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={option}
              onClick={() => setSelectedAnswer(option)}
              disabled={isSyncing}
              className={`group flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all duration-300 disabled:opacity-50
                ${isSelected ? "border-[#00aeef] bg-sky-50/20 text-zinc-900" : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"}
              `}
            >
              <span className="text-sm font-light lowercase">{option}</span>
              <div
                className={`h-4 w-4 rounded-full border flex items-center justify-center transition-all duration-300 ${isSelected ? "border-[#00aeef] bg-[#00aeef]" : "border-zinc-200 bg-transparent group-hover:border-zinc-400"}`}
              >
                {isSelected && (
                  <Check size={10} className="text-white" strokeWidth={3} />
                )}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-12 pt-6 border-t border-zinc-100 flex justify-end">
        <button
          onClick={handleSubmitAnswer}
          disabled={!selectedAnswer || isSyncing}
          className="group flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-20"
        >
          <span className="lowercase font-medium">
            {isSyncing
              ? "saving..."
              : currentQuestionIndex === questions.length - 1
                ? "evaluate answers"
                : "next objective"}
          </span>
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  );
};

export default QuizBlock;
