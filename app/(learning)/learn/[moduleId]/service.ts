const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export interface ModuleStructureItem {
  id: string;
  type: "pretest" | "lesson" | "posttest";
  title: string;
  order: number;
}

export interface ModuleStructure {
  id: string;
  title: string;
  items: ModuleStructureItem[];
}

interface LaravelModuleStructureResponse {
  success: boolean;
  data: ModuleStructure;
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

  const payload: LaravelModuleStructureResponse = await response.json();

  return payload.data;
}
