"use client";

import React, { useMemo, useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import { BlockRenderer, type ModuleBlock } from "@/app/components/moduleViewer";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock3,
  Globe,
  Heart,
  Search,
  Target,
  Users,
  X,
} from "lucide-react";
import { courseModules, type CourseModule } from "@/app/lib/courseModules";

type ModuleNavItem = {
  id: string;
  label: string;
  children?: ModuleNavItem[];
  isModule?: boolean;
};

const iconByType = {
  globe: Globe,
  briefcase: Briefcase,
  target: Target,
  wellness: Heart,
} as const;

const getBlockLabel = (block: ModuleBlock): string => {
  switch (block.type) {
    case "title":
      return (block as any).text || "Title";
    case "section":
      return (block as any).title || "Section";
    case "paragraph":
      return (block as any).text?.substring(0, 50) || "Paragraph";
    case "video":
      return (block as any).title || "Video";
    case "quiz":
      return (block as any).question || "Quiz";
    case "game":
      return (block as any).title || "Game";
    default:
      return "Block";
  }
};

const getBlockAnchorId = (block: ModuleBlock, index: number): string => {
  const rawId =
    typeof block.id === "string" || typeof block.id === "number"
      ? String(block.id)
      : `${block.type}-${index}`;
  return `module-block-${rawId}`;
};

const buildModuleNavItems = (selectedModule: CourseModule | undefined): ModuleNavItem[] => {
  if (!selectedModule) return [];
  
  const modules: ModuleNavItem[] = [];
  let currentModuleTitle = "";
  let currentModuleChildren: ModuleNavItem[] = [];
  let currentModuleId = "";
  
  selectedModule.blocks.forEach((block, index) => {
    const blockId = getBlockAnchorId(block, index);
    const blockLabel = getBlockLabel(block);
    
    // Check if this is a module title block (type "title" containing "Module")
    if (block.type === "title" && (block as any).text?.includes("Module")) {
      // Save previous module if exists
      if (currentModuleTitle) {
        modules.push({
          id: currentModuleId,
          label: currentModuleTitle,
          children: currentModuleChildren,
          isModule: true,
        });
      }
      // Start new module
      currentModuleTitle = blockLabel;
      currentModuleId = blockId;
      currentModuleChildren = [];
    } else {
      // Add block as child of current module
      currentModuleChildren.push({
        id: blockId,
        label: blockLabel,
      });
    }
  });
  
  // Don't forget the last module
  if (currentModuleTitle) {
    modules.push({
      id: currentModuleId,
      label: currentModuleTitle,
      children: currentModuleChildren,
      isModule: true,
    });
  }
  
  return modules;
};

const CourseCard = ({
  module,
  onClick,
}: {
  module: CourseModule;
  onClick: () => void;
}) => {
  const Icon = iconByType[module.icon];
  const { data: session } = useSession();

  const handleEnrollClick = () => {
    if (!session?.user) {
      // User is not authenticated, redirect to sign in page
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/workspace/courses?moduleId=${module.id}`)}`;
      return;
    }
    // User is authenticated, proceed with onClick
    onClick();
  };

  return (
    <article className="group flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ backgroundColor: module.accent }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{
              backgroundColor: "#bceee6",
              color: "#056f64",
            }}
          >
            {module.tag}
          </span>
        </div>
      </div>

      <div>
        <h3 className="text-[2.05rem] font-black tracking-tight text-zinc-900">
          {module.title}
        </h3>
        <p className="mt-2 text-[1.15rem] leading-relaxed text-zinc-600">
          {module.description}
        </p>
      </div>

      <div className="flex items-center gap-5 text-[1.05rem] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={15} className="text-zinc-500" />
          {module.duration}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={15} className="text-zinc-500" />
          {module.enrolled} learners enrolled
        </span>
      </div>

      <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-900">New enrollment</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          Start here with no prior progress required. We’ll guide you from the
          basics forward.
        </p>
      </div>

      <div className="mt-1">
        <button
          type="button"
          onClick={handleEnrollClick}
          className="w-full rounded-lg px-4 py-2.5 text-center text-base font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: module.accent }}
        >
          <span className="inline-flex items-center gap-1.5">
            Enroll
            <ArrowUpRight size={15} />
          </span>
        </button>
      </div>
    </article>
  );
};

const Workspace = () => {
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [activeNavId, setActiveNavId] = useState<string>("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isStartHereCollapsed, setIsStartHereCollapsed] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const selectedModule = courseModules.find((m) => m.id === selectedModuleId);
  const moduleNavItems = useMemo(
    () => buildModuleNavItems(selectedModule),
    [selectedModule],
  );

  const displayedNavId = activeNavId || (moduleNavItems[0]?.children?.[0]?.id) || "";

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleModuleNavClick = (navId: string) => {
    setActiveNavId(navId);
    const target = document.getElementById(navId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileNavOpen(false);
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-[#f4f4f6] font-sans text-zinc-900">
        <Header />

        <main className="mx-auto max-w-380 px-6 py-10">
          <button
            onClick={() => {
              setSelectedModuleId(null);
              setActiveNavId("");
              setIsMobileNavOpen(false);
              setIsStartHereCollapsed(false);
              setExpandedModules(new Set());
            }}
            className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <ArrowLeft size={16} />
            Back to courses
          </button>

          <article className={`rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 md:p-9 ${
              isStartHereCollapsed ? "lg:ml-16" : "lg:ml-80"
            }`}>
            <header className="mb-6 border-b border-zinc-100 pb-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  Module {selectedModule.id}
                </span>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                  New enrollment
                </span>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {selectedModule.duration}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-[2.6rem]">
                {selectedModule.title}
              </h1>
              <p className="mt-2 max-w-3xl text-zinc-600">
                {selectedModule.description}
              </p>
            </header>

            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className={`fixed left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-lg border border-l-0 border-zinc-200 bg-[#f7f8fa] p-2.5 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-100 lg:hidden ${
                isMobileNavOpen
                  ? "pointer-events-none opacity-0"
                  : "opacity-100"
              }`}
              aria-label="Open module structure"
            >
              <ChevronRight size={18} />
            </button>

            <div className="relative">
              <aside
                className={`fixed left-0 top-0 z-20 hidden h-screen overflow-hidden border-r border-zinc-200 bg-[#f7f8fa] shadow-sm transition-all duration-300 lg:block ${
                  isStartHereCollapsed ? "w-16" : "w-80"
                }`}
              >
                <div className="flex h-full flex-col px-4 pb-4 pt-24">
                  <div
                    className={`flex items-start gap-3 ${
                      isStartHereCollapsed
                        ? "justify-center"
                        : "justify-between"
                    }`}
                  >
                    {!isStartHereCollapsed ? (
                      <div>
                        <h2 className="text-xl font-bold text-zinc-900">
                          {selectedModule.title}
                        </h2>
                      </div>
                    ) : (
                      <BookOpen size={20} className="text-zinc-900" />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setIsStartHereCollapsed((current) => !current)
                      }
                      className="rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700 transition-colors hover:bg-zinc-50"
                      aria-label={
                        isStartHereCollapsed
                          ? "Expand start here panel"
                          : "Collapse start here panel"
                      }
                    >
                      {isStartHereCollapsed ? (
                        <ChevronRight size={16} />
                      ) : (
                        <ChevronLeft size={16} />
                      )}
                    </button>
                  </div>

                  {!isStartHereCollapsed && (
                    <div className="mt-5 space-y-2 overflow-y-auto pr-1">
                      {moduleNavItems.map((item) => {
                        const isModuleExpanded = expandedModules.has(item.id);
                        const hasChildren = item.children && item.children.length > 0;
                        return (
                          <div key={item.id}>
                            <button
                              type="button"
                              onClick={() =>
                                item.isModule
                                  ? toggleModuleExpanded(item.id)
                                  : handleModuleNavClick(item.id)
                              }
                              className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors"
                              style={{
                                borderColor: selectedModule.accent,
                                backgroundColor: item.isModule ? `${selectedModule.accent}0A` : "#ffffff",
                                color: item.isModule ? selectedModule.accent : "#111827",
                              }}
                            >
                              <span>{item.label}</span>
                              {hasChildren && (
                                <ChevronRight
                                  size={14}
                                  className={`transition-transform ${
                                    isModuleExpanded ? "rotate-90" : ""
                                  }`}
                                />
                              )}
                            </button>
                            {item.isModule && isModuleExpanded && hasChildren && (
                              <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-2">
                              {item.children?.map((child) => {
                                  const isActive = child.id === displayedNavId;
                                  return (
                                    <button
                                      key={child.id}
                                      type="button"
                                      onClick={() => handleModuleNavClick(child.id)}
                                      className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors"
                                      style=
                                      {{
                                        borderColor: isActive ? selectedModule.accent : "#e4e4e7",
                                        backgroundColor: isActive ? `${selectedModule.accent}1A` : "#ffffff",
                                        color: isActive ? selectedModule.accent : "#111827",
                                      }}
                                    >
                                      <Circle size={12} className="shrink-0" />
                                      <span>{child.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>

              <div className="space-y-5">
                {selectedModule.blocks.map((block, index) => {
                  const anchorId = getBlockAnchorId(block, index);
                  const key = block.id ?? `${block.type}-${index}`;
                  return (
                    <section key={key} id={anchorId} className="scroll-mt-24">
                      <BlockRenderer block={block} />
                    </section>
                  );
                })}
              </div>
            </div>

            <div
              className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
                isMobileNavOpen
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!isMobileNavOpen}
            >
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
                className="absolute inset-0 bg-black/35"
                aria-label="Close module structure"
              />

              <aside
                className={`absolute left-0 top-0 h-full w-[84%] max-w-sm border-r border-zinc-200 bg-[#f7f8fa] p-4 shadow-xl transition-transform duration-300 ${
                  isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {selectedModule.title}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700"
                    aria-label="Close navigation panel"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {moduleNavItems.map((item) => {
                    const isModuleExpanded = expandedModules.has(item.id);
                    const hasChildren = item.children && item.children.length > 0;
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          onClick={() =>
                            item.isModule
                              ? toggleModuleExpanded(item.id)
                              : handleModuleNavClick(item.id)
                          }
                          className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-semibold transition-colors"
                          style={{
                            borderColor: selectedModule.accent,
                            backgroundColor: item.isModule ? `${selectedModule.accent}0A` : "#ffffff",
                            color: item.isModule ? selectedModule.accent : "#111827",
                          }}
                        >
                          <span>{item.label}</span>
                          {hasChildren && (
                            <ChevronRight
                              size={14}
                              className={`transition-transform ${
                                isModuleExpanded ? "rotate-90" : ""
                              }`}
                            />
                          )}
                        </button>
                        {item.isModule && isModuleExpanded && hasChildren && (
                          <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-2">
                            {item.children?.map((child) => {
                              const isActive = child.id === displayedNavId;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => handleModuleNavClick(child.id)}
                                  className="flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors"
                                  style={{
                                    borderColor: isActive ? selectedModule.accent : "#e4e4e7",
                                    backgroundColor: isActive ? `${selectedModule.accent}1A` : "#ffffff",
                                    color: isActive ? selectedModule.accent : "#111827",
                                  }}
                                >
                                  <Circle size={12} className="shrink-0" />
                                  <span>{child.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>
          </article>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f6] font-sans text-zinc-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-12 rounded-[40px] border border-zinc-100 bg-white p-10 shadow-sm">
          <div className="max-w-2xl">
            <h1 className="mb-6 text-4xl font-black tracking-tight">
              What will you learn today?
            </h1>
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search learning"
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-4 pl-12 pr-4 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
          </div>
        </div>

        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-3xl font-black tracking-tight">
            Educational Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {courseModules.map((module) => (
            <CourseCard
              key={module.id}
              module={module}
              onClick={() => {
                setSelectedModuleId(module.id);
                setActiveNavId("");
                setIsMobileNavOpen(false);
                setIsStartHereCollapsed(false);
                setExpandedModules(new Set([`module-${module.id}`]));
              }}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Workspace;
