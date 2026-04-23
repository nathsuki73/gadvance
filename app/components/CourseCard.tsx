import React from "react";
import { BookOpen, Clock, Users } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  duration: string;
  enrolled: string;
  color: string;
  tag: string;
}

const CourseCard = ({
  title,
  description,
  progress,
  duration,
  enrolled,
  color,
  tag,
}: CourseCardProps) => {
  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-[0_1px_0_rgba(17,24,39,0.02)] transition-all hover:shadow-md">
      <div className="relative flex h-34 w-full items-center justify-center bg-zinc-50 md:h-36">
        <span
          className="absolute right-4 top-4 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em]"
          style={{
            color: color,
            borderColor: color,
            backgroundColor: `${color}10`,
          }}
        >
          {tag}
        </span>
        <BookOpen className="h-12 w-12 text-zinc-300" strokeWidth={1.8} />
      </div>

      <div className="flex flex-col p-6">
        <h3 className="mb-3 text-[2rem] font-black leading-[1.05] tracking-tight text-zinc-900 md:text-[2.05rem]">
          {title}
        </h3>
        <p className="mb-5 line-clamp-2 text-base leading-relaxed text-zinc-500">
          {description}
        </p>

        <div className="mb-6 flex items-center gap-4 text-sm font-medium text-zinc-400">
          <div className="flex items-center gap-1">
            <Clock size={14} /> {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} /> {enrolled} enrolled
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-tight">
            <span className="text-zinc-400">Your Progress</span>
            <span style={{ color: color }}>{progress}%</span>
          </div>
          <div className="mb-6 h-2.5 w-full rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-lg font-black text-white transition-all hover:brightness-95"
            style={{ backgroundColor: color }}
          >
            Enroll <span>→</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default CourseCard;
