/**
 * Fetches all block progress records for a given lesson to build layout checkmarks.
 */
export async function getLessonProgressAction(lessonId: string) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}/progress`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to load progress telemetry data");
    return await response.json();
  } catch (error) {
    console.error("Error fetching lesson progress layout states:", error);
    return { success: false, progress: {} };
  }
}
