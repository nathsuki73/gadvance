"use client";

import React from "react";
import {
  Globe,
  Briefcase,
  Heart,
  Target,
  Clock3,
  Users,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import type { LearningPlan } from "../../../types";

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

type CourseOverviewHeaderProps = {
  course: LearningPlan;
};

const CourseOverviewHeader = ({
  course,
}: CourseOverviewHeaderProps) => {
  const Icon =
    iconByType[
      course.icon as keyof typeof iconByType
    ] || BookOpen;
    
  return (
    <section className="bg-[#00aeef] text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-end">
          
          <div className="flex flex-col gap-8">
            {/* Institutional Badge */}
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-100">
                PROFESSIONAL CURRICULUM
              </span>
            </div>

            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
                {course.title}
              </h1>
              <p className="mt-6 text-lg text-sky-50 font-light leading-relaxed">
                {course.about || "A formal learning pathway designed for systemic gender advancement and institutional leadership."}
              </p>
            </div>

            {/* Formal Stats Bar */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 pt-8 border-t border-white/20 text-[11px] font-bold uppercase tracking-widest text-sky-100">
              <div className="flex items-center gap-2">
                <Clock3 size={14} />
                {course.duration || "self-paced"}
              </div>
              <div className="flex items-center gap-2">
                <Users size={14} />
                {course.enrolled || 0} enrolled learners
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={14} />
                {course.modules?.length || 0} instructional modules
              </div>
            </div>
          </div>

          {/* Header Action: Enroll Button */}
          {/* Updated to match the rounded style of your other buttons */}
<div className="lg:pb-2">
  <button className="w-full lg:w-auto bg-white text-[#00aeef] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] shadow-xl transition-all hover:bg-sky-50 hover:-translate-y-1 active:scale-[0.98] rounded-md">
    <div className="flex items-center justify-center gap-3">
      Enroll Now
      <ChevronRight size={16} />
    </div>
  </button>
</div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverviewHeader;