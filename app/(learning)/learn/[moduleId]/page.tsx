"use client";

import React, { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react"; // Imported Menu icon for the trigger

import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import type { ModuleResponse } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

import ModuleSidebar from "./_components/ModuleSidebar";
import { useModuleNavigation } from "./_components/useModuleNavigation";

type LearnPageProps = {
  params: Promise<{
    moduleId: string;
  }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const resolvedParams = use(params);
  const moduleId = resolvedParams.moduleId;

  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        const result = await getLearningModule(moduleId);

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

    if (moduleId) {
      fetchModule();
    }
  }, [moduleId]);

  const {
    moduleArticles,
    moduleNavItems,
    displayedNavId,
    expandedGroups,
    toggleGroupExpanded,
    navigateTo,
    isStructureCollapsed,
    setIsStructureCollapsed,
  } = useModuleNavigation(
    module ??
      ({
        id: "",
        title: "",
        about: "",
        section_groups: [],
      } as ModuleResponse)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-[#00aeef]" />
      </div>
    );
  }

  if (error || !module) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      {/* 1. SIDEBAR COMPONENT */}
      <ModuleSidebar
        structureTitle={module.title}
        items={moduleNavItems}
        displayedNavId={displayedNavId}
        expandedModules={expandedGroups}
        isCollapsed={isStructureCollapsed}
        onToggleCollapse={() => setIsStructureCollapsed((prev) => !prev)}
        onToggleModule={toggleGroupExpanded}
        onNavigate={navigateTo}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. MOBILE HEADER BAR (Hidden on Desktop) */}
      <div className="flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden sticky top-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 text-sm font-semibold text-zinc-900 truncate">
          {module.title}
        </span>
      </div>

      {/* 3. MAIN WORKSPACE CONTENT CONTAINER */}
      {/* Dynamic left padding keeps your workspace responsive and layout-aligned when desktop sidebar states change */}
      <div
        className={`
          transition-all duration-300 ease-in-out p-4 sm:p-6 lg:p-8
          ${isStructureCollapsed ? "lg:pl-[92px]" : "lg:pl-[344px]"}
        `}
      >
        <div className="max-w-4xl mx-auto">
          {/* Your active learning workspace/articles render here */}
          <h1 className="text-2xl font-bold text-zinc-900 mb-4">{module.title}</h1>
          <p className="text-zinc-600">{module.about}</p>
        </div>
      </div>
    </main>
  );
};

export default LearnPage;