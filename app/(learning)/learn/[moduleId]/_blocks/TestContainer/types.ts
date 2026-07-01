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
  title: string;
  description: string;
  questions: Question[];
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
    test_id: string;
    test_type: "pre_test" | "post_test";
    module_id: string;
    questions: Array<{
      id: number;
      lesson_id: number;
      question_text: string;
      options: Record<string, string>;
      correct_answer: string;
    }>;
  };
}
