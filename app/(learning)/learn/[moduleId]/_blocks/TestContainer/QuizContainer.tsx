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
    if (!test) return;

    const score = test.questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    const total = test.questions.length;

    // Change the passing percentage if needed
    const passingPercentage = 0.75;
    const passed = score >= Math.ceil(total * passingPercentage);

    setResult({
      score,
      total,
      passed,
    });

    setQuizState("completed");
  };

  return (
    <div className="h-full ">
      <div className="h-full bg-white p-8 items-center justify-center">
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

        {quizState === "completed" && result && (
          <div className="flex h-full items-center justify-center">
            <QuizResults result={result} />
          </div>
        )}

        {quizState === "error" && (
          <QuizError error={error} onRetry={() => setQuizState("loading")} />
        )}
      </div>
    </div>
  );
}
