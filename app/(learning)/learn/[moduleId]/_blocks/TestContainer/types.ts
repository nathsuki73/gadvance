export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  question: string;
  choices: Choice[];
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
