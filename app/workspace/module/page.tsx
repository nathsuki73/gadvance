"use client";

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, Users } from "lucide-react";
import Header from "@/app/components/Header";
import { courseModules } from "@/app/lib/courseModules";

const ModulePage = () => {
  const { status: authStatus } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [authStatus, router]);

  if (authStatus === "loading" || authStatus === "unauthenticated") {
    return null;
  }

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
                  router.push(`/workspace/courses?moduleId=${module.id}`)
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
