import { ModuleStructureItem } from "../../../service";

interface TopicOverviewProps {
  overview?: ModuleStructureItem;
  onContinue: () => void;
}

export default function TopicOverview({ overview }: TopicOverviewProps) {
  if (!overview) {
    return (
      <div className="p-8 text-zinc-500">Lesson data could not be found.</div>
    );
  }

  const formattedLesson = {
    title: overview.title,
    description: overview.description ?? "",
  };

  const objectives =
    formattedLesson.description
      ?.split("\n")
      .filter((line) => line.trim().startsWith("-"))
      .map((line) => line.replace("-", "").trim()) || [];

  return (
    <div className="size-full overflow-hidden transition-all duration-300">
      <div className="bg-indigo-50/70 px-12 sm:px-23 py-4 border-b border-zinc-100 flex items-center justify-start text-left">
        <h3 className="font-semibold text-zinc-800 text-5xl tracking-tight">
          {formattedLesson.title}
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
                className="w-full flex items-center gap-3 text-sm text-zinc-600 font-medium"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
                <span className="text-left flex-1">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
