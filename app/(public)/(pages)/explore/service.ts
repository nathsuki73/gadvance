import { apiFetch } from "@/app/lib/api-client";
import type { LearningPlan } from "./course/[courseId]/types";

export type PlanFilter = "all" | "public" | "organization";

export type ExploreOrganization = {
  id: string;
  title: string;
  description: string;
  membersCount: number;
  isJoined?: boolean;
};

/** Every organization, for the Explore page's organization tags. */
export const fetchExploreOrganizations = async (): Promise<
  ExploreOrganization[]
> => {
  const res = await apiFetch("/api/organizations/explore");
  if (!res || !res.ok) {
    throw new Error("Failed to fetch organizations");
  }
  return res.json();
};

/**
 * Learning plans for the Explore page. Filtering happens on the API, so the
 * results are complete rather than a filtered slice of a short list:
 * - "public": plans that belong to no organization
 * - "organization": plans of one organization (`organizationId`) or of any
 * The API still hides private plans from people outside the organization.
 */
export const searchContent = async ({
  search = "",
  filter = "all",
  organizationId = "",
}: {
  search?: string;
  filter?: PlanFilter;
  organizationId?: string;
} = {}) => {
  const cleanQuery = search.trim();
  const searchParams = new URLSearchParams();

  searchParams.append("portal", "student");

  if (cleanQuery) {
    searchParams.append("search", cleanQuery);
  }

  if (filter === "public") {
    searchParams.append("organization_id", "global");
  } else if (filter === "organization") {
    if (organizationId) {
      searchParams.append("organization_id", organizationId);
    } else {
      searchParams.append("scope", "organization");
    }
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

    // 🔑 Dedicated module normalizer that preserves progress and other fields
    const normalizeModule = (item: Record<string, unknown>) => ({
      ...item,
      id: String(item.id ?? item.module_id ?? ""),
      title: String(item.title ?? ""),
      description:
        (item.description as string | undefined) ||
        (item.about as string | undefined) ||
        "",
      progress: (item.progress as { percentage?: number } | undefined) ?? {
        percentage: 0,
      },
    });

    const normalize = (data: Record<string, unknown>): LearningPlan => ({
      id: String(data.id ?? data.course_id ?? data.learning_plan_id ?? ""),
      title: String(data.title ?? ""),
      ...data,
      description:
        (data.description as string | undefined) ||
        (data.about as string | undefined) ||
        "",
      modules: Array.isArray(data.modules)
        ? data.modules.map(normalizeModule) // 👈 Use normalizeModule here!
        : [],
      lessons: Array.isArray(data.lessons)
        ? data.lessons.map(normalizeLesson)
        : Array.isArray(data.modules)
          ? data.modules.map(normalizeLesson)
          : [],
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
