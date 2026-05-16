"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";

import ModuleSidebar from "./_components/ModuleSidebar";
import ModuleSectionViewer from "./_components/ModuleSectionViewer";
import { FlattenedSection, ModuleResponse } from "./types";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  // Layout & UI State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("");

  // Data Fetching State
  const [module, setModule] = useState<ModuleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchModule = async () => {
      if (!moduleId) return;
      try {
        setLoading(true);
        const result = await getLearningModule(moduleId);

        if (!result.success || !result.data) throw new Error();

        console.log(JSON.stringify(result.data, null, 2));

        // result.data may include additional progress info from the service response
        // cast to ModuleResponse to satisfy local state type
        setModule(result.data as unknown as ModuleResponse);

        const firstSection = result.data.section_groups?.[0]?.sections?.[0];
        if (firstSection) {
          setActiveSectionId(firstSection.id);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [moduleId]);

  const sections = useMemo<FlattenedSection[]>(() => {
    if (!module) return [];

    return module.section_groups
      .slice()
      .sort((a, b) => a.order_index - b.order_index)
      .flatMap((group) =>
        group.sections
          .slice()
          .sort((a, b) => a.order_index - b.order_index)
          .map((section) => ({
            ...section,
            groupTitle: group.title,
          })),
      );
  }, [module]);

  const currentIndex = useMemo(() => {
    return sections.findIndex((s) => s.id === activeSectionId);
  }, [sections, activeSectionId]);

  const activeSection = sections[currentIndex];

  // Navigation Event Actions
  const handleSectionChange = (id: string) => {
    setActiveSectionId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const next = sections[currentIndex + 1];
    if (next) handleSectionChange(next.id);
  };

  const handlePrevious = () => {
    const previous = sections[currentIndex - 1];
    if (previous) handleSectionChange(previous.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-[#00aeef]" />
      </div>
    );
  }

  if (error || !module || !activeSection) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb]">
      <ModuleSidebar
        structureTitle={module.title}
        sectionGroups={module.section_groups}
        activeSectionId={activeSectionId}
        onNavigate={handleSectionChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Top Navigation Sticky Bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition"
          aria-label="Open sidebar layout"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module.title}
        </span>
      </div>

      {/* Main Workspace Layout Canvas */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}
        `}
      >
        <ModuleSectionViewer
          section={activeSection}
          currentIndex={currentIndex}
          totalSections={sections.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === sections.length - 1}
        />
      </div>
    </main>
  );
};

export default LearnPage;
