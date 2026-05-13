// components/explore/course/CourseOverviewHeader.tsx

"use client";

import React from "react";
import {
  Globe,
  Briefcase,
  Heart,
  Target,
  Clock3,
  Users,
} from "lucide-react";

import type { CourseModule } from "@/app/lib/courseModules";

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

type CourseOverviewHeaderProps = {
  course: CourseModule;
};

const CourseOverviewHeader = ({
  course,
}: CourseOverviewHeaderProps) => {
  const Icon = iconByType[course.icon];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-sky-50 to-sky-100 p-8 md:p-12">
      <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: course.accent }}
          >
            <Icon size={24} strokeWidth={2.2} />
          </div>

          <span
            className="rounded-full px-3 py-1 text-sm font-semibold"
            style={{
              backgroundColor: "#bceee6",
              color: "#056f64",
            }}
          >
            {course.tag}
          </span>
        </div>

        <div className="mt-8 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            {course.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600">
            {course.description}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-600">
          <div className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {course.duration}
          </div>

          <div className="inline-flex items-center gap-2">
            <Users size={16} />
            {course.enrolled} learners enrolled
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverviewHeader;