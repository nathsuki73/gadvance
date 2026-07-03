"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import SideBarNavItem from "./_components/SideBarNavItem";
import { useRouter } from "next/navigation";

type LessonBlock = { id: string; title: string };
export type LearningItem = {
  id: string;
  title: string;
  type: "pretest" | "lesson" | "posttest";
  order: number;
  lesson_blocks?: LessonBlock[];
};

type Props = {
  courseId: string;
  moduleId: string;
  structureTitle?: string;
  items: LearningItem[];
  activeItem: LearningItem;
  activeBlockId?: string;
  onNavigate: (item: LearningItem, blockId?: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

const DOT_COLORS: Record<
  LearningItem["type"],
  { active: string; inactive: string }
> = {
  pretest: { active: "bg-violet-500", inactive: "bg-violet-200" },
  lesson: { active: "bg-blue-500", inactive: "bg-blue-200" },
  posttest: { active: "bg-amber-500", inactive: "bg-amber-200" },
};

export default function ModuleSidebar({
  courseId,
  moduleId,
  structureTitle,
  items = [],
  activeItem,
  activeBlockId,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const router = useRouter();
  console.log("id");
  console.log(courseId);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([activeItem.id]),
  );
  const collapsedView = isCollapsed && !mobileOpen;

  const go = (item: LearningItem, blockId?: string) => {
    if (item.type === "lesson") {
      setExpanded((prev) => {
        if (prev.has(item.id)) return prev;
        const next = new Set(prev);
        next.add(item.id);
        return next;
      });
    }

    onNavigate(item, blockId);
  };

  const openLesson = (item: LearningItem) => {
    const alreadyOpen = expanded.has(item.id);
    if (!alreadyOpen) {
      setExpanded((prev) => new Set(prev).add(item.id));
      go(item, "overview");
    } else {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-[290px] flex-col border-r border-zinc-200 bg-zinc-50/80 backdrop-blur-md transition-all duration-300 ease-in-out sm:w-[320px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-16" : "lg:w-80"}`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4">
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <span className="max-w-[220px] truncate text-sm font-semibold lowercase text-zinc-900">
              {structureTitle}
            </span>
            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="hidden w-full items-center justify-between lg:flex">
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  curriculum
                </p>
                <h2 className="truncate text-sm font-semibold leading-snug text-zinc-800">
                  {structureTitle}
                </h2>
              </div>
            )}
            <button
              onClick={onToggleCollapse}
              className={`flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 ${isCollapsed ? "mx-auto" : ""}`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? "›" : "‹"}
            </button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item, i) => {
            const colors = DOT_COLORS[item.type];
            const blocks = item.lesson_blocks ?? [];
            const hasBlocks = item.type === "lesson";
            const isOpen = expanded.has(item.id);

            return (
              <div key={item.id}>
                <SideBarNavItem
                  index={i}
                  label={item.title}
                  sublabel={
                    hasBlocks ? `${blocks.length + 2} steps` : item.type
                  }
                  dotColor={colors.active}
                  dotColorInactive={colors.inactive}
                  active={item.id === activeItem.id && !activeBlockId}
                  collapsed={collapsedView}
                  trailing={
                    hasBlocks && !collapsedView
                      ? isOpen
                        ? "▾"
                        : "▸"
                      : undefined
                  }
                  onClick={() => (hasBlocks ? openLesson(item) : go(item))}
                />

                {hasBlocks && isOpen && !collapsedView && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-zinc-200 pl-3">
                    <SubRow
                      label="Overview"
                      active={
                        item.id === activeItem.id &&
                        activeBlockId === "overview"
                      }
                      onClick={() => go(item, "overview")}
                    />

                    {blocks.map((block) => (
                      <SubRow
                        key={block.id}
                        label={block.title}
                        active={
                          item.id === activeItem.id &&
                          activeBlockId === block.id
                        }
                        onClick={() => go(item, block.id)}
                      />
                    ))}

                    <SubRow
                      label="Quiz"
                      active={
                        item.id === activeItem.id && activeBlockId === "quiz"
                      }
                      onClick={() => go(item, "quiz")}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="shrink-0 border-t border-zinc-200 bg-white/80 p-3">
          <button
            onClick={() =>
              router.push(`/explore/course/${courseId}/module/${moduleId}`)
            }
            aria-label="Exit module"
            className={`flex items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 ${
              collapsedView
                ? "h-10 w-full justify-center"
                : "w-1/3 gap-2 px-3 py-2.5"
            }`}
          >
            <ArrowLeft size={16} className="shrink-0" />
            {!collapsedView && (
              <span className="text-xs font-medium">Exit</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

function SubRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
        active
          ? "bg-purple-50/70 text-[#8b5cf6]"
          : "text-zinc-500 hover:bg-zinc-200/40 hover:text-zinc-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-blue-500" : "bg-zinc-300"}`}
      />
      <span
        className={`truncate text-[11.5px] ${active ? "font-semibold" : "font-normal"}`}
      >
        {label}
      </span>
    </button>
  );
}
