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
  description?: string;
  image?: string | null;

  modules?: LearningModule[];
  lessons?: LearningModule[];

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

export type Enrollment = {
  id: string;
  user_id: string;
  learning_plan_id: string;

  status: "inactive" | "in_progress" | "completed";

  progress_percentage: number;

  started_at: string | null;
  completed_at: string | null;

  created_at: string;
  updated_at: string;
};

export type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export type EnrollmentResponse = {
  message?: string;
  data?: Enrollment | null;
};