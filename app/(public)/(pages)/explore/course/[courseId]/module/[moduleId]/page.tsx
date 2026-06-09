"use client";

import React, { useEffect, useState, use } from "react";

import { notFound } from "next/navigation";

import { ArrowLeft, Loader2 } from "lucide-react";

import ModuleOverviewHeader from "./_components/ModuleOverviewHeader";
import { getLearningModule, getModule } from "./service";
import { ModuleResponse } from "./types";
import ModuleLessonPreview from "./_components/ModuleLessonPreview";

const ModulePage = ({
  params,
}: {
  params: Promise<{
    moduleId: string;
  }>;
}) => {
  const resolvedParams = use(params);

  const moduleId = resolvedParams.moduleId;

  const [module, setModule] = useState<ModuleResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);

        const result = await getModule(moduleId);

        if (!result.success || !result.data) {
          throw new Error();
        }

        setModule(result.data);
      } catch (err) {
        console.error(err);

        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary/30" size={32} />
      </div>
    );
  }

  if (error || !module) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="sticky top-0 z-50 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-primary-hover"
          >
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-1"
            />

            <span className="lowercase font-medium">back to course</span>
          </button>
        </div>
      </nav>

      <ModuleOverviewHeader module={module} />

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-12">
        <div className="mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary mb-4">
            module structure
          </h2>

          <p className="text-zinc-500 font-light lowercase">
            explore the structured sections inside this module.
          </p>
        </div>

        <ModuleLessonPreview module={module} />
      </section>
    </main>
  );
};

export default ModulePage;
