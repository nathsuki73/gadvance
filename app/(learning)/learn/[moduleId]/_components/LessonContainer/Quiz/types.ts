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

export interface LessonQuizResponse {
  success: boolean;
  data: LessonQuizQuestionResponse[];
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

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}
