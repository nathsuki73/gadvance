"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlayCircle,
  CheckCircle2,
  Lock,
} from "lucide-react";

import type { LearningPlan } from "../../../types";

type LessonItem = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
};

type CourseModulePreviewProps = {
  course: LearningPlan;
  isLoggedIn: boolean;
  isEnrolled: boolean;
};

const CourseModulePreview = ({
  course,
  isEnrolled,
}: CourseModulePreviewProps) => {
  const [lessonsList, setLessonsList] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch directly from your working standalone lessons endpoint
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/lessons`)
      .then((res) => res.json())
      .then((payload) => {
        // Handle both standard data wrapper and direct assignment formats
        if (payload.success && Array.isArray(payload.data)) {
          setLessonsList(payload.data);
        } else if (Array.isArray(payload.lessons)) {
          setLessonsList(payload.lessons);
        } else if (Array.isArray(payload)) {
          setLessonsList(payload);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load database lessons:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-zinc-400 font-light">Loading syllabus entries...</div>;
  }

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto md:px-12 px-6">
        <div className="mb-12 border-l-4 border-primary pl-6">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-1">
            Syllabus
          </h2>

          <h3 className="text-2xl font-semibold text-zinc-900 tracking-tight">
            Instructional Roadmap
          </h3>
        </div>

        <div className="flex flex-col">
          {lessonsList.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/explore/course/${course.id}/module/${lesson.id}`}
              className="group flex justify-between items-center gap-8 py-6 border-b border-zinc-100 transition-colors hover:bg-zinc-50/50 px-2"
            >
              <div className="flex items-start gap-4 sm:gap-8">
                <span className="text-xs font-mono font-bold text-zinc-300 pt-1">
                  {(index + 1).toString().padStart(2, "0")}
                </span>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    {index === 0 ? (
                      <BookOpen
                        size={16}
                        className="text-primary shrink-0"
                      />
                    ) : (
                      <PlayCircle
                        size={16}
                        className="text-primary shrink-0"
                      />
                    )}

                    <h4 className="text-base font-medium text-zinc-800 group-hover:text-primary transition-colors">
                      {lesson.title}
                    </h4>
                  </div>

                  <p className="text-sm text-zinc-500 font-light leading-relaxed max-w-3xl">
                    {lesson.description ||
                      "Standard module overview and learning objectives."}
                  </p>
                </div>
              </div>

              <div className="flex items-center shrink-0">
                {isEnrolled ? (
                  <CheckCircle2
                    size={18}
                    className="text-emerald-500"
                    strokeWidth={2}
                  />
                ) : (
                  <Lock
                    size={16}
                    className="text-zinc-300 group-hover:text-zinc-400 transition-colors"
                    strokeWidth={2}
                  />
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseModulePreview;