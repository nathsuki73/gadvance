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

// Updated to catch metadata properties coming over the API wire from Laravel
export interface LessonQuizResponse {
  success: boolean;
  id?: string;
  attempt_id?: string;
  current_index?: number;
  status?: "started" | "completed";
  score?: number;
  previously_saved_answers?: Record<string, string>;
  data: LessonQuizQuestionResponse[];
}

export interface Choice {
  id: string;
  text: string;
  votes?: number; // 👈 Add this
  percentage?: number;
}

export interface Question {
  id: string;
  question: string;
  choices: Choice[];
  correctAnswer: string;
}

// Updated so the hook can safely access tracking variables out of state hooks
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  attemptId?: string; // Linked attempt model primary UUID key string
  currentIndex?: number; // Current progress pointer index location location marker
  status?: "started" | "completed"; // Active vs submitted phase flag string
  previouslySavedAnswers?: Record<string, string>;
  score?: number; // Persisted correct answers aggregate counter metrics
}

export interface BackendOptionResponse {
  id: string;
  option_text: string;
  is_correct: boolean;
}

export interface BackendQuestionResponse {
  id: string;
  question_text: string;
  order_index: number;
  options: BackendOptionResponse[];
}

export interface SaveAnswerSuccessPayload {
  message: string;
  quiz_status: "started" | "completed";
  current_index?: number;
  score?: number;
  total?: number;
  questions?: BackendQuestionResponse[];
}

export interface SaveAnswerResponse {
  success: boolean;
  data?: SaveAnswerSuccessPayload;
  error?: string;
}
