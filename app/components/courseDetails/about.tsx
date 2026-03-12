import { Check, Circle } from "lucide-react";

const phases = [
  { label: "Phase 1", subtitle: "Basics", state: "completed" },
  { label: "Phase 2", subtitle: "Modules", state: "active" },
  { label: "Phase 3", subtitle: "Certification", state: "upcoming" },
] as const;

export default function AboutLearningPlan() {
  return (
    <section className="mt-7 rounded-3xl border border-zinc-200 bg-[#F4F5F7] p-4 md:p-5">
      <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6 md:gap-8">
        <div
          className="pointer-events-none absolute top-4.5 hidden border-t-2 border-zinc-300 sm:block"
          style={{ left: "16.6667%", right: "16.6667%" }}
          aria-hidden="true"
        />
        {phases.map((phase) => {
          const isCompleted = phase.state === "completed";
          const isActive = phase.state === "active";

          return (
            <article key={phase.label} className="relative z-10 flex items-start gap-2.5 sm:flex-col sm:items-center sm:gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  isCompleted || isActive
                    ? "border-[#11B5AA] bg-[#11B5AA] text-white"
                    : "border-zinc-300 bg-[#F4F5F7] text-zinc-400"
                }`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <Circle className="h-3.5 w-3.5" fill="currentColor" strokeWidth={1.8} />
                )}
              </div>

              <div className="sm:text-center">
                <h3 className="text-sm font-bold tracking-tight text-[#0A2144] md:text-base">
                  {phase.label}
                </h3>
                <p className="mt-0.5 text-[11px] text-[#304360] md:text-xs">{phase.subtitle}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
