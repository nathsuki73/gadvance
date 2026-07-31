import { apiFetch } from "@/app/lib/api-client";
import type { LearningPlan } from "./course/[courseId]/types";

export const searchContent = async (query: string = "") => {
  const cleanQuery = query.trim();
  const searchParams = new URLSearchParams();

  if (cleanQuery) {
    searchParams.append("search", cleanQuery);
  } else {
    searchParams.append("limit", "4");
  }

  // Prepended with /api for Laravel api.php route matching
  const endpoint = `/api/learning-plans?${searchParams.toString()}`;
  console.log("🔍 [searchContent] Calling endpoint:", endpoint);

  try {
    const res = await apiFetch(endpoint);

    if (!res) {
      console.error(
        "❌ [searchContent] apiFetch returned null/undefined (likely 401 unauthenticated redirect)",
      );
      return [];
    }

    console.log(
      `📡 [searchContent] Response status: ${res.status} (${res.statusText})`,
    );

    if (!res.ok) {
      const errorText = await res
        .text()
        .catch(() => "Unable to parse error text");
      console.error(
        `❌ [searchContent] Request failed with status ${res.status}:`,
        errorText,
      );
      return [];
    }

    const responseData = await res.json();
    console.log("📦 [searchContent] Raw Response JSON:", responseData);

    const rawData = Array.isArray(responseData)
      ? responseData
      : responseData.data || [];

    console.log(
      `📊 [searchContent] Parsed ${rawData.length} items from response`,
    );

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

    console.log(
      "✅ [searchContent] Final Normalized Learning Plans:",
      normalizedData,
    );
    return normalizedData;
  } catch (error) {
    console.error(
      "💥 [searchContent] Exception caught during fetch/parse:",
      error,
    );
    return [];
  }
};

export const getLearningPlanDetails = async (
  courseId: string,
): Promise<LearningPlan> => {
  console.log(
    "🔍 [getLearningPlanDetails] Fetching details for courseId:",
    courseId,
  );

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
    console.log(
      "📡 [getLearningPlanDetails] Attempting details endpoint:",
      detailsEndpoint,
    );

    let res = await apiFetch(detailsEndpoint);

    if (res) {
      console.log(
        `📡 [getLearningPlanDetails] Details endpoint status: ${res.status}`,
      );
    }

    if (!res || !res.ok) {
      const fallbackEndpoint = `/api/learning-plans/${courseId}`;
      console.warn(
        `⚠️ [getLearningPlanDetails] Details endpoint failed (${res?.status ?? "no response"}). Trying fallback:`,
        fallbackEndpoint,
      );

      res = await apiFetch(fallbackEndpoint);

      if (res) {
        console.log(
          `📡 [getLearningPlanDetails] Fallback endpoint status: ${res.status}`,
        );
      }
    }

    if (!res || !res.ok) {
      const errText = res
        ? await res.text().catch(() => "")
        : "No response object";
      console.error(
        `❌ [getLearningPlanDetails] Both details and fallback endpoints failed:`,
        errText,
      );
      throw new Error(
        `Failed to fetch learning plan details (Status: ${res?.status ?? "Unknown"}).`,
      );
    }

    const data = await res.json();
    console.log("📦 [getLearningPlanDetails] Raw Details JSON:", data);

    const normalizedResult = normalize(data as Record<string, unknown>);
    console.log(
      "✅ [getLearningPlanDetails] Final Normalized Result:",
      normalizedResult,
    );

    return normalizedResult;
  } catch (error) {
    console.error("💥 [getLearningPlanDetails] Exception caught:", error);
    throw error;
  }
};
