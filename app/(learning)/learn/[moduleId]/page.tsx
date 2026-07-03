"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar, {
  LearningItem,
} from "./_components/SideBar/ModuleSidebar";
import QuizContainer from "./_blocks/TestContainer/QuizContainer";
// import LessonContainer from "./_blocks/LessonContainer/LessonContainer";
import {
  getModuleStructure,
  ModuleStructure,
  ModuleStructureItem,
} from "./service";
import LessonContainer from "./_components/LessonContainer/LessonContainer";

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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!moduleId) return;

    const loadModule = async () => {
      try {
        setLoading(true);
        setError(false);

        const structure = await getModuleStructure(moduleId);
        setModule(structure);
        const first = structure.items[0] ?? null;
        setLessonItems(structure.items);
        setActiveItem(first);
        setActiveBlockId(undefined);
        if (first) setVisitedIds(new Set([first.id]));
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const goTo = (item: LearningItem, blockId?: string) => {
    setActiveItem(item);
    setActiveBlockId(blockId);
    setVisitedIds((prev) =>
      prev.has(item.id) ? prev : new Set(prev).add(item.id),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    if (!module || !activeItem) return;

    const currentIndex = module.items.findIndex(
      (item) => item.id === activeItem.id,
    );
    const next = module.items[currentIndex + 1];

    if (next) {
      // If the next item is a lesson, initialize it at the "overview" subrow
      const initialBlockId = next.type === "lesson" ? "overview" : undefined;
      goTo(next, initialBlockId);
    }
  };

  const handleNextSubRow = () => {
    if (!activeItem) return;

    if (activeItem.type !== "lesson") return;

    const blocks = activeItem.lesson_blocks ?? [];

    // 1. If currently on overview, go to the first block (if it exists) or the quiz
    if (activeBlockId === "overview") {
      if (blocks.length > 0) {
        goTo(activeItem, blocks[0].id);
      } else {
        goTo(activeItem, "quiz");
      }
      return;
    }

    // 2. If currently on one of the lesson blocks, find its index
    const currentBlockIndex = blocks.findIndex((b) => b.id === activeBlockId);

    if (currentBlockIndex !== -1) {
      // If there is another block after this one, go to it
      if (currentBlockIndex < blocks.length - 1) {
        goTo(activeItem, blocks[currentBlockIndex + 1].id);
      } else {
        // Otherwise, we reached the end of the blocks array, go to quiz
        goTo(activeItem, "quiz");
      }
      return;
    }

    // 3. If currently on the quiz, we have reached the end of this lesson
    if (activeBlockId === "quiz") {
      // Optional: Find the next main item in the 'items' array
      if (!module) return;
      const currentItemIndex = module.items.findIndex(
        (item) => item.id === activeItem.id,
      );
      if (
        currentItemIndex !== -1 &&
        currentItemIndex < module.items.length - 1
      ) {
        const nextItem = module.items[currentItemIndex + 1];
        // Automatically jump to the overview of the next lesson/item
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

  return (
    <main className="min-h-screen">
      <ModuleSidebar
        courseId={module.courseId}
        moduleId={moduleId}
        structureTitle={module.title}
        items={module.items}
        activeItem={activeItem}
        activeBlockId={activeBlockId}
        onNavigate={goTo}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="sticky top-0 z-30 flex h-14 items-center border-b border-zinc-200 px-4 lg:hidden">
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
        className={`h-screen max-h-screen transition-all duration-300 ${isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"}`}
      >
        {module.items
          .filter((item) => visitedIds.has(item.id))
          .map((item) => (
            <div
              key={item.id}
              className={item.id === activeItem.id ? "h-full" : "hidden"}
            >
              {item.type === "pretest" && (
                <QuizContainer
                  moduleId={item.id}
                  type="pretest"
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
                />
              )}
              {item.type === "posttest" && (
                <QuizContainer
                  moduleId={item.id}
                  type="posttest"
                  onContinue={() => console.log("Course Completed")}
                />
              )}
            </div>
          ))}
      </div>
    </main>
  );
};

export default LearnPage;
