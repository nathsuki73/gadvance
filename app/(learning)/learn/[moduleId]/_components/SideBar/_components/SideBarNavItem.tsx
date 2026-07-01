type Props = {
  index: number;
  label: string;
  sublabel: string;
  dotColor: string;
  dotColorInactive: string;
  active: boolean;
  locked?: boolean;
  collapsed: boolean;
  trailing?: string;
  onClick: () => void;
};

export default function SideBarNavItem({
  index,
  label,
  sublabel,
  dotColor,
  dotColorInactive,
  active,
  locked = false,
  collapsed,
  trailing,
  onClick,
}: Props) {
  const dot = locked ? "bg-zinc-300" : active ? dotColor : dotColorInactive;

  if (collapsed) {
    return (
      <button
        disabled={locked}
        onClick={onClick}
        title={label}
        className={`relative mx-auto hidden h-11 w-11 items-center justify-center rounded-xl transition-colors lg:flex ${
          locked
            ? "cursor-not-allowed opacity-40"
            : active
              ? "bg-purple-50"
              : "hover:bg-zinc-200/50"
        }`}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      </button>
    );
  }

  return (
    <button
      disabled={locked}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-left transition-colors ${
        locked
          ? "cursor-not-allowed bg-zinc-100/30 text-zinc-400"
          : active
            ? "border-purple-100/50 bg-purple-50/70 text-[#8b5cf6]"
            : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"
      }`}
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span
        className={`shrink-0 pt-0.5 font-mono text-[10px] font-bold ${active ? "text-primary" : "text-zinc-300"}`}
      >
        {index.toString().padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 space-y-0.5">
        <p
          className={`truncate text-xs font-medium leading-tight ${active ? "font-semibold text-zinc-900" : locked ? "text-zinc-400" : "text-zinc-700"}`}
        >
          {label}
        </p>
        <p
          className={`text-[11px] font-light lowercase ${active ? "text-primary/80" : "text-zinc-400"}`}
        >
          {locked ? "locked" : sublabel}
        </p>
      </span>
      {trailing && (
        <span className="shrink-0 text-xs text-zinc-400">{trailing}</span>
      )}
    </button>
  );
}
