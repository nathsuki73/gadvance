// components/explore/module/ModuleViewer.tsx

"use client";

import React from "react";

import type { CourseModule } from "@/app/lib/courseModules";

import ModuleSidebar from "./ModuleSidebar";
import ModuleContent from "./ModuleContent";
import PretestGate from "./PretestGate";

import { useModuleNavigation } from "./useModuleNavigation";

type ModuleViewerProps = {
  module: CourseModule;
};

const ModuleViewer = ({
  module,
}: ModuleViewerProps) => {
  const {
    moduleArticles,
    moduleNavItems,

    displayedNavId,

    expandedModules,
    toggleModuleExpanded,

    navigateTo,

    isStructureCollapsed,
    setIsStructureCollapsed,
  } = useModuleNavigation(module);

  const desktopContentOffsetClass =
    isStructureCollapsed
      ? "lg:ml-16"
      : "lg:ml-80";

  return (
    <div className="relative min-h-[70vh]">
      <ModuleSidebar
        structureTitle={module.title}
        items={moduleNavItems}
        displayedNavId={displayedNavId}
        expandedModules={expandedModules}
        isCollapsed={isStructureCollapsed}
        onToggleCollapse={() =>
          setIsStructureCollapsed(
            (prev) => !prev,
          )
        }
        onToggleModule={
          toggleModuleExpanded
        }
        onNavigate={navigateTo}
      />

      <div
        className={`transition-all duration-300 ${desktopContentOffsetClass}`}
      >
        <PretestGate
          moduleTitle={module.title}
          accentColor={module.accent}
        >
          <ModuleContent
            articles={moduleArticles}
          />
        </PretestGate>
      </div>
    </div>
  );
};

export default ModuleViewer;