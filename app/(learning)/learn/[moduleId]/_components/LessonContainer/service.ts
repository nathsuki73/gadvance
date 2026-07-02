import { Lesson } from "./Overview/types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function fetchOverview(lessonId: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/overview`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || `Failed to fetch overview: ${response.status}`,
    );
  }

  const payload = await response.json();
  return [
    {
      description: payload.data.description,
      // Add other fields required by the 'Lesson' type here
    },
  ];
}
