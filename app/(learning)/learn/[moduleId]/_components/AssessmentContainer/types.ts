export type AssessmentMode = "quiz" | "test" | "poll" | "survey";

export type BloomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
  percentage?: number;
  votes?: number; // 👈 Add this optional property
}

export interface Question {
  id: string;
  text: string;
  type?: "multiple_choice" | "single_choice" | string;
  points?: number;
  bloomLevel?: BloomLevel;
  explanation?: string;
  choices: Choice[];
  correctChoiceId?: string | null;
  isPoll?: boolean;
}

export interface AssessmentSettings {
  title: string;
  instructions?: string;
  type: AssessmentMode;
  passingScore: number;
  timeLimitMinutes?: number | null;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showFeedbackImmediately?: boolean;
  allowReview?: boolean;
  enableAdaptiveMapping?: boolean;
  showFinalResults?: boolean;
  showRemediation?: boolean;
  showAnswerStats?: boolean;
  status?: string;
}

export interface AssessmentViewData {
  id: string;
  title: string;
  instructions?: string;
  type: AssessmentMode;
  settings: AssessmentSettings;
  questions: Question[];
  updatedAt?: string;
  previous_attempt?: {
    score_percentage: number;
    answers?: Array<{ is_correct: boolean }>;
    remedial_suggestions?: Array<{
      page_id: string;
      block_id: string;
      review_url: string;
    }>;
  };
  user_has_completed?: boolean;
}
