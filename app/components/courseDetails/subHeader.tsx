import { Clock3, Star, Users, ChevronDown, Plus } from "lucide-react";

type SubHeaderProps = {
  title?: string;
  pathLabel?: string;
  duration?: string;
  learners?: string;
  reviews?: string;
  description?: string;
};

export default function SubHeader({
  title = "Advanced Machine Learning Foundations",
  pathLabel = "Learning Path > Artificial Intelligence",
  duration = "10 hours",
  learners = "8,500 enrolled",
  reviews = "4.8/5",
  description = "Master the fundamental concepts and practical applications of advanced machine learning. This comprehensive course covers neural networks, deep learning architectures, and real-world implementation strategies. You'll gain hands-on experience with industry-standard tools and frameworks while building production-ready ML models.",
}: SubHeaderProps) {
  return (
    <section className="rounded-3xl border border-zinc-200 bg-[#F4F5F7] p-5 shadow-sm md:p-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.7fr_0.9fr] lg:items-start">
        <div>
          <p className="text-[11px] text-zinc-600 md:text-xs">{pathLabel}</p>

          <div className="mt-2 flex items-center gap-3 md:gap-4">
            <div
              className="flex h-18 w-18 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#9CB2D5] bg-[#E9EEF8] p-2 text-xs font-semibold uppercase tracking-wide text-[#4B648C] md:h-24 md:w-24 md:p-3"
              aria-label="Badge placeholder"
            >
              Badge
            </div>

            <h1 className="text-xl font-black tracking-tight text-[#0A2144] md:text-3xl">
              {title}
            </h1>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#31415C] md:text-sm">
            <span className="inline-flex items-center gap-2.5">
              <Clock3 className="h-3.5 w-3.5 text-zinc-500" />
              {duration}
            </span>
            <span className="inline-flex items-center gap-2.5">
              <Users className="h-3.5 w-3.5 text-zinc-500" />
              {learners}
            </span>
            <span className="inline-flex items-center gap-2.5 font-semibold text-[#13284A]">
              <Star className="h-3.5 w-3.5 fill-[#EAB308] text-[#EAB308]" />
              {reviews}
            </span>
          </div>

          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-[#253A5C] md:text-base">
            {description}
          </p>
        </div>

        <aside className="rounded-3xl border border-zinc-300 bg-[#F4F5F7] p-5 shadow-[0_2px_6px_rgba(15,23,42,0.06)] md:p-7">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#11B5AA] px-3 text-sm font-bold text-white transition hover:bg-[#0DA297] md:text-base"
          >
            <Plus className="h-3.5 w-3.5" />
            Enroll Now
          </button>

          <button
            type="button"
            className="mt-2.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 bg-transparent px-3 text-xs font-medium text-[#1E3252] transition hover:bg-zinc-50 md:text-sm"
          >
            More Actions
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </aside>
      </div>
    </section>
  );
}
