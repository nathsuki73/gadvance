"use client";

import React, { useEffect, useMemo, useState } from "react";
import Footer from "@/app/components/Footer";
import Header from "@/app/components/Header";
import Pretest from "@/app/components/pretest";
import { BlockRenderer, type ModuleBlock } from "@/app/components/moduleViewer";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  isPretest?: boolean;
};

type ModuleArticle = {
  id: string;
  label: string;
  blocks: Array<{
    block: ModuleBlock;
    index: number;
    anchorId: string;
    key: string;
  }>;
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

const isModuleTitleBlock = (block: ModuleBlock): boolean =>
  block.type === "title" &&
  typeof (block as any).text === "string" &&
  (block as any).text.includes("Module");

const buildModuleArticles = (
  selectedModule: CourseModule | undefined,
): ModuleArticle[] => {
  if (!selectedModule) return [];

  const articles: ModuleArticle[] = [];
  let currentArticle: ModuleArticle | null = null;

  selectedModule.blocks.forEach((block, index) => {
    const anchorId = getBlockAnchorId(block, index);
    const blockEntry = {
      block,
      index,
      anchorId,
      key: String(block.id ?? `${block.type}-${index}`),
    };

    if (isModuleTitleBlock(block)) {
      if (currentArticle) {
        articles.push(currentArticle);
      }

      currentArticle = {
        id: `module-article-${anchorId}`,
        label: getBlockLabel(block),
        blocks: [blockEntry],
      };
      return;
    }

    if (!currentArticle) {
      currentArticle = {
        id: `module-article-${selectedModule.id}`,
        label: selectedModule.title,
        blocks: [],
      };
    }

    currentArticle.blocks.push(blockEntry);
  });

  if (currentArticle) {
    articles.push(currentArticle);
  }

  return articles;
};

const buildModuleNavItems = (
  selectedModule: CourseModule | undefined,
): ModuleNavItem[] => {
  return buildModuleArticles(selectedModule).map((article) => ({
    id: article.id,
    label: article.label,
    children: article.blocks.slice(1).map((entry) => ({
      id: entry.anchorId,
      label: getBlockLabel(entry.block),
    })),
    isModule: true,
  }));
};

const getModuleNumberFromLabel = (label: string): number | null => {
  const match = label.match(/Module\s+(\d+)/i);
  return match ? Number(match[1]) : null;
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
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/workspace/module?courseId=${module.id}`)}`;
      return;
    }
    // User is authenticated, redirect to module page
    window.location.href = `/workspace/module?courseId=${module.id}`;
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
        <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900">
          {module.title}
        </h3>
        <p className="mt-2 text-sm sm:text-md md:text-md lg:text-lg leading-relaxed text-zinc-600">
          {module.description}
        </p>
      </div>

      <div className="flex items-center gap-5 text-[1.05rem] text-zinc-500">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 size={15} className="text-zinc-500" />
          <p className="text-sm sm:text-md md:text-md lg:text-lg">
            {module.duration}
          </p>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={15} className="text-zinc-500" />
          <p className="text-sm sm:text-md md:text-md lg:text-lg">
            {module.enrolled} learners enrolled
          </p>
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
  const searchParams = useSearchParams();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [isPretestCompleted, setIsPretestCompleted] = useState(false);
  const [subsectionsLocked, setSubsectionsLocked] = useState(false);
  const [pendingPretestNavId, setPendingPretestNavId] = useState<string | null>(
    null,
  );
  const [completedPretests, setCompletedPretests] = useState<Set<string>>(
    new Set(),
  );
  const [activeNavId, setActiveNavId] = useState<string>("");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );
  const [pendingScrollTargetId, setPendingScrollTargetId] = useState<
    string | null
  >(null);
  const [isStructureCollapsed, setIsStructureCollapsed] = useState(false);

  const selectedModule = courseModules.find((m) => m.id === selectedModuleId);
  const requestedModuleNumber = searchParams.get("module")
    ? Number(searchParams.get("module"))
    : null;
  const moduleArticles = useMemo(
    () => buildModuleArticles(selectedModule),
    [selectedModule],
  );
  const moduleNavItems = useMemo(
    () => buildModuleNavItems(selectedModule),
    [selectedModule],
  );
  const activeModuleArticle = useMemo(() => {
    if (!requestedModuleNumber) {
      return null;
    }

    return (
      moduleArticles.find(
        (article) =>
          getModuleNumberFromLabel(article.label) === requestedModuleNumber,
      ) || null
    );
  }, [moduleArticles, requestedModuleNumber]);

  const visibleModuleArticles = useMemo(
    () => (activeModuleArticle ? [activeModuleArticle] : moduleArticles),
    [activeModuleArticle, moduleArticles],
  );

  const visibleModuleNavItems = useMemo(
    () =>
      activeModuleArticle
        ? moduleNavItems.filter((item) => item.id === activeModuleArticle.id)
        : moduleNavItems,
    [activeModuleArticle, moduleNavItems],
  );
  const visibleStructureItems: ModuleNavItem[] = useMemo(
    () =>
      visibleModuleNavItems.map((item) => {
        if (!item.isModule || !selectedModule) {
          return item;
        }

        return {
          ...item,
          children: [
            {
              id: `pretest-${selectedModule.id}`,
              label: "Pretest",
              isPretest: true,
            },
            ...(item.children ?? []),
          ],
        };
      }),
    [selectedModule, visibleModuleNavItems],
  );

  const displayedNavId =
    activeNavId || visibleModuleNavItems[0]?.children?.[0]?.id || "";
  //this is for the title of the structure sidebar, it will show the article title if an article is active, otherwise it will show the module title
  const structureTitle =
    activeModuleArticle?.label || selectedModule?.title || "";
  const desktopContentOffsetClass = isStructureCollapsed
    ? "lg:ml-16"
    : "lg:ml-80";

  // Auto-expand modules when they load
  useEffect(() => {
    if (visibleModuleNavItems.length > 0) {
      setExpandedModules(new Set(visibleModuleNavItems.map((item) => item.id)));
    }
  }, [visibleModuleNavItems]);

  useEffect(() => {
    const moduleId = searchParams.get("moduleId");
    if (moduleId) {
      setSelectedModuleId(Number(moduleId));
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      !selectedModule ||
      !requestedModuleNumber ||
      visibleModuleArticles.length === 0
    ) {
      return;
    }

    const targetArticle = visibleModuleArticles[0];

    if (targetArticle) {
      setActiveNavId(targetArticle.id);
      window.setTimeout(() => {
        document.getElementById(targetArticle.id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }, [requestedModuleNumber, selectedModule, visibleModuleArticles]);

  useEffect(() => {
    if (!isPretestCompleted || !pendingScrollTargetId) {
      return;
    }

    // window.setTimeout(() => {
    //   const el = document.getElementById(pendingScrollTargetId!);
    //   if (el) {
    //     el.scrollIntoView({ behavior: "smooth", block: "start" });
    //     // add animation class then remove after animation ends
    //     el.classList.remove("subsection-animate");
    //     // force reflow to restart animation if present
    //     // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //     el.offsetWidth;
    //     el.classList.add("subsection-animate");
    //     window.setTimeout(() => {
    //       el.classList.remove("subsection-animate");
    //     }, 1300);
    //   }
    // }, 0);
    const scrollToSecond = () => {
      const element = document.getElementById("mainPanel");
      element?.scrollIntoView({ behavior: "smooth" });
    };

    setPendingScrollTargetId(null);
  }, [isPretestCompleted, pendingScrollTargetId]);

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
  };

  const handlePretestComplete = () => {
    if (selectedModuleId !== null && pendingPretestNavId) {
      const pretestKey = `${selectedModuleId}:${pendingPretestNavId}`;
      setCompletedPretests((prev) => new Set(prev).add(pretestKey));
    }

    const firstSubsectionId =
      visibleModuleNavItems[0]?.children?.[0]?.id ?? null;
    setPendingPretestNavId(null);
    setPendingScrollTargetId(firstSubsectionId);
    setIsPretestCompleted(true);
    setSubsectionsLocked(false);
  };

  const launchPretestForCurrentModule = () => {
    const targetNavId = visibleModuleArticles[0]?.id;
    if (!targetNavId) {
      return;
    }

    setPendingPretestNavId(targetNavId);
    setIsPretestCompleted(false);
  };

  if (selectedModule) {
    return (
      <div className="min-h-screen bg-white font-sans text-zinc-900">
        {/* <Header /> */}

        <div className="mx-auto flex w-full max-w-380 justify-end px-6 pt-3">
          <button
            onClick={() => {
              setSelectedModuleId(null);
              setActiveNavId("");
              setIsMobileNavOpen(false);
              setExpandedModules(new Set());
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200"
          >
            <ArrowLeft size={16} />
            Exit course
          </button>
        </div>

        <main id="panel-2" className="mx-auto max-w-380 px-6 pb-10 pt-4">
          <div className="relative min-h-[70vh]">
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

            <aside
              className={`fixed left-0 top-0 z-20 hidden h-screen overflow-hidden border-r border-zinc-200 bg-[#f7f8fa] shadow-sm transition-all duration-300 lg:block ${
                isStructureCollapsed ? "w-16" : "w-80"
              }`}
            >
              <div className="flex h-full flex-col px-4 pb-4 pt-6">
                <div className="flex items-start justify-between gap-3">
                  {!isStructureCollapsed && (
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900">
                        {structureTitle}
                      </h2>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsStructureCollapsed((prev) => !prev)}
                    className="ml-auto inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-200"
                    aria-label={
                      isStructureCollapsed
                        ? "Expand structure"
                        : "Collapse structure"
                    }
                  >
                    {isStructureCollapsed ? (
                      <ChevronRight size={16} />
                    ) : (
                      <ChevronLeft size={16} />
                    )}
                  </button>
                </div>

                {!isStructureCollapsed && selectedModule && (
                  <div className="mt-5 space-y-1">
                    <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-cyan-950 transition-all duration-300"
                        style={{ width: "0%" }}
                      />
                    </div>
                    <p className="text-xs text-zinc-500">0% completed</p>
                  </div>
                )}

                {!isStructureCollapsed && (
                  <div className="mt-5 space-y-2 overflow-y-auto pr-1">
                    {visibleStructureItems.map((item) => {
                      const isModuleExpanded = expandedModules.has(item.id);
                      const hasChildren =
                        item.children && item.children.length > 0;
                      return (
                        <div key={item.id}>
                          <button
                            type="button"
                            onClick={() => {
                              if (item.isPretest) {
                                launchPretestForCurrentModule();
                                setActiveNavId(item.id);
                                return;
                              }

                              if (item.isModule) {
                                toggleModuleExpanded(item.id);
                              }
                              handleModuleNavClick(item.id);
                            }}
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 gap-x-4 text-left text-sm font-semibold transition-colors"
                            style={{
                              backgroundColor: item.isPretest
                                ? `#ffffff`
                                : item.isModule
                                  ? `#ffffff`
                                  : "#ffffff",
                              color: item.isPretest
                                ? "#083344"
                                : item.isModule
                                  ? "#083344"
                                  : "#111827",
                            }}
                          >
                            {hasChildren && (
                              <ChevronRight
                                size={14}
                                className={`transition-transform ${
                                  isModuleExpanded ? "rotate-90" : ""
                                }`}
                              />
                            )}
                            <span>{item.label}</span>
                          </button>
                          {item.isModule && isModuleExpanded && hasChildren && (
                            <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-2">
                              {item.children?.map((child) => {
                                const isActive = child.id === displayedNavId;
                                return (
                                  <button
                                    key={child.id}
                                    type="button"
                                    onClick={() => {
                                      if (
                                        subsectionsLocked &&
                                        !child.isPretest
                                      ) {
                                        // prevent navigating to subsections if locked
                                        return;
                                      }
                                      if (child.isPretest) {
                                        launchPretestForCurrentModule();
                                        setActiveNavId(child.id);
                                        return;
                                      }

                                      handleModuleNavClick(child.id);
                                    }}
                                    className="relative flex w-full items-center gap-2 rounded-md px-3 py-2 pl-5 text-left text-xs font-medium transition-colors"
                                    style={{
                                      backgroundColor: isActive
                                        ? `${selectedModule.accent}0A`
                                        : "#ffffff",
                                      color: isActive ? "#083344" : "#111827",
                                    }}
                                  >
                                    <div
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-1 rounded-r opacity-75"
                                      style={{
                                        backgroundColor: isActive
                                          ? "#083344"
                                          : "transparent",
                                      }}
                                    />
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

            <div
              className={`space-y-5 transition-all duration-300 ${desktopContentOffsetClass}`}
            >
              {!isPretestCompleted ? (
                <div className="rounded-3xl bg-white md:p-9">
                  <Pretest
                    isOpen
                    onClose={(hasAnswered?: boolean) => {
                      setPendingPretestNavId(null);
                      // Determine if a pretest for this module was already completed
                      const pretestKey =
                        selectedModuleId !== null
                          ? `${selectedModuleId}:${visibleModuleArticles[0]?.id}`
                          : null;
                      const alreadyCompleted = pretestKey
                        ? completedPretests.has(pretestKey)
                        : false;

                      // Unlock if user answered in this session or the pretest was already completed
                      if (hasAnswered || alreadyCompleted) {
                        setSubsectionsLocked(false);
                      } else {
                        setSubsectionsLocked(true);
                      }

                      setIsPretestCompleted(true);
                      setIsMobileNavOpen(false);
                    }}
                    onComplete={handlePretestComplete}
                    moduleTitle={selectedModule.title}
                    accentColor={selectedModule.accent}
                  />
                </div>
              ) : (
                visibleModuleArticles.map((article) => (
                  <article
                    key={article.id}
                    id={article.id}
                    className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 md:p-9"
                  >
                    <header className="mb-6 border-b border-zinc-100 pb-4">
                      <div className="flex flex-wrap items-center gap-3" />
                      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 md:text-[2.6rem]">
                        {article.label}
                      </h1>
                    </header>

                    <div className="space-y-5">
                      {article.blocks.map(({ block, anchorId, key }) => (
                        <section
                          key={key}
                          id={anchorId}
                          className="scroll-mt-24"
                        >
                          <BlockRenderer block={block} />
                        </section>
                      ))}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div
            className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
              isMobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"
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
              className={`absolute left-0 top-0 h-full w-[90vw] sm:w-80 border-r border-zinc-200 bg-[#f7f8fa] shadow-xl transition-transform duration-300 overflow-y-auto overflow-x-hidden flex flex-col ${
                isMobileNavOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="sticky top-0 mb-4 flex items-center justify-between bg-[#f7f8fa] px-4 pt-4 pb-2">
                <h2 className="text-lg font-bold text-zinc-900 truncate">
                  {structureTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="shrink-0 rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700"
                  aria-label="Close navigation panel"
                >
                  <X size={16} />
                </button>
              </div>

              {selectedModule && (
                <div className="px-4 py-3 space-y-1 border-b border-zinc-200">
                  <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-950 transition-all duration-300"
                      style={{ width: "0%" }}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">0% completed</p>
                </div>
              )}

              {/* Mobile Structure */}
              <div className="space-y-2 px-4 pb-4">
                {visibleStructureItems.map((item) => {
                  const isModuleExpanded = expandedModules.has(item.id);
                  const hasChildren = item.children && item.children.length > 0;
                  const moduleHasActiveChild =
                    item.children?.some((c) => c.id === displayedNavId) ??
                    false;
                  return (
                    <div key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.isModule) {
                            toggleModuleExpanded(item.id);
                          }
                          if (item.isPretest) {
                            launchPretestForCurrentModule();
                            setActiveNavId(item.id);
                          } else {
                            handleModuleNavClick(item.id);
                          }
                          setIsMobileNavOpen(false);
                        }}
                        className="relative flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors"
                        style={{
                          backgroundColor: item.isModule
                            ? `#ffffff`
                            : item.isPretest
                              ? "#08334414"
                              : "#ffffff",
                          color:
                            item.isModule || item.isPretest
                              ? "#083344"
                              : "#111827",
                        }}
                      >
                        {hasChildren && (
                          <ChevronRight
                            size={14}
                            className={`shrink-0 transition-transform ${
                              isModuleExpanded ? "rotate-90" : ""
                            }`}
                          />
                        )}
                        <span className="truncate">{item.label}</span>
                      </button>
                      {item.isModule && isModuleExpanded && hasChildren && (
                        <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-2">
                          {item.children?.map((child) => {
                            const isActive = child.id === displayedNavId;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => {
                                  if (subsectionsLocked && !child.isPretest) {
                                    return;
                                  }
                                  if (child.isPretest) {
                                    launchPretestForCurrentModule();
                                    setActiveNavId(child.id);
                                    setIsMobileNavOpen(false);
                                    return;
                                  }

                                  handleModuleNavClick(child.id);
                                  setIsMobileNavOpen(false);
                                }}
                                className="relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium transition-colors"
                                style={{
                                  backgroundColor: isActive
                                    ? "#0833441A"
                                    : "#ffffff",
                                  color: isActive ? "#083344" : "#111827",
                                }}
                              >
                                <div
                                  className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r shrink-0"
                                  style={{
                                    backgroundColor: isActive
                                      ? "#083344"
                                      : "transparent",
                                  }}
                                />
                                <Circle size={12} className="shrink-0" />
                                <span className="truncate">{child.label}</span>
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12 bg-white">
          <div className="mb-12 bg-white">
            <div className="max-w-7xl">
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
                What will you learn today?
              </h1>

              <div className="group relative">
                {/* Search Icon with dynamic color on parent hover */}
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-teal-600"
                  size={20}
                />

                <input
                  type="text"
                  placeholder="Search for courses, skills, or topics..."
                  className="w-full rounded-2xl border border-zinc-200 bg-white py-4 pl-12 pr-24 
                   text-base text-zinc-900 shadow-sm transition-all duration-200
                   placeholder:text-zinc-400
                   hover:border-zinc-300 hover:shadow-md
                   focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10
                   md:py-5 md:text-lg"
                />

                {/* Modern Desktop Shortcut / Mobile Action */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block">
                  <kbd className="pointer-events-none inline-flex h-8 select-none items-center gap-1 rounded border border-zinc-200 bg-zinc-50 px-2 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </div>

                {/* Mobile-only "Go" indicator or button (Optional) */}
                <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 sm:hidden">
                  Find
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 flex items-end justify-between pt-10">
          <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight">
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
                setIsPretestCompleted(false);
                setPendingPretestNavId(null);
                setActiveNavId("");
                setIsMobileNavOpen(false);
                setPendingScrollTargetId(null);
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
