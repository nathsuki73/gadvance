"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import ModuleSidebar from "./_components/SideBar/ModuleSidebar";
import AssessmentContainer from "./_components/AssessmentContainer/AssessmentContainer";
import PageContainer from "./_components/PageContainer";
import { getModuleStructure, ModuleStructure, SectionItem } from "./service";
import {
  getLearningProgress,
  saveLearningProgress,
  ProgressRecord,
} from "./service-user-progress";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);
  const queryClient = useQueryClient();

  const [module, setModule] = useState<ModuleStructure | null>(null);
  const [activeItem, setActiveItem] = useState<SectionItem | null>(null);
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(
    new Set(),
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Tracks items touched during the session to avoid duplicate visit-touch network requests
  const touchedItemIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!moduleId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(false);

        const [structure, progressData] = await Promise.all([
          getModuleStructure(moduleId),
          getLearningProgress(moduleId),
        ]);

        setModule(structure);

        // Extract all section items across all sections
        const allItems = structure.sections?.flatMap((sec) => sec.items) ?? [];

        if (allItems.length > 0) {
          setActiveItem(allItems[0]);
        }

        // Restore completion state
        if (progressData?.success && Array.isArray(progressData.data)) {
          const completed = new Set<string>();
          progressData.data.forEach((record: ProgressRecord) => {
            if (record.progress >= 100) {
              completed.add(record.learning_item_id);
            }
          });
          setCompletedItemIds(completed);
        }
      } catch (err) {
        console.error("Error loading module structure:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [moduleId]);

  // 🎯 TOUCH LATEST VISIT: Update updated_at when opening an item so this module moves to the front of Recently Viewed
  useEffect(() => {
    if (!moduleId || !activeItem || !module) return;

    const itemId = activeItem.id;
    if (touchedItemIds.current.has(itemId)) return;

    const sectionId =
      activeItem.section_id ||
      module?.sections?.find((sec) => sec.items?.some((i) => i.id === itemId))
        ?.id;

    if (!sectionId) return;

    const touchModuleVisit = async () => {
      touchedItemIds.current.add(itemId);
      const isAlreadyCompleted = completedItemIds.has(itemId);

      // Persist current item status to bump updated_at
      const response = await saveLearningProgress({
        module_id: moduleId,
        section_id: sectionId,
        learning_item_id: itemId,
        progress: isAlreadyCompleted ? 100 : 0,
      });

      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      }
    };

    touchModuleVisit();
  }, [moduleId, activeItem, module, completedItemIds, queryClient]);

  // Flattened items list for next/previous navigation
  const allItems = module?.sections?.flatMap((sec) => sec.items) ?? [];

  const handleSelectItem = (item: SectionItem) => {
    setActiveItem(item);
    setMobileSidebarOpen(false);
  };

  const handleItemComplete = useCallback(
    async (itemId: string, progressValue = 100) => {
      if (!activeItem || !moduleId) return;

      // Resolve section_id safely
      const sectionId =
        activeItem.section_id ||
        module?.sections?.find((sec) => sec.items?.some((i) => i.id === itemId))
          ?.id;

      if (!sectionId) {
        console.error(
          "[LearnPage] Could not resolve section_id for item:",
          itemId,
        );
        return;
      }

      // 1. Optimistic UI update
      if (progressValue >= 100) {
        setCompletedItemIds((prev) => new Set(prev).add(itemId));
      }

      // 2. Persist to backend database
      const response = await saveLearningProgress({
        module_id: moduleId,
        section_id: sectionId,
        learning_item_id: itemId,
        progress: progressValue,
      });

      if (response.success) {
        // 🎯 Invalidate cache so Workspace picks up updated percentage & recency ordering
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      } else {
        console.error("[LearnPage] DB save failed:", response.error);
        if (progressValue >= 100) {
          setCompletedItemIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        }
      }
    },
    [activeItem, module, moduleId, queryClient],
  );

  const handleNext = () => {
    if (!activeItem) return;

    const currentIndex = allItems.findIndex((i) => i.id === activeItem.id);
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      handleSelectItem(allItems[currentIndex + 1]);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (error || !module || !activeItem) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Sidebar Navigation */}
      <ModuleSidebar
        courseId={module.courseId}
        moduleId={moduleId}
        structureTitle={module.title}
        sections={module.sections || []}
        activeItem={activeItem}
        completedItemIds={completedItemIds}
        onSelect={handleSelectItem}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module.title}
        </span>
      </div>

      {/* Main Content Render */}
      <div
        className={`h-screen max-h-screen transition-all duration-300 pt-14 lg:pt-0 ${
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"
        }`}
      >
        {activeItem.item_type === "assessment" ? (
          activeItem.content_id ? (
            <AssessmentContainer
              itemId={activeItem.id}
              moduleId={moduleId}
              sectionId={activeItem.section_id}
              assessmentId={activeItem.content_id}
              type={activeItem.assessment_type || "quiz"}
              onComplete={() => handleItemComplete(activeItem.id, 100)}
              onNext={handleNext}
            />
          ) : (
            <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
              <div className="text-center">
                <p className="text-sm font-semibold text-zinc-800">
                  Unlinked Assessment
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  This section item does not have a linked assessment ID.
                </p>
              </div>
            </div>
          )
        ) : (
          <PageContainer
            itemId={activeItem.id}
            pageId={activeItem.content_id || activeItem.id}
            title={activeItem.title}
            initialCompleted={completedItemIds.has(activeItem.id)}
            onComplete={() => handleItemComplete(activeItem.id, 100)}
            onNext={handleNext}
          />
        )}
      </div>
    </main>
  );
};

export default LearnPage;