"use client";

import React from "react";
import {
  ArrowRight,
  BookOpen,
  PlayCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";

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
  accent?: string;
  modules?: Module[];
};

type CourseModulePreviewProps = {
  course: Course;
};

const CourseModulePreview = ({
  course,
}: CourseModulePreviewProps) => {
  const router = useRouter();

  const modules = course.modules || [];

  return (
    <section className="mt-16">
      <div className="max-w-3xl">
        <div className="inline-flex rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-[#00aeef]">
          Course Structure
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900">
          What You’ll Learn
        </h2>

        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Explore guided lessons, practical activities,
          and interactive learning experiences designed
          to build knowledge progressively.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {modules.map((module, index) => (
          <div
            key={module.id}
            className="group flex items-start justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#00aeef]">
                {index === 0 ? (
                  <BookOpen size={20} />
                ) : (
                  <PlayCircle size={20} />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-zinc-900">
                  {module.title}
                </h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {module.about ||
                    "Interactive learning content and guided educational materials."}
                </p>
              </div>
            </div>

            <div className="hidden md:flex">
              <ArrowRight
                size={18}
                className="text-zinc-400 transition-transform group-hover:translate-x-1"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/explore/course/${course.id}/module`
            )
          }
          className="rounded-2xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: course.accent || "#00aeef",
          }}
        >
          Start Learning
        </button>
      </div>
    </section>
  );
};

export default CourseModulePreview;