import type { StaticTest, LaravelQuizResponse, Question } from "./types";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export async function fetchStaticTest(
  moduleId: string,
  type: "pre_test" | "post_test" = "pre_test",
): Promise<StaticTest> {
  const response = await fetch(
    `${API_BASE_URL}/modules/${moduleId}/static-test?type=${type}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to fetch quiz: ${response.status}`,
    );
  }

  const payload: LaravelQuizResponse = await response.json();
  const serverData = payload.data;

  const formattedQuestions: Question[] = serverData.questions.map((q) => {
    const choices = Object.entries(q.options).map(([key, value]) => ({
      id: key,
      text: value,
    }));

    return {
      id: String(q.id),
      question: q.question_text,
      choices: choices,
    };
  });

  return {
    id: serverData.test_id,
    title: `${serverData.test_type === "pre_test" ? "Pre-Test" : "Post-Test"} Assessment`,
    description: "SUCCESSS",
    questions: formattedQuestions,
  };
}
