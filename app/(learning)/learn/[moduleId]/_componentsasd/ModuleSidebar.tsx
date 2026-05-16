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

  onToggleModule: (
    id: string,
  ) => void;

  onNavigate: (
    id: string,
  ) => void;
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
      className={`fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] overflow-hidden border-r border-zinc-200 bg-white transition-all duration-300 lg:block ${
        isCollapsed
          ? "w-20"
          : "w-80"
      }`}
    >

      <div className="flex h-full flex-col">

        {/* HEADER */}
        <div className="border-b border-zinc-100 px-5 py-5">

          <div className="flex items-start justify-between gap-3">

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[#00aeef]">
                  Learning Structure
                </p>

                <h2 className="truncate text-lg font-semibold text-zinc-900">
                  {structureTitle}
                </h2>
              </div>
            )}

            <button
              type="button"
              onClick={
                onToggleCollapse
              }
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition-colors hover:border-[#00aeef] hover:text-[#00aeef]"
            >
              {isCollapsed ? (
                <ChevronRight
                  size={16}
                />
              ) : (
                <ChevronLeft
                  size={16}
                />
              )}
            </button>

          </div>

        </div>

        {/* NAVIGATION */}
        {!isCollapsed && (
          <div className="flex-1 overflow-y-auto px-4 py-5">

            <div className="space-y-3">

              {items.map((item) => {
                const isExpanded =
                  expandedModules.has(
                    item.id,
                  );

                const hasChildren =
                  item.children &&
                  item.children
                    .length > 0;

                return (
                  <div
                    key={item.id}
                    className="space-y-1"
                  >

                    {/* GROUP */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          item.isGroup
                        ) {
                          onToggleModule(
                            item.id,
                          );
                        }

                        onNavigate(
                          item.id,
                        );
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:border-[#00aeef]/30 hover:bg-[#00aeef]/[0.03]"
                    >

                      <div className="flex flex-col">

                        <span className="text-sm font-semibold text-zinc-900">
                          {item.label}
                        </span>

                        {item.children && (
                          <span className="mt-1 text-[11px] text-zinc-400">
                            {
                              item
                                .children
                                .length
                            }{" "}
                            sections
                          </span>
                        )}

                      </div>

                      {hasChildren && (
                        <ChevronRight
                          size={15}
                          className={`text-zinc-400 transition-transform ${
                            isExpanded
                              ? "rotate-90"
                              : ""
                          }`}
                        />
                      )}

                    </button>

                    {/* CHILDREN */}
                    {item.isGroup &&
                      isExpanded &&
                      hasChildren && (
                        <div className="ml-4 border-l border-zinc-200 pl-4">

                          <div className="space-y-1 py-2">

                            {item.children?.map(
                              (
                                child,
                              ) => {
                                const isActive =
                                  child.id ===
                                  displayedNavId;

                                return (
                                  <button
                                    key={
                                      child.id
                                    }
                                    type="button"
                                    onClick={() =>
                                      onNavigate(
                                        child.id,
                                      )
                                    }
                                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${
                                      isActive
                                        ? "bg-[#00aeef]/10"
                                        : "hover:bg-zinc-100"
                                    }`}
                                  >

                                    <Circle
                                      size={
                                        10
                                      }
                                      className={`shrink-0 ${
                                        isActive
                                          ? "fill-[#00aeef] text-[#00aeef]"
                                          : "text-zinc-300"
                                      }`}
                                    />

                                    <span
                                      className={`text-sm ${
                                        isActive
                                          ? "font-semibold text-[#00aeef]"
                                          : "font-medium text-zinc-700"
                                      }`}
                                    >
                                      {
                                        child.label
                                      }
                                    </span>

                                  </button>
                                );
                              },
                            )}

                          </div>

                        </div>
                      )}

                  </div>
                );
              })}

            </div>

          </div>
        )}

      </div>

    </aside>
  );
};

export default ModuleSidebar;