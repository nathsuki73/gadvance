"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
// 🔑 1. Import useRouter
import { useRouter, notFound, useSearchParams } from "next/navigation";
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
  const router = useRouter(); // 🔑 2. Initialize router
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const targetItemId = searchParams.get("item");

  const [module, setModule] = useState<ModuleStructure | null>(null);
  const [activeItem, setActiveItem] = useState<SectionItem | null>(null);
  const [completedItemIds, setCompletedItemIds] = useState<Set<string>>(
    new Set(),
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const touchedItemIds = useRef<Set<string>>(new Set());

  // 1. Load module structure and progress ONCE on initial mount
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

        const allItems = structure.sections?.flatMap((sec) => sec.items) ?? [];

        if (allItems.length > 0) {
          const initialTarget = searchParams.get("item");
          if (initialTarget) {
            const foundItem = allItems.find(
              (i) => i.id === initialTarget || i.content_id === initialTarget,
            );
            setActiveItem(foundItem || allItems[0]);
          } else {
            setActiveItem(allItems[0]);
          }
        }

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
  }, [moduleId]); // 🔑 Remains safely decoupled from searchParams so API only calls once

  // 2. Synchronize activeItem instantly when query param changes
  useEffect(() => {
    if (!module) return;
    const allItems = module.sections?.flatMap((sec) => sec.items) ?? [];
    if (allItems.length === 0) return;

    if (targetItemId) {
      const foundItem = allItems.find(
        (i) => i.id === targetItemId || i.content_id === targetItemId,
      );
      if (foundItem && foundItem.id !== activeItem?.id) {
        setActiveItem(foundItem);
      }
    }
  }, [targetItemId, module, activeItem?.id]);

  // Touch latest visit tracking
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

  const allItems = module?.sections?.flatMap((sec) => sec.items) ?? [];

  // 🔑 3. Let Next.js handle Sidebar routing smoothly
  const handleSelectItem = (item: SectionItem) => {
    setMobileSidebarOpen(false);
    router.push(`/learn/${moduleId}?item=${item.id}`, { scroll: false });
  };

  const handleItemComplete = useCallback(
    async (itemId: string, progressValue = 100) => {
      if (!activeItem || !moduleId) return;

      const sectionId =
        activeItem.section_id ||
        module?.sections?.find((sec) => sec.items?.some((i) => i.id === itemId))
          ?.id;

      if (!sectionId) return;

      if (progressValue >= 100) {
        setCompletedItemIds((prev) => new Set(prev).add(itemId));
      }

      await saveLearningProgress({
        module_id: moduleId,
        section_id: sectionId,
        learning_item_id: itemId,
        progress: progressValue,
      });

      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    [activeItem, module, moduleId, queryClient],
  );

  // 🔑 4. Let Next.js handle Next Button routing smoothly
  const handleNext = () => {
    if (!activeItem) return;

    const currentIndex = allItems.findIndex((i) => i.id === activeItem.id);
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      const nextItem = allItems[currentIndex + 1];
      router.push(`/learn/${moduleId}?item=${nextItem.id}`, { scroll: false });
    }
  };

  // 🔑 5. Let Next.js handle Remedial Hash Navigation smoothly
  const handleNavigateTo = (targetId: string, blockId?: string) => {
    const foundItem = allItems.find(
      (i) => i.id === targetId || i.content_id === targetId,
    );

    if (foundItem) {
      const hash = blockId ? `#${blockId}` : "";
      router.push(`/learn/${moduleId}?item=${foundItem.id}${hash}`, {
        scroll: false,
      });
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
              onNavigate={handleNavigateTo}
            />
          ) : (
            <div className="flex h-[100dvh] w-full items-center justify-center bg-white p-6">
              <p className="text-sm font-semibold text-zinc-800">
                Unlinked Assessment
              </p>
            </div>
          )
        ) : (
          <PageContainer
            key={activeItem.id}
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
