"use client";

import { useMemo, useState } from "react";

import type { ModuleResponse } from "../../types";

import { buildModuleArticles, buildModuleNavItems } from "./moduleUtils";

export const useModuleNavigation = (module: ModuleResponse) => {
  const [activeNavId, setActiveNavId] = useState("");

  /**
   * Build articles
   */
  const moduleArticles = useMemo(() => buildModuleArticles(module), [module]);

  /**
   * Build sidebar items
   */
  const moduleNavItems = useMemo(() => buildModuleNavItems(module), [module]);

  /**
   * Expanded groups
   */
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(moduleNavItems.map((item) => item.id)),
  );

  /**
   * Sidebar collapse state
   */
  const [isStructureCollapsed, setIsStructureCollapsed] = useState(false);

  /**
   * Active nav item
   */
  const displayedNavId =
    activeNavId || moduleNavItems?.[0]?.children?.[0]?.id || "";

  /**
   * Expand/collapse group
   */
  const toggleGroupExpanded = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);

      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }

      return next;
    });
  };

  /**
   * Scroll navigation
   */
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

    expandedGroups,
    toggleGroupExpanded,

    activeNavId,
    setActiveNavId,

    navigateTo,

    isStructureCollapsed,
    setIsStructureCollapsed,
  };
};
