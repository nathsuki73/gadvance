import { LaravelLessonResponse, Lesson } from "./types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function fetchLessons(moduleId: string): Promise<Lesson[]> {
  const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/lessons`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || `Failed to fetch lessons: ${response.status}`,
    );
  }

  const payload: LaravelLessonResponse = await response.json();

  return payload.data.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
  }));
}
