export type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  choices: Choice[];
  correctAnswer: string;
}

export interface StaticTest {
  id: string;
  attemptId?: string;
  title: string;
  description: string;
  questions: Question[];
  currentIndex?: number;
  previouslySavedAnswers?: UserAnswers;
}

export interface QuizResult {
  score: number;
  total: number;
  passed: boolean;
}

export type UserAnswers = Record<string, string>;

// ------------------- FETCH DATA TYPE ----------------------

export interface LaravelQuizResponse {
  status: string;
  data: {
    attempt_id: string;
    test_id: string;
    test_type: "pre_test" | "post_test";
    description: string;
    current_index: number;
    previously_saved_answers: Record<string, string>; // Added: Map of question_id -> selected_choice_id
    questions: Array<{
      id: string | number; // Safe lookup handling for both integer or string UUID types
      lesson_id: number | null;
      question_text: string;
      options: Record<string, string>; // e.g., {"A": "Option text", "B": "Another option text"}
      correct_answer: string;
    }>;
  };
}
