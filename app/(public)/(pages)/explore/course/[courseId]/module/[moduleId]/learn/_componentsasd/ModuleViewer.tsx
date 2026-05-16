"use client";

import React from "react";

import type { ModuleResponse } from "../../types";

import ModuleSidebar from "./ModuleSidebar";
import ModuleContent from "./ModuleContent";
import PretestGate from "./PretestGate";

import { useModuleNavigation } from "./useModuleNavigation";

type ModuleViewerProps = {
  module: ModuleResponse;
};

const ModuleViewer = ({
  module,
}: ModuleViewerProps) => {
  const {
  moduleArticles,
  moduleNavItems,

  displayedNavId,

  expandedGroups,
  toggleGroupExpanded,

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
        expandedModules={expandedGroups}
        isCollapsed={isStructureCollapsed}
        onToggleCollapse={() =>
          setIsStructureCollapsed(
            (prev) => !prev,
          )
        }
        onToggleModule={
          toggleGroupExpanded
        }
        onNavigate={navigateTo}
      />

      <div
        className={`transition-all duration-300 ${desktopContentOffsetClass}`}
      >

        <PretestGate
          moduleTitle={module.title}
          accentColor="#00aeef"
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