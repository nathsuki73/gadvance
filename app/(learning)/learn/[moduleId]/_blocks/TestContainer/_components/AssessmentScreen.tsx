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
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{test.title}</h1>
        <p className="text-gray-500">{test.questions.length} Questions</p>
      </div>

      {test.questions.map((question, index) => (
        <div key={question.id} className="rounded-lg border p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">
            {index + 1}. {question.question}
          </h2>

          <div className="space-y-3">
            {question.choices.map((choice) => {
              const isSelected = answers[question.id] === choice.id;
              return (
                <label
                  key={choice.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "hover:border-gray-400"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={choice.id}
                    checked={isSelected}
                    onChange={() => onAnswer(question.id, choice.id)}
                  />
                  <span>{choice.text}</span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          className="rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition hover:bg-green-700"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
