// types.ts

export type LearningModule = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;
};

export type LearningPlan = {
  id: string;
  title: string;
  about?: string;
  image?: string | null;

  modules?: LearningModule[];

  // optional frontend presentation fields
  accent?: string;
  tag?: string;
  duration?: string;
  enrolled?: number;

  icon?: "globe" | "briefcase" | "target" | "wellness";
};

export type CoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
};
