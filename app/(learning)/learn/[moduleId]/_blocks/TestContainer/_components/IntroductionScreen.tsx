import { StaticTest } from "../types";

// --- Introduction Screen ---
interface QuizIntroProps {
  test: StaticTest;
  onStart: () => void;
}

export default function QuizIntro({ test, onStart }: QuizIntroProps) {
  return (
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
          <li>Click Submit when you&apos;re finished.</li>
        </ul>
      </div>

      <button
        onClick={onStart}
        className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
      >
        Start Quiz
      </button>
    </div>
  );
}
