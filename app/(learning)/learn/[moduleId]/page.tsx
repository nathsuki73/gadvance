"use client";

import React, { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2 } from "lucide-react";

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

   
    </main>
  );
};

export default LearnPage;