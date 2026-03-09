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
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
      {/* Top Section */}
      <div className="h-36 w-full relative flex items-center justify-center bg-zinc-50">
        <span
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border"
          style={{
            color: color,
            borderColor: color,
            backgroundColor: `${color}10`,
          }}
        >
          {tag}
        </span>
        <BookOpen className="w-12 h-12 text-zinc-300" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-extrabold text-xl leading-tight mb-3 text-zinc-900">
          {title}
        </h3>
        <p className="text-sm text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs font-medium text-zinc-400 mb-6">
          <div className="flex items-center gap-1">
            <Clock size={14} /> {duration}
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} /> {enrolled} enrolled
          </div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-2 font-black uppercase text-[10px] tracking-tighter">
            <span className="text-zinc-400">Your Progress</span>
            <span style={{ color: color }}>{progress}%</span>
          </div>
          <div className="h-2.5 w-full bg-zinc-100 rounded-full mb-6">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, backgroundColor: color }}
            />
          </div>

          <button
            className="w-full py-3.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 hover:brightness-95 transition-all"
            style={{ backgroundColor: color }}
          >
            Continue Learning <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
