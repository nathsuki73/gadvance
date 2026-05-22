import axios from "axios";
import type { LearningPlan } from "./course/[courseId]/types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export const searchContent = async (query: string = "") => {
  try {
    const response = await axios.get(`${API_BASE_URL}/learning-plans`, {
      params: { search: query, limit: query ? null : 4 },
    });

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

    return (Array.isArray(response.data)
      ? response.data
      : response.data.data || []).map((item: Record<string, unknown>) => ({
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
  } catch (error) {
    console.error("Error fetching Learning Plans:", error);
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

    try {
      const response = await axios.get(
        `${API_BASE_URL}/learning-plans/${courseId}/details`,
      );

      return normalize(response.data as Record<string, unknown>);
    } catch (detailsError) {
      console.warn("Details endpoint failed, falling back to base course endpoint:", detailsError);

      const fallbackResponse = await axios.get(
        `${API_BASE_URL}/learning-plans/${courseId}`,
      );

      return normalize(fallbackResponse.data as Record<string, unknown>);
    }
  } catch (error) {
    console.error("Error fetching Learning Plan Details:", error);
    throw error;
  }
};