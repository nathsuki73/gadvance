"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Clock3, Users, ArrowLeft } from "lucide-react";
import Header from "@/app/components/Header";
import { courseModules } from "@/app/lib/courseModules";

interface Module {
  id: string;
  number: number;
  title: string;
  description?: string;
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
        let currentModuleNumber = 0;

        course.blocks.forEach((block, index) => {
          if (
            block.type === "title" &&
            typeof (block as any).text === "string" &&
            (block as any).text.includes("Module")
          ) {
            const text = (block as any).text;
            const match = text.match(/Module\s+(\d+):\s*(.+)/i);
            if (match) {
              currentModuleNumber = parseInt(match[1]);
              extractedModules.push({
                id: `module-${block.id}`,
                number: currentModuleNumber,
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
    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-zinc-900">
        <div className="sticky top-0 z-10">
          <Header />
        </div>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <button
            onClick={() => router.push("/workspace")}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </button>

          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
              Course Modules
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {courseName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
              Explore the modules within this course. Start with Module 1 and
              progress through each module at your own pace.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modules.map((module) => (
              <article
                key={module.id}
                className="group rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                    style={{ backgroundColor: courseColor }}
                  >
                    Module {module.number}
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">
                  {module.title}
                </h2>
                {module.description && (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {module.description}
                  </p>
                )}

                <div className="mt-4 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-zinc-400" />
                    <span>Self-paced learning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <span>Interactive content</span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/workspace/courses?moduleId=${parseInt(courseId)}&module=${module.number}`
                    )
                  }
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl text-white px-4 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ backgroundColor: courseColor }}
                >
                  Start Module
                  <ArrowRight className="h-4 w-4" />
                </button>
              </article>
            ))}
          </section>
        </main>
      </div>
    );
  }

  // Default view: show all courses
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-zinc-900">
      <div className="sticky top-0 z-10">
        <Header />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
            Current Courses
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose the course you want to continue.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500 sm:text-base">
            These are the same modules available in the courses area, arranged
            here for quick access.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {courseModules.map((module) => (
            <article
              key={module.id}
              className="group rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white"
                  style={{ backgroundColor: module.accent }}
                >
                  {module.tag}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  Module {module.id}
                </span>
              </div>

              <h2 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900">
                {module.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {module.description}
              </p>

              <div className="mt-4 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-zinc-400" />
                  <span>{module.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span>{module.enrolled} learners enrolled</span>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    `/workspace/courses?moduleId=${module.id}&courseId=${module.id}`
                  )
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-600"
              >
                Start Module
                <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};

export default ModulePage;
