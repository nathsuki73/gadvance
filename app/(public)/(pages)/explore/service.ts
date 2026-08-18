import { apiFetch } from "@/app/lib/api-client";
import type { LearningPlan } from "./course/[courseId]/types";

export const searchContent = async (query: string = "") => {
  const cleanQuery = query.trim();
  const searchParams = new URLSearchParams();

  searchParams.append("portal", "student");

  if (cleanQuery) {
    searchParams.append("search", cleanQuery);
  } else {
    searchParams.append("limit", "4");
  }

  const endpoint = `/api/learning-plans?${searchParams.toString()}`;

  try {
    const res = await apiFetch(endpoint);

    if (!res || !res.ok) {
      return [];
    }

    const responseData = await res.json();
    const rawData = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    const normalizeLesson = (item: Record<string, unknown>) => ({
      id: String(item.id ?? item.lesson_id ?? ""),
      title: String(item.title ?? ""),
      description:
        (item.description as string | undefined) ||
        (item.about as string | undefined) ||
        "",
      image: (item.image as string | null | undefined) ?? null,
    });

    const normalizeLessonsFromGroups = (data: Record<string, unknown>) => {
      const sectionGroups = Array.isArray(data.section_groups)
        ? data.section_groups
        : [];

      return sectionGroups.flatMap((group) => {
        const groupRecord = group as Record<string, unknown>;
        const sections = Array.isArray(groupRecord.sections)
          ? groupRecord.sections
          : [];

        return sections.map(normalizeLesson);
      });
    };

    const normalizedData = rawData.map((item: Record<string, unknown>) => ({
      ...item,
      id: String(item.id ?? item.course_id ?? item.learning_plan_id ?? ""),
      description:
        (item.description as string | undefined) ||
        (item.about as string | undefined) ||
        "",
      modules: Array.isArray(item.modules)
        ? item.modules.map(normalizeLesson)
        : [],
      lessons: Array.isArray(item.lessons)
        ? item.lessons.map(normalizeLesson)
        : normalizeLessonsFromGroups(item),
    })) as LearningPlan[];

    return normalizedData;
  } catch (error) {
    console.error("Exception caught in searchContent:", error);
    return [];
  }
};

export const getLearningPlanDetails = async (
  courseId: string,
): Promise<LearningPlan> => {
  try {
    const normalizeLesson = (item: Record<string, unknown>) => ({
      id: String(item.id ?? item.lesson_id ?? ""),
      title: String(item.title ?? ""),
      description:
        (item.description as string | undefined) ||
        (item.about as string | undefined) ||
        "",
      image: (item.image as string | null | undefined) ?? null,
    });

    const normalizeLessonsFromGroups = (data: Record<string, unknown>) => {
      const sectionGroups = Array.isArray(data.section_groups)
        ? data.section_groups
        : [];

      return sectionGroups.flatMap((group) => {
        const groupRecord = group as Record<string, unknown>;
        const sections = Array.isArray(groupRecord.sections)
          ? groupRecord.sections
          : [];

        return sections.map(normalizeLesson);
      });
    };

    const normalize = (data: Record<string, unknown>): LearningPlan => ({
      id: String(data.id ?? data.course_id ?? data.learning_plan_id ?? ""),
      title: String(data.title ?? ""),
      ...data,
      description:
        (data.description as string | undefined) ||
        (data.about as string | undefined) ||
        "",
      modules: Array.isArray(data.modules)
        ? data.modules.map(normalizeLesson)
        : [],
      lessons: Array.isArray(data.lessons)
        ? data.lessons.map(normalizeLesson)
        : Array.isArray(data.modules)
          ? data.modules.map(normalizeLesson)
          : normalizeLessonsFromGroups(data),
    });

    const detailsEndpoint = `/api/learning-plans/${courseId}/details`;
    let res = await apiFetch(detailsEndpoint);

    if (!res || !res.ok) {
      const fallbackEndpoint = `/api/learning-plans/${courseId}`;
      res = await apiFetch(fallbackEndpoint);
    }

    if (!res || !res.ok) {
      throw new Error(
        `Failed to fetch learning plan details (Status: ${res?.status ?? "Unknown"}).`,
      );
    }

    const data = await res.json();
    return normalize(data as Record<string, unknown>);
  } catch (error) {
    console.error("Exception caught in getLearningPlanDetails:", error);
    throw error;
  }
};
