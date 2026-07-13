type Props = {
  current: number;
  total: number;
};

export function QuizProgressHeader({ current, total }: Props) {
  return (
    <header className="border-b border-zinc-200 pb-8">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
          Lesson Quiz
        </span>

        <span className="text-xs font-light text-zinc-500">
          {current + 1} / {total}
        </span>
      </div>

      <div className="mt-6 h-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>
    </header>
  );
}
