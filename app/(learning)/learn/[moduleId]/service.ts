const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export interface SectionItem {
  id: string;
  section_id?: string;
  item_type: "page" | "assessment" | string;
  content_id?: string | null;
  title: string;
  order_index?: number;
  assessment_type?: string | null;
}

export interface Section {
  id: string;
  module_id?: string;
  title: string;
  description?: string | null;
  order_index?: number;
  items: SectionItem[];
}

export interface ModuleStructure {
  courseId: string;
  id: string;
  title: string;
  sections: Section[];
}

interface LaravelModuleData {
  learning_plan_id?: string;
  learning_plans?: Array<{ id: string }>;
  id: string;
  title: string;
  sections?: Section[];
}

export async function getModuleStructure(
  moduleId: string,
): Promise<ModuleStructure> {
  const response = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message ||
        `Failed to fetch module structure: ${response.status}`,
    );
  }

  const payload = await response.json();
  const laravelData: LaravelModuleData = payload.data;

  // Resolve courseId / learning_plan_id safely from relationship or payload
  const courseId =
    laravelData.learning_plan_id || laravelData.learning_plans?.[0]?.id || "";

  return {
    courseId,
    id: laravelData.id,
    title: laravelData.title,
    sections: laravelData.sections || [],
  };
}
