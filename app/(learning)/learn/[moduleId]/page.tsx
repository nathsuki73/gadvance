"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "./_components/ModuleSidebar";
import ModuleSectionViewer from "./_components/ModuleSectionViewer";
import type { ModuleResponse } from "./types";
import { getLearningModule } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/service";
import { Lesson } from "@/app/(public)/(pages)/explore/course/[courseId]/module/[moduleId]/types";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  // Layout & UI State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(""); // Track by lesson instead of section

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

        setModule(result.data as unknown as ModuleResponse);

        // Auto-select the very first lesson to display initially
        const firstLesson = result.data.lessons?.[0];
        if (firstLesson) {
          setActiveLessonId(firstLesson.id);
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

  // Safely extract our sequential list of lessons
  const lessons = useMemo<Lesson[]>(() => {
    if (!module || !module.lessons) return [];
    return module.lessons;
  }, [module]);

  const currentIndex = useMemo(() => {
    return lessons.findIndex((l) => l.id === activeLessonId);
  }, [lessons, activeLessonId]);

  const activeLesson = lessons[currentIndex];

  // Navigation Event Actions
  const handleLessonChange = (id: string) => {
    setActiveLessonId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const next = lessons[currentIndex + 1];
    if (next) handleLessonChange(next.id);
  };

  const handlePrevious = () => {
    const previous = lessons[currentIndex - 1];
    if (previous) handleLessonChange(previous.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-[#8b5cf6]" />
      </div>
    );
  }

  if (error || !module || !activeLesson) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#ffffff]">
      {/* Sidebar gets updated layout properties */}
      <ModuleSidebar
        structureTitle={module.title}
        lessons={lessons} // <-- Pass lessons instead of sectionGroups
        activeLessonId={activeLessonId}
        onNavigate={handleLessonChange}
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
        {/* Viewer renders active lesson content */}
        <ModuleSectionViewer
          lesson={activeLesson} // <-- Pass down the focused lesson record!
          currentIndex={currentIndex}
          totalSections={lessons.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirst={currentIndex === 0}
          isLast={currentIndex === lessons.length - 1}
        />
      </div>
    </main>
  );
};

export default LearnPage;
