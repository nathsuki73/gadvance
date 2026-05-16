// components/explore/module/ModuleSidebar.tsx

"use client";

import React from "react";

import {
  ChevronLeft,
  ChevronRight,
  Circle,
} from "lucide-react";

import type { ModuleNavItem } from "./moduleUtils";

type ModuleSidebarProps = {
  structureTitle: string;
  items: ModuleNavItem[];

  displayedNavId: string;

  expandedModules: Set<string>;

  isCollapsed: boolean;

  onToggleCollapse: () => void;

  onToggleModule: (id: string) => void;

  onNavigate: (id: string) => void;
};

const ModuleSidebar = ({
  structureTitle,
  items,
  displayedNavId,
  expandedModules,
  isCollapsed,
  onToggleCollapse,
  onToggleModule,
  onNavigate,
}: ModuleSidebarProps) => {
  return (
    <aside
      className={`fixed left-0 top-0 z-20 hidden h-screen overflow-hidden border-r border-zinc-200 bg-[#f7f8fa] shadow-sm transition-all duration-300 lg:block ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      <div className="flex h-full flex-col px-4 pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-zinc-900">
                {structureTitle}
              </h2>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white p-1.5 text-zinc-700 shadow-sm transition-colors hover:bg-zinc-200"
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {!isCollapsed && (
          <div className="mt-5 space-y-2 overflow-y-auto pr-1">
            {items.map((item) => {
              const isExpanded =
                expandedModules.has(item.id);

              const hasChildren =
                item.children &&
                item.children.length > 0;

              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.isGroup) {
                        onToggleModule(item.id);
                      }

                      onNavigate(item.id);
                    }}
                    className="flex w-full items-center justify-between rounded-md bg-white px-3 py-2 text-left text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100"
                  >
                    <span>{item.label}</span>

                    {hasChildren && (
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${
                          isExpanded
                            ? "rotate-90"
                            : ""
                        }`}
                      />
                    )}
                  </button>

                  {item.isGroup &&
                    isExpanded &&
                    hasChildren && (
                      <div className="ml-3 mt-1 space-y-1 border-l border-zinc-200 pl-2">
                        {item.children?.map((child) => {
                          const isActive =
                            child.id === displayedNavId;

                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() =>
                                onNavigate(child.id)
                              }
                              className="relative flex w-full items-center gap-2 rounded-md px-3 py-2 pl-5 text-left text-xs font-medium transition-colors"
                              style={{
                                backgroundColor: isActive
                                  ? "#08334412"
                                  : "#ffffff",

                                color: isActive
                                  ? "#083344"
                                  : "#111827",
                              }}
                            >
                              <div
                                className="absolute left-0 top-1/2 h-full w-1 -translate-y-1/2 rounded-r"
                                style={{
                                  backgroundColor:
                                    isActive
                                      ? "#083344"
                                      : "transparent",
                                }}
                              />

                              <Circle
                                size={12}
                                className="shrink-0"
                              />

                              <span>
                                {child.label}
                              </span>
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
  );
};

export default ModuleSidebar;