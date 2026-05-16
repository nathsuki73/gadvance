"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Circle,
  X,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { ModuleNavItem } from "./moduleUtils";

type ModuleSidebarProps = {
  structureTitle: string;
  items: ModuleNavItem[];
  displayedNavId: string;
  expandedModules: Set<string>;
  isCollapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
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
  mobileOpen,
  onCloseMobile,
  onToggleCollapse,
  onToggleModule,
  onNavigate,
}: ModuleSidebarProps) => {
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-label="Close menu overlay"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-dvh border-r border-zinc-200 bg-zinc-50/70 backdrop-blur-md
          transition-all duration-300 ease-in-out flex flex-col select-none

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0

          w-[290px] sm:w-[320px] 
          ${isCollapsed ? "lg:w-[76px]" : "lg:w-80"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200/80 px-4 bg-white/80 shrink-0">
          {/* Mobile Header Layout */}
          <div className="flex items-center gap-2 lg:hidden w-full justify-between">
            <button
              onClick={() => window.history.back()}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-transform"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-zinc-900 truncate max-w-[180px]">
              {structureTitle}
            </span>
            <button
              onClick={onCloseMobile}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 active:scale-95 transition-transform"
            >
              <X size={16} />
            </button>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden lg:flex items-center justify-between w-full min-w-0">
            {!isCollapsed && (
              <div className="min-w-0 pr-2 animate-in fade-in duration-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600/90">
                  Navigation
                </p>
                <h2 className="truncate text-sm font-semibold text-zinc-800" title={structureTitle}>
                  {structureTitle}
                </h2>
              </div>
            )}

            <div className={`flex items-center gap-1.5 ${isCollapsed ? "mx-auto" : ""}`}>
              {!isCollapsed && (
                <button
                  onClick={() => window.history.back()}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
                  title="Go Back"
                >
                  <ArrowLeft size={14} />
                </button>
              )}
              <button
                onClick={onToggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-800"
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Content Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          <nav className="space-y-1">
            {items.map((item) => {
              const isExpanded = expandedModules.has(item.id);
              const hasChildren = !!item.children?.length;
              const isParentActive = item.id === displayedNavId || item.children?.some(c => c.id === displayedNavId);

              // Render Optimized Collapsed View Block (Desktop Only)
              if (isCollapsed && !mobileOpen) {
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      hidden lg:flex h-11 w-11 mx-auto items-center justify-center rounded-xl transition-all duration-200 group relative
                      ${isParentActive 
                        ? "bg-sky-50 text-sky-600 border border-sky-100" 
                        : "text-zinc-500 hover:bg-zinc-200/60 hover:text-zinc-900"
                      }
                    `}
                    title={item.label}
                  >
                    <Layers size={18} className={isParentActive ? "stroke-[2.2]" : "stroke-[1.5] group-hover:scale-105 transition-transform"} />
                    {isParentActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                    )}
                  </button>
                );
              }

              // Standard Accordion & Interactive Mobile Row View
              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    onClick={() => {
                      if (hasChildren) {
                        onToggleModule(item.id);
                      } else {
                        onNavigate(item.id);
                        if (mobileOpen) onCloseMobile();
                      }
                    }}
                    className={`
                      flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200 group
                      ${isParentActive && !hasChildren
                        ? "bg-sky-50 text-sky-600 font-medium border border-sky-100/50"
                        : "text-zinc-700 hover:bg-zinc-200/50 border border-transparent"
                      }
                    `}
                  >
                    <div className="min-w-0 pr-2">
                      <p className={`text-sm ${isParentActive ? "font-semibold text-zinc-900" : "font-medium text-zinc-700"} truncate`}>
                        {item.label}
                      </p>
                      {hasChildren && (
                        <p className="text-[11px] text-zinc-400 font-normal mt-0.5">
                          {item.children?.length} sub-sections
                        </p>
                      )}
                    </div>

                    {hasChildren && (
                      <ChevronRight
                        size={14}
                        className={`text-zinc-400 transition-transform duration-200 group-hover:text-zinc-600 shrink-0
                          ${isExpanded ? "rotate-90 text-zinc-600" : ""}
                        `}
                      />
                    )}
                  </button>

                  {/* Child Links Nested Stack */}
                  {isExpanded && hasChildren && (
                    <div className="ml-3.5 border-l border-zinc-200 pl-2.5 py-1 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.children?.map((child) => {
                        const isChildActive = child.id === displayedNavId;

                        return (
                          <button
                            key={child.id}
                            onClick={() => { 
                              onNavigate(child.id); 
                              if (mobileOpen) onCloseMobile(); 
                            }}
                            className={`
                              flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-all duration-150 group/item
                              ${isChildActive
                                ? "bg-sky-50/80 text-sky-600 font-medium"
                                : "text-zinc-600 hover:bg-zinc-200/40 hover:text-zinc-900"
                              }
                            `}
                          >
                            <Circle
                              size={5}
                              className={`transition-all duration-200 shrink-0
                                ${isChildActive 
                                  ? "fill-sky-600 text-sky-600 scale-125" 
                                  : "text-zinc-300 fill-zinc-300 group-hover/item:text-zinc-400 group-hover/item:fill-zinc-400"
                                }
                              `}
                            />
                            <span className="text-sm truncate">
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
          </nav>
        </div>
      </aside>
    </>
  );
};

export default ModuleSidebar;