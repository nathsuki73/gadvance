// components/explore/module/moduleUtils.ts

export type Module = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
};

export type CourseModule = {
  id: string;
  title: string;
  about?: string;
  modules?: Module[];
};

export type ModuleNavItem = {
  id: string;
  label: string;
  children?: ModuleNavItem[];
  isModule?: boolean;
};

export type ModuleArticle = {
  id: string;
  label: string;
  content: string;
  module: Module;
};

export const buildModuleArticles = (
  selectedModule: CourseModule | undefined,
): ModuleArticle[] => {
  if (!selectedModule?.modules) {
    return [];
  }

  return selectedModule.modules.map((module) => ({
    id: `module-article-${module.id}`,
    label: module.title,
    content: module.about || "No module content available.",
    module,
  }));
};

export const buildModuleNavItems = (
  selectedModule: CourseModule | undefined,
): ModuleNavItem[] => {
  if (!selectedModule?.modules) {
    return [];
  }

  return selectedModule.modules.map((module) => ({
    id: `module-nav-${module.id}`,
    label: module.title,
    isModule: true,
  }));
};
