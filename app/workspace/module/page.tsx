"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import Header from "@/app/components/Header";
import { courseModules } from "@/app/lib/courseModules";

interface Module {
  id: string;
  number: number;
  title: string;
  description?: string;
  duration?: string;
}

const ModulePage = () => {
  const { status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const [modules, setModules] = useState<Module[]>([]);
  const [courseName, setCourseName] = useState<string>("");
  const [courseColor, setCourseColor] = useState<string>("#14b8a6");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (courseId) {
      const course = courseModules.find((c) => c.id === parseInt(courseId));
      if (course) {
        setCourseName(course.title);
        setCourseColor(course.accent);

        // Extract modules from course blocks
        const extractedModules: Module[] = [];

        course.blocks.forEach((block, index) => {
          if (
            block.type === "title" &&
            typeof (block as any).text === "string" &&
            (block as any).text.includes("Module")
          ) {
            const text = (block as any).text;
            const match = text.match(/Module\s+(\d+):\s*(.+)/i);
            if (match) {
              extractedModules.push({
                id: `module-${block.id}`,
                number: extractedModules.length + 1,
                title: match[2].trim(),
                description: "",
              });

              // Get description from next paragraph block if available
              const nextBlock = course.blocks[index + 1];
              if (
                nextBlock &&
                nextBlock.type === "paragraph" &&
                typeof (nextBlock as any).text === "string"
              ) {
                const lastModule = extractedModules[extractedModules.length - 1];
                lastModule.description = (nextBlock as any).text;
              }
            }
          }
        });

        setModules(extractedModules);
      }
    }
  }, [courseId]);

  if (authStatus === "loading" || authStatus === "unauthenticated") {
    return null;
  }

  // Show modules for a specific course
  if (courseId && modules.length > 0) {
    const progressPercent = Math.round((1 / modules.length) * 100);

    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <div className="sticky top-0 z-10">
          <Header />
        </div>

        {/* Hero Section */}
        <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <div className="px-4 pt-8 pb-12 sm:px-6 lg:px-6 bg-cyan-950">
            <button
              onClick={() => router.push("/workspace")}
              className="mb-6 inline-flex items-center gap-2 text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </button>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {courseName}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-300">
              Build a comprehensive understanding of gender equality principles,
              workplace dynamics, and inclusive practices. This course equips you
              with practical tools to drive meaningful change in your
              organization.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-5 w-5" />
                <span className="font-medium">About 4 hours</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">{modules.length} {modules.length === 1 ? "Module" : "Modules"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="mb-8">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Your Progress
                </h2>
                <span className="text-3xl font-bold text-cyan-950">
                  {progressPercent}%
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                1 of {modules.length} {modules.length === 1 ? "Module" : "Modules"} completed
              </p>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-950 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%`}}
                />
              </div>
            </div>

            {/* Module Progress Indicators */}
            <div className="flex items-center justify-between gap-2">
              {modules.map((module, index) => (
                <div key={module.id} className="flex flex-col items-center">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold text-sm transition ${
                      index === 0
                        ? "bg-cyan-950 text-white"
                        : index === 1
                        ? "border-2 border-cyan-950 bg-cyan-950 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {index === 0 ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      module.number
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium text-slate-600 hidden sm:block">
                    Module {module.number}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course Modules Section */}
        <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-3xl font-bold text-slate-900">
            Course Modules
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => (
              <article
                key={module.id}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Module {module.number}
                  </p>
                  <div className="flex items-center">
                    {index === 0 && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold bg-cyan-950 text-white rounded-full">
                        ✓ Completed
                      </span>
                    )}
                    {index === 1 && (
                      <div className="flex items-center gap-1">
                        <svg className="h-6 w-6 transform -rotate-90" viewBox="0 0 48 48">
                          <circle
                            cx="24"
                            cy="24"
                            r="17"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="6"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="17"
                            fill="none"
                            stroke="#082f49"
                            strokeWidth="6"
                            strokeDasharray="50.265 125.66"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="text-xs font-bold text-cyan-950">
                          42%
                        </span>
                      </div>
                    )} 
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {module.title}
                </h3>
                {module.description && (
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {module.description}
                  </p>
                )}

                <div className="mt-4 mb-4 flex items-center gap-2 text-sm text-slate-500">
                  <Clock className="h-4 w-4" />
                  <span>{module.duration || "45 min"}</span>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/workspace/courses?moduleId=${parseInt(courseId)}&module=${module.number}`
                    )
                  }
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  {index === 0 ? "Review Module" : index === 1 ? "Resume" : "Start Module"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Default view: show all courses
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      {/* Hero Section */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Course Modules
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            Continue learning from your available courses. Choose a course to
            explore its modules and track your progress.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseModules.map((module) => (
            <article
              key={module.id}
              className="group rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <div className="mb-4 flex items-start justify-between">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: module.accent }}
                >
                  {module.tag}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-slate-900">
                {module.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {module.description}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" />
                <span>{module.duration}</span>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/workspace/module?courseId=${module.id}`
                  )
                }
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg text-white px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                style={{ backgroundColor: module.accent }}
              >
                View Modules
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ModulePage;
