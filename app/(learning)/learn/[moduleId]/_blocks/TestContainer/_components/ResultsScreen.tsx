import { QuizResult } from "../types";

interface QuizResultsProps {
  result: QuizResult;
}

export default function QuizResults({ result }: QuizResultsProps) {
  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
        <span className="text-4xl">🎉</span>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Quiz Completed</h1>
        <p className="mt-2 text-gray-600">You have completed the assessment.</p>
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
  );
}
