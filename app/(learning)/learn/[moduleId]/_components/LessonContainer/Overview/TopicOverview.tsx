type Lesson = {
  title: string;
  description: string;
};

interface TopicOverviewProps {
  lesson: Lesson;
  active?: boolean;
  onContinue: () => void;
}

export default function TopicOverview({
  lesson,
  onContinue,
}: TopicOverviewProps) {
  const objectives =
    lesson.description
      ?.split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace("-", "").trim()) || [];

  return (
    <div
      className={`size-full overflow-hidden rounded-2xl border transition-all duration-300 border-indigo-400 shadow-md ring-1 ring-indigo-400/30"
      }`}
    >
      <div className="bg-indigo-50/70 px-6 py-4 border-b border-zinc-100 flex items-center justify-start text-left">
        <h3 className="font-semibold text-zinc-800 text-lg tracking-tight">
          {lesson.title}
        </h3>
      </div>

      {objectives.length > 0 && (
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
            Learning Objectives
          </p>

          <ul className="space-y-3 w-full max-w-md mx-auto flex flex-col items-center">
            {objectives.map((objective, index) => (
              <li
                key={index}
                className="flex items-center gap-3 text-sm font-medium text-zinc-600 bg-zinc-50/60 px-4 py-2 rounded-xl border border-zinc-100/80 w-full transition-colors hover:bg-zinc-50"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                <span className="text-left flex-1">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex justify-end w-full max-w-md mx-auto">
        <button
          onClick={onContinue}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary/90"
        >
          Start Lesson
        </button>
      </div>
    </div>
  );
}
