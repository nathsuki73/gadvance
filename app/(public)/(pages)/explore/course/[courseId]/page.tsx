// app/(public)/explore/course/[courseId]/page.tsx

"use client";

import React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  courseModules,
} from "@/app/lib/courseModules";
import ModuleViewer from "../../_components/module/ModuleViewer";
import CourseModulePreview from "../../_components/course/CourseModulesPreview";
import CourseOverviewHeader from "../../_components/course/CourseOverviewHeader";


type CoursePageProps = {
  params: {
    courseId: string;
  };
};

const CoursePage = ({
  params,
}: CoursePageProps) => {
  const courseId = Number(params.courseId);

  const selectedModule =
    courseModules.find(
      (module) => module.id === courseId,
    );

  if (!selectedModule) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* TOP BAR */}
      <div className="border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() =>
              window.history.back()
            }
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      {/* COURSE OVERVIEW */}
      <CourseOverviewHeader
        course={selectedModule}
      />

      {/* COURSE PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <CourseModulePreview
          course={selectedModule}
        />
      </section>

      {/* MODULE VIEWER */}
      <section className="mx-auto max-w-[1600px] px-6 pb-20">
        <ModuleViewer
          module={selectedModule}
        />
      </section>
    </main>
  );
};

export default CoursePage;