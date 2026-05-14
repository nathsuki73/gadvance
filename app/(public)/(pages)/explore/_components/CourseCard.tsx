"use client";

import React from "react";
import {
  ArrowUpRight,
  Clock3,
  Globe,
  Briefcase,
  Heart,
  Target,
  Users,
} from "lucide-react";

import { useRouter } from "next/navigation";
import type { CourseModule } from "@/app/lib/courseModules";

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

type CourseCardProps = {
  module: CourseModule;
};

const CourseCard = ({ module }: CourseCardProps) => {
  const router = useRouter();
  const Icon = iconByType[module.icon as keyof typeof iconByType] || Target;

  return (
    <article className="group flex flex-col gap-6 rounded-[32px] border border-zinc-100 bg-white p-8 text-left transition-all duration-500 hover:border-[#00aeef]/30 hover:shadow-xl hover:shadow-sky-100/20">
      
      {/* Header: Minimal Tag & Icon */}
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 text-[#00aeef] transition-colors group-hover:bg-sky-50">
          <Icon size={18} strokeWidth={1.5} />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
          {module.tag}
        </span>
      </div>

      {/* Content: Lowercase & Airy */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 lowercase">
          {module.title}
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500 font-light lowercase">
          {module.description}
        </p>
      </div>

      {/* Meta Stats: Monochromatic */}
      <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
        <span className="inline-flex items-center gap-2">
          <Clock3 size={14} strokeWidth={2} />
          {module.duration}
        </span>

        <span className="inline-flex items-center gap-2">
          <Users size={14} strokeWidth={2} />
          {module.enrolled}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-zinc-50" />

      {/* Action: Subtle Arrow Link */}
      <button
        type="button"
        onClick={() => router.push(`/explore/course/${module.id}`)}
        className="group/btn flex items-center justify-end w-full text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-[#00aeef] gap-1"
      >
        <span className="lowercase font-medium">view modules</span>
        <ArrowUpRight 
          size={16} 
          className="transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" 
        />
      </button>
    </article>
  );
};

export default CourseCard;