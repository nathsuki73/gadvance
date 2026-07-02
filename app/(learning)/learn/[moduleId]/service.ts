const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export interface ModuleStructureItem {
  id: string;
  type: "pretest" | "lesson" | "posttest";
  title: string;
  order: number;
  description?: string;
}

export interface ModuleStructure {
  courseId: string;
  id: string;
  title: string;
  items: ModuleStructureItem[];
}

interface LaravelModuleStructure {
  learning_plan_id: string;
  id: string;
  title: string;
  items: ModuleStructureItem[];
}

export async function getModuleStructure(
  moduleId: string,
): Promise<ModuleStructure> {
  const response = await fetch(
    `${API_BASE_URL}/modules/${moduleId}/structure`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message ||
        `Failed to fetch module structure: ${response.status}`,
    );
  }

  const payload = await response.json();
  const laravelData: LaravelModuleStructure = payload.data;
  console.log(laravelData);
  return {
    courseId: laravelData.learning_plan_id,
    id: laravelData.id,
    title: laravelData.title,
    items: laravelData.items,
  };
}
