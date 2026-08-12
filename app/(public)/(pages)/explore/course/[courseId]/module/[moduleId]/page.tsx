"use client";

import React, { useEffect, useState, use } from "react";
import { notFound, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import ModuleOverviewHeader from "./_components/ModuleOverviewHeader";
import { getModule } from "./service"; // 👈 Use getModule instead of getLearningModule
import { ModuleResponse } from "./types";

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

  const router = useRouter();
  const pathname = usePathname();

  const handleBackToCourse = () => {
    const courseLink = pathname.split("/module")[0];
    router.push(courseLink);
  };

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        // 🔑 getModule is safe for public/semi-public fetching and utilizes the updated backend controller
        const result = await getModule(moduleId);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch module");
        }

        setModule(result.data);
      } catch (err) {
        console.error("Failed to load module overview:", err);
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
        <Loader2 className="animate-spin text-purple-600/30" size={32} />
      </div>
    );
  }

  if (error || !module) notFound();

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <nav className="sticky top-0 z-40 border-b border-zinc-50 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-6 py-6 md:px-12">
          <button
            onClick={handleBackToCourse}
            className="group inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-purple-600 cursor-pointer"
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
    </main>
  );
};

export default ModulePage;
