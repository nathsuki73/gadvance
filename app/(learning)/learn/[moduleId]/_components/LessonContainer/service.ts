import { Lesson } from "./Overview/types";
import { SubtopicItem } from "./SubTopic/Subtopic";

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

export async function fetchSubtopics(
  subtopicId: string,
): Promise<SubtopicItem[]> {
  console.log("subtopic: " + subtopicId);
  const response = await fetch(
    `${API_BASE_URL}/lessons/${subtopicId}/subtopic`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch subtopics: ${response.status}`,
    );
  }

  const payload = await response.json();

  // Assuming your API wraps the rows inside a 'data' array (e.g., payload.data = [...])
  // If your API returns the array directly as the top level, change this to: return payload;
  console.log(payload.data);
  return payload.data || [];
}
