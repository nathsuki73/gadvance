import { useState } from "react";

type QuizState = "loading" | "ready" | "started" | "completed";

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id: string;
  question: string;
  choices: Choice[];
}

interface StaticTest {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
}

type UserAnswers = Record<string, string>;

export default function QuizContainer() {
  const [quizState, setQuizState] = useState<QuizState>("loading");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [test, setTest] = useState<StaticTest | null>(null);
  const [answers, setAnswers] = useState<UserAnswers>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  /**
   * Fetch GAD Course ID
   */
  const getCourseId = async (): Promise<void> => {
    // TODO: API call
    // Example
    // const id = await api.getCourseId();
    // setCourseId(id);
  };

  /**
   * Fetch Static Test
   */
  const getStaticTest = async (courseId: string): Promise<void> => {
    // TODO: API call
    // Example
    // const staticTest = await api.getStaticTest(courseId);
    // setTest(staticTest);
    // setQuizState("ready");
  };

  /**
   * Start Quiz
   */
  const handleStartQuiz = (): void => {
    setQuizState("started");
  };

  /**
   * Save User Answer
   */
  const handleAnswer = (
    questionId: Question["id"],
    choiceId: Choice["id"],
  ): void => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }));
  };

  /**
   * Submit Quiz
   */
  const handleSubmit = async (): Promise<void> => {
    // TODO:
    // Calculate score or call backend

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
        {quizState === "loading" && (
          <div className="flex h-64 items-center justify-center">
            <p className="text-lg text-gray-500">Loading quiz...</p>
          </div>
        )}

        {quizState === "ready" && test && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>

              <p className="mt-2 text-gray-600">{test.description}</p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="font-semibold text-blue-900">Before you begin</h2>

              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-800">
                <li>Read each question carefully.</li>
                <li>Select only one answer per question.</li>
                <li>Click Submit when you're finished.</li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
            >
              Start Quiz
            </button>
          </div>
        )}

        {quizState === "started" && test && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold">{test.title}</h1>
              <p className="text-gray-500">{test.questions.length} Questions</p>
            </div>

            {test.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-lg border p-6 shadow-sm"
              >
                <h2 className="mb-4 text-lg font-semibold">
                  {index + 1}. {question.question}
                </h2>

                <div className="space-y-3">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                        answers[question.id] === choice.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={choice.id}
                        checked={answers[question.id] === choice.id}
                        onChange={() => handleAnswer(question.id, choice.id)}
                      />

                      <span>{choice.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        )}

        {quizState === "completed" && result && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl">🎉</span>
            </div>

            <div>
              <h1 className="text-3xl font-bold">Quiz Completed</h1>

              <p className="mt-2 text-gray-600">
                You have completed the assessment.
              </p>
            </div>

            <div className="rounded-lg border bg-gray-50 p-6">
              <p className="text-lg text-gray-600">Your Score</p>

              <h2 className="mt-2 text-5xl font-bold text-blue-600">
                {result.score} / {result.total}
              </h2>

              <p
                className={`mt-4 text-lg font-semibold ${
                  result.passed ? "text-green-600" : "text-red-600"
                }`}
              >
                {result.passed ? "Passed ✅" : "Failed ❌"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
