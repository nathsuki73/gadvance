// components/explore/module/useModuleNavigation.ts

"use client";

import { useEffect, useMemo, useState } from "react";

import type { CourseModule } from "@/app/lib/courseModules";

import { buildModuleArticles, buildModuleNavItems } from "./moduleUtils";

export const useModuleNavigation = (
  selectedModule: CourseModule | undefined,
) => {
  const [activeNavId, setActiveNavId] = useState("");

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(),
  );

  const [isStructureCollapsed, setIsStructureCollapsed] = useState(false);

  const moduleArticles = useMemo(
    () => buildModuleArticles(selectedModule),
    [selectedModule],
  );

  const moduleNavItems = useMemo(
    () => buildModuleNavItems(selectedModule),
    [selectedModule],
  );

  const displayedNavId =
    activeNavId || moduleNavItems[0]?.children?.[0]?.id || "";

  useEffect(() => {
    if (moduleNavItems.length > 0) {
      setExpandedModules(new Set(moduleNavItems.map((item) => item.id)));
    }
  }, [moduleNavItems]);

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

  const navigateTo = (navId: string) => {
    setActiveNavId(navId);

    const target = document.getElementById(navId);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return {
    moduleArticles,
    moduleNavItems,

    displayedNavId,

    expandedModules,
    toggleModuleExpanded,

    activeNavId,
    setActiveNavId,

    navigateTo,

    isStructureCollapsed,
    setIsStructureCollapsed,
  };
};
