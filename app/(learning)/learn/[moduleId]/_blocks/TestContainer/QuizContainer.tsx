import { useState, useEffect } from "react";
import QuizLoader from "./_components/QuizLoader";
import QuizIntro from "./_components/IntroductionScreen";
import QuizActive from "./_components/AssessmentScreen";
import QuizResults from "./_components/ResultsScreen";
import { QuizResult, StaticTest, UserAnswers } from "./types";
import { fetchStaticTest } from "./service";
import QuizError from "./_components/QuizError";

export type QuizState = "loading" | "ready" | "started" | "completed" | "error";

interface QuizContainerProps {
  moduleId: string;
}

export default function QuizContainer({ moduleId }: QuizContainerProps) {
  useEffect(() => {
    console.log("QuizContainer MOUNTED", moduleId);
  }, []);
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [test, setTest] = useState<StaticTest | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (
      quizState === "started" ||
      quizState === "completed" ||
      quizState === "error" ||
      test !== null
    ) {
      return;
    }

    const cancelled = false;

    const fetchQuizData = async () => {
      setQuizState("loading");
      setError(null);

      try {
        const data = await fetchStaticTest(moduleId, "pre_test");
        if (cancelled) return;
        setTest(data);
        setQuizState("ready");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setQuizState("error");
      }
    };

    if (moduleId) fetchQuizData();
  }, [moduleId, quizState, test]);

  const handleStartQuiz = (): void => setQuizState("started");

  const handleAnswer = (questionId: string, choiceId: string): void => {
    setAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const handleSubmit = async (): Promise<void> => {
    setResult({
      score: 0,
      total: test?.questions.length ?? 0,
      passed: false,
    });
    setQuizState("completed");
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8 shadow-lg">
        {quizState === "loading" && <QuizLoader />}

        {quizState === "ready" && test && (
          <QuizIntro test={test} onStart={handleStartQuiz} />
        )}

        {quizState === "started" && test && (
          <QuizActive
            test={test}
            answers={answers}
            onAnswer={handleAnswer}
            onSubmit={handleSubmit}
          />
        )}

        {quizState === "completed" && result && <QuizResults result={result} />}

        {quizState === "error" && (
          <QuizError error={error} onRetry={() => setQuizState("loading")} />
        )}
      </div>
    </div>
  );
}
