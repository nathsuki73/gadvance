type Lesson = {
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
      {lesson.title}
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
