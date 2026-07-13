export interface LessonQuizOptionResponse {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonQuizQuestionResponse {
  id: string;
  lesson_block_id: string;
  question_text: string;
  type: "multiple_choice";
  order_index: number;
  created_at: string;
  updated_at: string;
  options: LessonQuizOptionResponse[];
}

// 🟢 UPGRADED: Captures the inner tracking object structures returned by the backend
export interface MiniQuizAttemptData {
  attempt_id: string;
  current_index: number;
  status: "started" | "completed";
  previously_saved_answers: Record<string, string>;
  score: number;
  questions: LessonQuizQuestionResponse[];
}

// 🟢 UPGRADED: Handles both raw arrays and nested metadata tracking response payloads
export interface LessonQuizResponse {
  success: boolean;
  data: LessonQuizQuestionResponse[] | MiniQuizAttemptData;
}

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

// 🟢 UPGRADED: Holds persistence fields so your frontend hooks can read them easily
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];

  // Optional parameters to ensure backwards compatibility with older static files
  attemptId?: string;
  attempt_id?: string;
  currentIndex?: number;
  status?: "started" | "completed";
  previouslySavedAnswers?: Record<string, string>;
  score?: number;
}
