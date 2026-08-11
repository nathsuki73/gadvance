"use client";

import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Section, SectionItem } from "../../service";
import SideBarNavItem from "./_components/SideBarNavItem";
import { DonutProgress } from "./_components/DonutProgress";

type ModuleSidebarProps = {
  courseId: string;
  moduleId: string;
  structureTitle?: string;
  sections: Section[];
  activeItem: SectionItem | null;
  completedItemIds?: Set<string>;
  onSelect: (item: SectionItem) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export default function ModuleSidebar({
  courseId,
  moduleId,
  structureTitle,
  sections = [],
  activeItem,
  completedItemIds = new Set(),
  onSelect,
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: ModuleSidebarProps) {
  const router = useRouter();

  // Track expanded state per section UUID (all open by default)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(sections.map((s) => s.id)),
  );

  const collapsedView = isCollapsed && !mobileOpen;

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  };

  // Flatten all items across sections for sequential unlock calculation
  const allItems = sections.flatMap((sec) => sec.items || []);

  const checkIsItemUnlocked = (itemId: string): boolean => {
    const idx = allItems.findIndex((i) => i.id === itemId);
    if (idx <= 0) return true;
    const prevItem = allItems[idx - 1];
    return completedItemIds.has(prevItem.id);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs lg:hidden"
          aria-label="Close navigation sidebar"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 flex-col border-r border-zinc-200 bg-zinc-50/90 backdrop-blur-md transition-all duration-300 ease-in-out sm:w-80 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${isCollapsed ? "lg:w-16" : "lg:w-80"}`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 bg-white/80 px-4">
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <span className="max-w-[200px] truncate text-sm font-semibold text-zinc-900">
              {structureTitle}
            </span>
            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 cursor-pointer"
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
          </div>

          <div className="hidden w-full items-center justify-between lg:flex">
            {!isCollapsed ? (
              <>
                <div className="min-w-0 pr-2">
                  <h2 className="truncate text-sm font-semibold leading-snug text-zinc-800">
                    {structureTitle}
                  </h2>
                </div>
                <button
                  onClick={onToggleCollapse}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
                  aria-label="Collapse sidebar"
                >
                  ‹
                </button>
              </>
            ) : (
              <button
                onClick={onToggleCollapse}
                className="mx-auto flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                ›
              </button>
            )}
          </div>
        </div>

        {/* Section & Item Navigation Body */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            const items = section.items || [];
            const completedCount = items.filter((i) =>
              completedItemIds.has(i.id),
            ).length;

            return (
              <div key={section.id} className="space-y-1">
                {/* SECTION HEADER BAR */}
                {!collapsedView ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-200/50 cursor-pointer"
                  >
                    {/* Left Side: Donut Progress + Section Title */}
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <DonutProgress
                        totalSteps={items.length}
                        completedSteps={completedCount}
                        size={18}
                        strokeWidth={2.5}
                      />
                      <h3 className="truncate text-xs font-bold text-zinc-800">
                        {section.title}
                      </h3>
                    </div>

                    {/* Right Side: Chevron Indicator */}
                    <div className="flex items-center shrink-0 text-zinc-400">
                      {isExpanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </div>
                  </button>
                ) : (
                  <div className="h-px w-8 bg-zinc-200 mx-auto my-2" />
                )}

                {/* SECTION ITEMS */}
                {(isExpanded || collapsedView) && (
                  <div
                    className={!collapsedView ? "space-y-1 pl-1" : "space-y-1"}
                  >
                    {items.map((item, itemIdx) => {
                      const isUnlocked = checkIsItemUnlocked(item.id);
                      const isCompleted = completedItemIds.has(item.id);
                      const isActive = activeItem?.id === item.id;

                      return (
                        <SideBarNavItem
                          key={item.id}
                          index={itemIdx + 1}
                          label={item.title}
                          itemType={item.item_type}
                          assessmentType={item.assessment_type}
                          active={isActive}
                          locked={!isUnlocked}
                          completed={isCompleted}
                          collapsed={collapsedView}
                          onClick={() => {
                            if (isUnlocked) {
                              onSelect(item);
                            }
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Exit Control */}
        <div className="shrink-0 border-t border-zinc-200 bg-white/80 p-3">
          <button
            onClick={() =>
              router.push(`/explore/course/${courseId}/module/${moduleId}`)
            }
            aria-label="Exit module"
            className={`flex items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 cursor-pointer ${
              collapsedView
                ? "h-10 w-full justify-center"
                : "w-full justify-center gap-2 px-3 py-2.5"
            }`}
          >
            <ArrowLeft size={16} className="shrink-0" />
            {!collapsedView && (
              <span className="text-xs font-medium">Exit Module</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
