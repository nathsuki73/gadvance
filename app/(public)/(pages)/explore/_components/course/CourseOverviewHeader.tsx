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
} from "lucide-react";

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

type Module = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
};

type Course = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
  modules?: Module[];

  // optional frontend-only fields
  icon?: keyof typeof iconByType;
  accent?: string;
  tag?: string;
  duration?: string;
  enrolled?: number;
};

type CourseOverviewHeaderProps = {
  course: Course;
};

const CourseOverviewHeader = ({
  course,
}: CourseOverviewHeaderProps) => {
  const Icon =
    iconByType[course.icon as keyof typeof iconByType] || BookOpen;

  const accent = course.accent || "#0ea5e9";
  const tag = course.tag || "Learning Plan";
  const duration = course.duration || "Self-paced";
  const enrolled = course.enrolled || 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-sky-50 to-sky-100 p-8 md:p-12">
      <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-sky-200/40 blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ backgroundColor: accent }}
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
            {tag}
          </span>
        </div>

        <div className="mt-8 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            {course.title}
          </h1>

          <p className="mt-6 text-lg leading-8 text-zinc-600">
            {course.about || "No course description available."}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-6 text-sm text-zinc-600">
          <div className="inline-flex items-center gap-2">
            <Clock3 size={16} />
            {duration}
          </div>

          <div className="inline-flex items-center gap-2">
            <Users size={16} />
            {enrolled} learners enrolled
          </div>

          <div className="inline-flex items-center gap-2">
            <BookOpen size={16} />
            {course.modules?.length || 0} modules
          </div>
        </div>
      </div>
    </section>
  );
};

export default CourseOverviewHeader;