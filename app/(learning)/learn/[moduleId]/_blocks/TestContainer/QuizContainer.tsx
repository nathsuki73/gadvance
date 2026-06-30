import { useState, useEffect } from "react";
import QuizLoader from "./_components/QuizLoader";
import QuizIntro from "./_components/IntroductionScreen";
import QuizActive from "./_components/AssessmentScreen";
import QuizResults from "./_components/ResultsScreen";
import { QuizResult, StaticTest, UserAnswers } from "./types";
import { fetchStaticTest } from "./service";

export type QuizState = "loading" | "ready" | "started" | "completed";

interface QuizContainerProps {
  moduleId: string;
}

export default function QuizContainer({ moduleId }: QuizContainerProps) {
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [test, setTest] = useState<StaticTest | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchQuizData = async () => {
      setQuizState("loading");
      setError(null);

      try {
        const data = await fetchStaticTest(moduleId, "pre_test");
        setTest(data);
        setQuizState("ready");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setQuizState("loading");
      }
    };

    if (moduleId) fetchQuizData();
  }, [moduleId]);

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
      </div>
    </div>
  );
}
