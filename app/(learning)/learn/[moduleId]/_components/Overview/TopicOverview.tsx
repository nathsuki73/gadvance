type Lesson = {
  id: number;
  lesson_order: number;
  title: string;
  description: string;
};

interface TopicOverviewProps {
  lesson: Lesson;
  active?: boolean;
}

export default function TopicOverview({
  lesson,
  active = false,
}: TopicOverviewProps) {
  const objectives =
    lesson.description
      .split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace("-", "").trim()) || [];

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        active
          ? "border-primary bg-primary/5"
          : "border-zinc-200 bg-white hover:border-primary/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Lesson {lesson.lesson_order}
          </span>

          <h2 className="mt-3 text-xl font-bold text-zinc-900">
            {lesson.title}
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
          {lesson.lesson_order}
        </div>
      </div>

      {objectives.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Learning Objectives
          </p>

          <ul className="space-y-2">
            {objectives.map((objective, index) => (
              <li key={index} className="flex gap-2 text-sm text-zinc-700">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
