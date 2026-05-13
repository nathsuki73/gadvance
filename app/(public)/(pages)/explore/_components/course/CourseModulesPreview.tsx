// components/explore/course/CourseModulePreview.tsx

"use client";

import React from "react";
import {
  ArrowRight,
  BookOpen,
  PlayCircle,
} from "lucide-react";

import { useRouter } from "next/navigation";
import type { CourseModule } from "@/app/lib/courseModules";

type CourseModulePreviewProps = {
  course: CourseModule;
};

const CourseModulePreview = ({
  course,
}: CourseModulePreviewProps) => {
  const router = useRouter();

  const sectionBlocks = course.blocks.filter(
    (block) =>
      block.type === "title" ||
      block.type === "section"
  );

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
        {sectionBlocks.map((block, index) => {
          const label =
            "text" in block
              ? block.text
              : "title" in block
                ? block.title
                : `Module ${index + 1}`;

          return (
            <div
              key={index}
              className="group flex items-start justify-between rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-md"
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-[#00aeef]">
                  {block.type === "title" ? (
                    <BookOpen size={20} />
                  ) : (
                    <PlayCircle size={20} />
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-900">
                    {label}
                  </h3>

                  <p className="mt-1 text-sm text-zinc-500">
                    Interactive learning content and guided
                    educational materials.
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
          );
        })}
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
            backgroundColor: course.accent,
          }}
        >
          Start Learning
        </button>
      </div>
    </section>
  );
};

export default CourseModulePreview;