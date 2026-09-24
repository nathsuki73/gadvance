"use client";

import { use, useState, useCallback, useMemo } from "react";
import { useRouter, notFound, useSearchParams } from "next/navigation";
import { Loader2, Menu } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import ModuleSidebar from "./_components/SideBar/ModuleSidebar";
import AssessmentContainer from "./_components/AssessmentContainer/AssessmentContainer";
import PageContainer from "./_components/PageContainer/PageContainer";
import { LearnPageSkeleton } from "./LearnPageSkeleton";
import {
  SectionItem,
  useModuleStructure,
  useLearningProgressQuery,
} from "./service";
import {
  completeAndGetNextItem,
  ProgressRecord,
} from "./service-user-progress";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const getMaxUnlockedIndex = (items: SectionItem[], completed: Set<string>) => {
  let idx = 0;
  for (let i = 0; i < items.length; i++) {
    // If the item is completed, we unlock the next one
    if (completed.has(items[i].id)) {
      idx = i + 1;
    } else {
      break;
    }
  }
  // Ensure we never return an index out of bounds, but allow index 0 if nothing is completed
  return Math.min(Math.max(0, idx), items.length - 1);
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const targetItemId = searchParams.get("item");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const {
    data: module,
    isLoading: moduleLoading,
    error: moduleError,
  } = useModuleStructure(moduleId);

  const { data: progressData, isLoading: progressLoading } =
    useLearningProgressQuery(moduleId);

  const loading = moduleLoading || progressLoading;
  const error = Boolean(moduleError);

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

  const currentIndex = useMemo(() => {
    if (!activeItem) return -1;
    return allItems.findIndex((i) => i.id === activeItem.id);
  }, [allItems, activeItem]);

  const isLastItem = currentIndex === allItems.length - 1;
  const nextItem =
    currentIndex !== -1 && !isLastItem ? allItems[currentIndex + 1] : null;

  // 🚀 Optimized Mutation with Optimistic Updates
  // 🚀 Optimized Combined Mutation
  const completeMutation = useMutation({
    mutationFn: async ({
      itemId,
      nextId,
    }: {
      itemId: string;
      nextId?: string;
    }) => {
      const sectionId =
        activeItem?.section_id ||
        module?.sections?.find((sec) => sec.items?.some((i) => i.id === itemId))
          ?.id;

      if (!sectionId) throw new Error("Section ID not found");

      const learningPlanId =
        (module as any)?.learning_plan_id || module?.courseId;

      // This single call handles saving progress, syncing plan progress,
      // and returns the fresh progress state!
      return await completeAndGetNextItem({
        module_id: moduleId,
        section_id: sectionId,
        learning_item_id: itemId,
        learning_plan_id: learningPlanId,
        next_item_id: nextId,
      });
    },
    onMutate: async ({ itemId }) => {
      await queryClient.cancelQueries({
        queryKey: ["learningProgress", moduleId],
      });

      const previousProgress = queryClient.getQueryData([
        "learningProgress",
        moduleId,
      ]);

      // Optimistic update
      queryClient.setQueryData(["learningProgress", moduleId], (old: any) => {
        if (!old) return old;
        const existingData = Array.isArray(old.data) ? old.data : [];
        const updatedData = [
          ...existingData,
          { learning_item_id: itemId, progress: 100, module_id: moduleId },
        ];
        const updatedIds = [...(old.completed_item_ids || []), itemId];

        return {
          ...old,
          data: updatedData,
          completed_item_ids: updatedIds,
        };
      });

      return { previousProgress };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ["learningProgress", moduleId],
          context.previousProgress,
        );
      }
    },
    onSuccess: (response) => {
      if (response && response.success) {
        queryClient.setQueryData(
          ["learningProgress", moduleId],
          (old: any) => ({
            ...(old || {}),
            success: true,
            data: response.data,
            completed_item_ids: response.completed_item_ids,
          }),
        );

        // 🚀 Directly navigate using the server-confirmed next item
        if (response.next_item) {
          router.push(`/learn/${moduleId}?item=${response.next_item.id}`, {
            scroll: false,
          });
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const handleSelectItem = (item: SectionItem) => {
    setMobileSidebarOpen(false);
    router.push(`/learn/${moduleId}?item=${item.id}`, { scroll: false });
  };

  const handleItemComplete = useCallback(
    async (itemId: string, progressValue = 100) => {
      // 🛡️ Block duplicate mutations if a request is already running
      if (
        !activeItem ||
        !moduleId ||
        !module ||
        progressValue < 100 ||
        completeMutation.isPending
      )
        return;

      const nextId = nextItem ? nextItem.id : undefined;

      completeMutation.mutate(
        { itemId, nextId },
        {
          onSuccess: () => {
            if (nextItem) {
              router.push(`/learn/${moduleId}?item=${nextItem.id}`, {
                scroll: false,
              });
            }
          },
        },
      );
    },
    [activeItem, moduleId, module, nextItem, completeMutation, router],
  );

  const handleNext = () => {
    if (!activeItem) return;
    handleItemComplete(activeItem.id, 100);
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
    return <LearnPageSkeleton />;
  }

  if (error || !module || !activeItem) {
    notFound();
  }

  const handleExitModule = async () => {
    try {
      // 1. Save progress if not already completed
      if (!completedItemIds.has(activeItem.id) && !completeMutation.isPending) {
        await completeMutation.mutateAsync({ itemId: activeItem.id });
      }

      // 2. Always route back safely
      router.push(`/explore/course/${module.courseId}/module/${moduleId}`);
    } catch (error) {
      console.error("Failed to complete item before exiting:", error);
    }
  };

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
              isLastItem={isLastItem}
              onComplete={() => handleItemComplete(activeItem.id, 100)}
              onNext={handleNext}
              onExit={handleExitModule}
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
            itemId={activeItem.id}
            pageId={activeItem.content_id || activeItem.id}
            title={activeItem.title}
            initialCompleted={completedItemIds.has(activeItem.id)}
            isLastItem={isLastItem}
            onComplete={() => handleItemComplete(activeItem.id, 100)}
            onNext={handleNext}
            onExit={handleExitModule}
          />
        )}
      </div>
    </main>
  );
};

export default LearnPage;
