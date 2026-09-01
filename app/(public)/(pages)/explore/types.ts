// types.ts

export type CourseIconType = "globe" | "briefcase" | "target" | "wellness";

export type LearningModule = {
  id: string;
  title: string;
  description?: string;
  image?: string | null;
};

export type LearningPlan = {
  id: string;
  title: string;
  description?: string;
  image?: string | null;

  modules?: LearningModule[];
  lessons?: LearningModule[];

  // optional frontend presentation fields
  icon?: CourseIconType;
  duration?: string;
  enrolled?: number;
  organization_id?: string | null; // 👈 Add this property
  is_public?: boolean;
};

export type CourseCardProps = {
  module: LearningPlan;
};

export type CourseSearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
};

export type CourseGridState = {
  query: string;
  activeSearch: string;
  courses: LearningPlan[];
  isLoading: boolean;
};
