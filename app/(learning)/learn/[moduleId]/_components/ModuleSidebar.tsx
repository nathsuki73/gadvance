"use client";

import React, { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Circle,
  X,
  ArrowLeft,
  Layers,
} from "lucide-react";

import type { SectionGroup } from "../types";

type ModuleSidebarProps = {
  structureTitle: string;

  sectionGroups: SectionGroup[];

  activeSectionId: string;

  onNavigate: (id: string) => void;

  isCollapsed: boolean;

  onToggleCollapse: () => void;

  mobileOpen: boolean;

  onCloseMobile: () => void;
};

const ModuleSidebar = ({
  structureTitle,

  sectionGroups,

  activeSectionId,

  isCollapsed,

  mobileOpen,

  onCloseMobile,

  onToggleCollapse,

  onNavigate,
}: ModuleSidebarProps) => {
  /*
  |--------------------------------------------------------------------------
  | EXPANDED GROUPS
  |--------------------------------------------------------------------------
  */

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(sectionGroups.map((group) => group.id)),
  );

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const updated = new Set(prev);

      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }

      return updated;
    });
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-dvh
          border-r border-zinc-200
          bg-zinc-50/80 backdrop-blur-md

          transition-all duration-300 ease-in-out

          flex flex-col

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}

          lg:translate-x-0

          w-72.5 sm:w-[320px]

          ${isCollapsed ? "lg:w-9" : "lg:w-80"}
        `}
      >
        {/* HEADER */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 shrink-0">
          {/* MOBILE */}
          <div className="flex w-full items-center justify-between gap-2 lg:hidden">
            <button
              onClick={() => window.history.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"
            >
              <ArrowLeft size={16} />
            </button>

            <span className="max-w-45 truncate text-sm font-semibold text-zinc-900">
              {structureTitle}
            </span>

            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* DESKTOP */}
          <div className="hidden w-full items-center justify-between lg:flex">
            {!isCollapsed && (
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                  Navigation
                </p>

                <h2 className="truncate text-sm font-semibold text-zinc-800">
                  {structureTitle}
                </h2>
              </div>
            )}

            <div
              className={`flex items-center gap-1.5 ${
                isCollapsed ? "mx-auto" : ""
              }`}
            >
              {!isCollapsed && (
                <button
                  onClick={() => window.history.back()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500"
                >
                  <ArrowLeft size={14} />
                </button>
              )}

              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500"
              >
                {isCollapsed ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronLeft size={14} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-2">
            {sectionGroups.map((group) => {
              const isExpanded = expandedGroups.has(group.id);

              /*
                |--------------------------------------------------------------------------
                | COLLAPSED VIEW
                |--------------------------------------------------------------------------
                */

              if (isCollapsed && !mobileOpen) {
                return (
                  <button
                    key={group.id}
                    onClick={() => toggleGroup(group.id)}
                    className="
                        hidden lg:flex
                        h-11 w-11 mx-auto
                        items-center justify-center
                        rounded-xl
                        text-zinc-500
                        hover:bg-zinc-200/60
                      "
                  >
                    <Layers size={18} />
                  </button>
                );
              }

              /*
                |--------------------------------------------------------------------------
                | FULL VIEW
                |--------------------------------------------------------------------------
                */

              return (
                <div key={group.id} className="space-y-1">
                  {/* GROUP BUTTON */}
                  <button
                    onClick={() => toggleGroup(group.id)}
                    className="
                        flex w-full items-center justify-between
                        rounded-xl
                        border border-transparent
                        px-3 py-2.5
                        text-left
                        transition
                        hover:bg-zinc-200/50
                      "
                  >
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">
                        {group.title}
                      </p>

                      <p className="mt-0.5 text-[11px] text-zinc-400">
                        {group.sections.length} sections
                      </p>
                    </div>

                    <ChevronRight
                      size={14}
                      className={`
                          text-zinc-400
                          transition-transform duration-200

                          ${isExpanded ? "rotate-90" : ""}
                        `}
                    />
                  </button>

                  {/* SECTIONS */}
                  {isExpanded && (
                    <div className="ml-3.5 space-y-0.5 border-l border-zinc-200 pl-2.5 py-1">
                      {group.sections.map((section) => {
                        const isActive = activeSectionId === section.id;

                        return (
                          <button
                            key={section.id}
                            onClick={() => {
                              onNavigate(section.id);

                              if (mobileOpen) {
                                onCloseMobile();
                              }
                            }}
                            className={`
                                  flex w-full items-center gap-2.5
                                  rounded-lg
                                  px-2.5 py-2
                                  text-left
                                  transition-all duration-150

                                  ${
                                    isActive
                                      ? "bg-sky-50 text-sky-600"
                                      : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"
                                  }
                                `}
                          >
                            <Circle
                              size={5}
                              className={`
                                    shrink-0

                                    ${
                                      isActive
                                        ? "fill-sky-600 text-sky-600"
                                        : "fill-zinc-300 text-zinc-300"
                                    }
                                  `}
                            />

                            <span className="truncate text-sm">
                              {section.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default ModuleSidebar;
