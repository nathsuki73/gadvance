"use client";

import { use, useState, useCallback, useMemo } from "react";
import { useRouter, notFound, useSearchParams } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import ModuleSidebar from "./_components/SideBar/ModuleSidebar";
import AssessmentContainer from "./_components/AssessmentContainer/AssessmentContainer";
import PageContainer from "./_components/PageContainer";
import { SectionItem, useModuleStructure } from "./service";
import {
  saveLearningProgress,
  ProgressRecord,
  syncLearningPlanProgress,
} from "./service-user-progress";
import { useLearningProgressQuery } from "./service";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const getMaxUnlockedIndex = (items: SectionItem[], completed: Set<string>) => {
  let idx = 0;
  for (let i = 0; i < items.length; i++) {
    if (completed.has(items[i].id)) {
      idx = i + 1;
    } else {
      break;
    }
  }
  return Math.min(idx, items.length - 1);
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const targetItemId = searchParams.get("item");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 🔑 React Query hooks manage fetching and deduplication automatically
  const {
    data: module,
    isLoading: moduleLoading,
    error: moduleError,
  } = useModuleStructure(moduleId);

  const { data: progressData, isLoading: progressLoading } =
    useLearningProgressQuery(moduleId);

  const loading = moduleLoading || progressLoading;
  const error = Boolean(moduleError);

  // 🔑 Derived via useMemo safely without cascading renders
  const completedItemIds = useMemo(() => {
    const completed = new Set<string>();
    if (progressData?.success && Array.isArray(progressData.data)) {
      progressData.data.forEach((record: ProgressRecord) => {
        if (record.progress >= 100) completed.add(record.learning_item_id);
      });
    }
    return completed;
  }, [progressData]);

  const allItems = useMemo(() => {
    return module?.sections?.flatMap((sec) => sec.items) ?? [];
  }, [module]);

  // 🔑 Derived activeItem using useMemo instead of useEffect + setState
  const activeItem = useMemo(() => {
    if (allItems.length === 0) return null;

    const maxUnlockedIndex = getMaxUnlockedIndex(allItems, completedItemIds);
    const allowedItem = allItems[maxUnlockedIndex];

    const requestedItem = targetItemId
      ? allItems.find(
          (i) => i.id === targetItemId || i.content_id === targetItemId,
        )
      : null;
    const requestedIndex = requestedItem
      ? allItems.findIndex((i) => i.id === requestedItem.id)
      : -1;

    if (requestedItem && requestedIndex <= maxUnlockedIndex) {
      return requestedItem;
    }

    return allowedItem;
  }, [allItems, completedItemIds, targetItemId]);

  const handleSelectItem = (item: SectionItem) => {
    setMobileSidebarOpen(false);
    router.push(`/learn/${moduleId}?item=${item.id}`, { scroll: false });
  };

  const handleItemComplete = useCallback(
    async (itemId: string, progressValue = 100) => {
      if (!activeItem || !moduleId || !module) return;

      const sectionId =
        activeItem.section_id ||
        module?.sections?.find((sec) => sec.items?.some((i) => i.id === itemId))
          ?.id;

      if (!sectionId) return;

      await saveLearningProgress({
        module_id: moduleId,
        section_id: sectionId,
        learning_item_id: itemId,
        progress: progressValue,
      });

      const learningPlanId =
        (module as any)?.learning_plan_id || module?.courseId;
      if (learningPlanId && progressValue >= 100) {
        await syncLearningPlanProgress(learningPlanId);
      }

      queryClient.invalidateQueries({
        queryKey: ["learningProgress", moduleId],
      });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    [activeItem, module, moduleId, queryClient],
  );

  const handleNext = () => {
    if (!activeItem) return;

    const currentIndex = allItems.findIndex((i) => i.id === activeItem.id);
    if (currentIndex !== -1 && currentIndex < allItems.length - 1) {
      const nextItem = allItems[currentIndex + 1];
      router.push(`/learn/${moduleId}?item=${nextItem.id}`, { scroll: false });
    }
  };

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
              key={activeItem.id}
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
