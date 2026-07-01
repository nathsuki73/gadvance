"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { Loader2, Menu } from "lucide-react";

import ModuleSidebar from "./_components/SideBar/ModuleSidebar";
import QuizContainer from "./_blocks/TestContainer/QuizContainer";
// import LessonContainer from "./_blocks/LessonContainer/LessonContainer";
import { getModuleStructure } from "./service";
import { LearningItem } from "./types";

type LearnPageProps = {
  params: Promise<{ moduleId: string }>;
};

type ModuleStructure = {
  id: string;
  title: string;
  items: LearningItem[];
};

const LearnPage = ({ params }: LearnPageProps) => {
  const { moduleId } = use(params);

  const [module, setModule] = useState<ModuleStructure | null>(null);
  const [activeItem, setActiveItem] = useState<LearningItem | null>(null);

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

        console.log(structure);
        setModule(structure);
        setActiveItem(structure.items[0] ?? null);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId]);

  const goTo = (item: LearningItem) => {
    setActiveItem(item);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    if (!module || !activeItem) return;

    const currentIndex = module.items.findIndex(
      (item) => item.id === activeItem.id,
    );

    const next = module.items[currentIndex + 1];

    if (next) {
      setActiveItem(next);
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
        moduleId={moduleId}
        structureTitle={module.title}
        items={module.items}
        activeItem={activeItem}
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
        className={`h-screen transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-16" : "lg:pl-80"
        }`}
      >
        {activeItem.type === "pretest" && (
          <QuizContainer moduleId={activeItem.id} onContinue={handleNext} />
        )}

        {/* {activeItem.type === "lesson" && (
          <LessonContainer lessonId={activeItem.id} onContinue={handleNext} />
        )} */}

        {/* {activeItem.type === "posttest" && (
          <QuizContainer
            testId={activeItem.id}
            type="posttest"
            onContinue={() => {
              console.log("Course Completed");
            }}
          />
        )} */}
      </div>
    </main>
  );
};

export default LearnPage;
