export type AssessmentMode = "quiz" | "test" | "poll" | "survey";

export type BloomLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface Choice {
  id: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
  percentage?: number;
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
}
