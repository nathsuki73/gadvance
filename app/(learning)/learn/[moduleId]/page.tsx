"use client";

import { use, useCallback, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar, {
  LearningItem,
} from "./_components/SideBar/ModuleSidebar";
import QuizContainer from "./_blocks/TestContainer/QuizContainer";
import {
  getModuleStructure,
  ModuleStructure,
  ModuleStructureItem,
} from "./service";
import LessonContainer from "./_components/LessonContainer/LessonContainer";
import { useScrollDirection } from "./_hooks/useScrollDirection";
import AnalyticsDrawer from "./_components/Analytics/Analytics";
import {
  getLearningProgress,
  saveLearningProgress,
} from "./service-user-progress";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  const [lessonItems, setLessonItems] = useState<ModuleStructureItem[]>();
  const [module, setModule] = useState<ModuleStructure | null>(null);
  const [activeItem, setActiveItem] = useState<LearningItem | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | undefined>(
    undefined,
  );
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [lessonProgress, setLessonProgress] = useState<
    Record<string, Set<string>>
  >({});
  const [quizProgress, setQuizProgress] = useState<
    Record<string, { completedSteps: number; totalSteps: number }>
  >({});

  const [liveBktMastery, setLiveBktMastery] = useState<Record<string, number>>(
    {},
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const showHeader = useScrollDirection();

  useEffect(() => {
    if (!moduleId) return;

    const loadModuleAndProgress = async () => {
      try {
        setLoading(true);
        setError(false);
        setIsInitialLoad(true);

        // 1. Fetch both the structure and user progress concurrently
        const [structure, progressData] = await Promise.all([
          getModuleStructure(moduleId),
          getLearningProgress(moduleId),
        ]);

        console.log("=== RAW PROGRESS DATA FROM SERVER ===");
        console.log(progressData);
        console.log("=====================================");

        setModule(structure);
        setLessonItems(structure.items);

        const first = structure.items[0] ?? null;
        setActiveItem(first);
        setActiveBlockId(undefined);
        if (first) setVisitedIds(new Set([first.id]));

        // 2. Hydrate progress states if the server returned data
        if (
          progressData &&
          progressData.success &&
          Array.isArray(progressData.data)
        ) {
          const initialLessonProgress: Record<string, Set<string>> = {};
          const initialQuizProgress: Record<
            string,
            { completedSteps: number; totalSteps: number }
          > = {};

          progressData.data.forEach((record: any) => {
            const item = structure.items.find(
              (i) => i.id === record.learning_item_id,
            );
            if (!item) return;

            if (item.type === "lesson") {
              // Reconstruct the Set of visited blocks based on percentage completion
              const totalSteps = ((item as any).lesson_blocks?.length ?? 0) + 2;
              const completedCount = Math.round(
                (record.progress / 100) * totalSteps,
              );

              const dummySet = new Set<string>();
              // Seed it with arbitrary keys matching the count so .size matches perfectly
              for (let i = 0; i < completedCount; i++) {
                dummySet.add(`restored-block-${i}`);
              }
              initialLessonProgress[item.id] = dummySet;
            } else {
              // For quizzes (pretest/posttest)
              initialQuizProgress[item.id] = {
                completedSteps: record.progress === 100 ? 1 : 0, // Customize based on your quiz logic
                totalSteps: 1,
              };
            }
          });

          setLessonProgress(initialLessonProgress);
          setQuizProgress(initialQuizProgress);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
        // Allow syncing tracking back to DB now that hydration is complete
        setIsInitialLoad(false);
      }
    };

    loadModuleAndProgress();
  }, [moduleId]);

  useEffect(() => {
    // 💡 Skip saving if we are reading the initial data from the DB or missing parameters
    if (isInitialLoad || !module || !moduleId) return;

    Object.entries(lessonProgress).forEach(([lessonId, steps]) => {
      const lesson = module?.items.find((i) => i.id === lessonId);
      if (!lesson || lesson.type !== "lesson") return;

      const totalSteps = (lesson.lesson_blocks?.length ?? 0) + 2;

      // Prevent saving mock data structures populated from the initial load hydration
      const containsRestoredKeys = Array.from(steps).some((k) =>
        k.startsWith("restored-block-"),
      );
      if (containsRestoredKeys) return;

      // 💡 Added module_id to the payload argument here
      saveLearningProgress({
        module_id: moduleId,
        learning_item_id: lessonId,
        progress: Math.round((steps.size / totalSteps) * 100),
      });
    });
  }, [lessonProgress, isInitialLoad, module, moduleId]); // 💡 Added moduleId as a dependency

  // 💡 Added: Update callback handler passed into children question elements
  const handleBktUpdate = useCallback(
    (lessonBlockId: string, currentPLt: number) => {
      setLiveBktMastery((prev) => ({
        ...prev,
        [lessonBlockId]: currentPLt,
      }));
    },
    [],
  );

  const goTo = (item: LearningItem, blockId?: string) => {
    setActiveItem(item);
    setActiveBlockId(blockId);
    setVisitedIds((prev) =>
      prev.has(item.id) ? prev : new Set(prev).add(item.id),
    );

    if (item.type === "lesson" && blockId) {
      setLessonProgress((prev) => {
        const current = prev[item.id] ?? new Set<string>();
        if (current.has(blockId)) return prev;

        const next = new Set(current);
        next.add(blockId);

        return { ...prev, [item.id]: next };
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuizProgress = useCallback(
    (itemId: string, completedSteps: number, totalSteps: number) => {
      setQuizProgress((prev) => ({
        ...prev,
        [itemId]: { completedSteps, totalSteps },
      }));
    },
    [],
  );

  const handleNext = () => {
    if (!module || !activeItem) return;

    const currentIndex = module.items.findIndex(
      (item) => item.id === activeItem.id,
    );
    const next = module.items[currentIndex + 1];

    if (next) {
      const initialBlockId = next.type === "lesson" ? "overview" : undefined;
      goTo(next, initialBlockId);
    }
  };

  const handleNextSubRow = () => {
    if (!activeItem) return;

    if (activeItem.type !== "lesson") return;

    const blocks = activeItem.lesson_blocks ?? [];

    if (activeBlockId === "overview") {
      if (blocks.length > 0) {
        goTo(activeItem, blocks[0].id);
      } else {
        goTo(activeItem, "quiz");
      }
      return;
    }

    const currentBlockIndex = blocks.findIndex((b) => b.id === activeBlockId);

    if (currentBlockIndex !== -1) {
      if (currentBlockIndex < blocks.length - 1) {
        goTo(activeItem, blocks[currentBlockIndex + 1].id);
      } else {
        goTo(activeItem, "quiz");
      }
      return;
    }

    if (activeBlockId === "quiz") {
      if (!module) return;
      const currentItemIndex = module.items.findIndex(
        (item) => item.id === activeItem.id,
      );
      if (
        currentItemIndex !== -1 &&
        currentItemIndex < module.items.length - 1
      ) {
        const nextItem = module.items[currentItemIndex + 1];
        goTo(nextItem, nextItem.type === "lesson" ? "overview" : undefined);
      }
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

  const itemsWithProgress = module.items.map((item) => {
    const learningItem = item as LearningItem;

    if (item.type === "lesson") {
      const blocks = learningItem.lesson_blocks ?? [];
      return {
        ...item,
        totalSteps: blocks.length + 2,
        completedSteps: lessonProgress[item.id]?.size ?? 0,
      };
    }

    const progress = quizProgress[item.id];
    return {
      ...item,
      totalSteps: progress?.totalSteps,
      completedSteps: progress?.completedSteps,
    };
  });

  const activeItemData = itemsWithProgress.find(
    (item) => item.id === activeItem.id,
  );

  return (
    <main className="min-h-screen">
      <ModuleSidebar
        courseId={module.courseId}
        moduleId={moduleId}
        structureTitle={module.title}
        items={itemsWithProgress}
        activeItem={activeItem}
        activeBlockId={activeBlockId}
        onNavigate={goTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div
        className={`fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-zinc-200 bg-white px-4 transition-transform duration-200 lg:hidden ${
          showHeader ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50"
        >
          <Menu size={20} />
        </button>
        <span className="ml-3 truncate text-sm font-semibold text-zinc-900">
          {module.title}
        </span>
      </div>

      <div
        className={`h-screen max-h-screen transition-all duration-300 pt-14 lg:pt-0 ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}`}
      >
        {module.items.map((item) => {
          const isCurrentlyActive = item.id === activeItem.id;

          return (
            <div
              key={item.id}
              className={isCurrentlyActive ? "h-full" : "hidden"}
            >
              {item.type === "pretest" && (
                <QuizContainer
                  itemId={item.id}
                  moduleId={moduleId}
                  type="pretest"
                  onProgressChange={handleQuizProgress}
                  onContinue={handleNext}
                />
              )}
              {item.type === "lesson" && (
                <LessonContainer
                  lessonItems={lessonItems}
                  lessonId={item.id}
                  activeBlockId={activeBlockId}
                  onContinue={handleNext}
                  handleNextSubRow={handleNextSubRow}
                  onBktUpdate={handleBktUpdate}
                />
              )}
              {item.type === "posttest" && (
                <QuizContainer
                  itemId={item.id}
                  moduleId={moduleId}
                  type="posttest"
                  onProgressChange={handleQuizProgress}
                  onContinue={() => console.log("Course Completed")}
                />
              )}
            </div>
          );
        })}
      </div>

      <AnalyticsDrawer
        moduleId={moduleId}
        lessonProgress={lessonProgress}
        quizProgress={quizProgress}
        activeItem={activeItemData}
        liveBktMastery={liveBktMastery}
      />
    </main>
  );
};

export default LearnPage;
